import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureDailyRun } from "@/lib/newsroom/automationPipeline";

const RUN_TABLE = "newsroom_automation_runs";
const LOCK_TABLE = "newsroom_automation_locks";
const LOCK_NAME = "daily-newspaper-production";

function nowIso() {
  return new Date().toISOString();
}

async function latestRun(supabase) {
  const { data, error } = await supabase
    .from(RUN_TABLE)
    .select("*")
    .order("publication_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function releaseAnyProductionLock(supabase) {
  const { error } = await supabase
    .from(LOCK_TABLE)
    .update({ owner: null, locked_until: null, updated_at: nowIso() })
    .eq("lock_name", LOCK_NAME);
  if (error) throw new Error(`Could not release production lock: ${error.message}`);
}

async function logControl(supabase, runId, message, details = {}) {
  if (!runId) return;
  const { error } = await supabase.from("newsroom_automation_logs").insert({
    run_id: runId,
    level: "info",
    message,
    details,
  });
  if (error) console.error("Could not save newsroom control log:", error.message);
}

async function clearEditionContent(supabase, run) {
  const ids = [run?.english_edition_id, run?.hindi_edition_id].filter(Boolean);
  if (!ids.length) return;

  const { error: articlesError } = await supabase
    .from("news_articles")
    .delete()
    .in("edition_id", ids);
  if (articlesError) throw new Error(`Could not clear old edition articles: ${articlesError.message}`);

  // Keep the edition rows/IDs stable so links and database relationships do not
  // unexpectedly change. Fresh production repopulates these same edition rows.
  const { error: editionsError } = await supabase
    .from("news_editions")
    .update({
      status: "automation",
      is_published: false,
      approved_at: null,
      published_at: null,
      live_at: null,
      updated_at: nowIso(),
    })
    .in("id", ids);
  if (editionsError) {
    // Some older schemas do not include every optional publication column.
    const { error: fallbackError } = await supabase
      .from("news_editions")
      .update({ status: "automation", is_published: false })
      .in("id", ids);
    if (fallbackError) throw new Error(`Could not reset edition rows: ${fallbackError.message}`);
  }
}

async function resetRunFresh(supabase, run, reason) {
  if (!run?.id) {
    const created = await ensureDailyRun({ force: true });
    await releaseAnyProductionLock(supabase);
    return created;
  }

  if (run.status === "published") {
    throw new Error("A published edition cannot be destroyed. Archive it for history and allow the next publication date to create a new edition.");
  }

  await clearEditionContent(supabase, run);

  const { data, error } = await supabase
    .from(RUN_TABLE)
    .update({
      status: "queued",
      stage: "collect",
      current_page: 1,
      current_language: "ENGLISH",
      candidates: null,
      assigned_stories: null,
      image_index: 0,
      errors: [],
      stats: {},
      started_at: null,
      completed_at: null,
      updated_at: nowIso(),
    })
    .eq("id", run.id)
    .select("*")
    .single();
  if (error) throw new Error(`Could not restart the edition: ${error.message}`);

  await releaseAnyProductionLock(supabase);
  await logControl(supabase, run.id, reason, { requestedAt: nowIso() });
  return data;
}

export async function controlNewsroomProduction(action) {
  const supabase = createSupabaseAdmin();
  const run = await latestRun(supabase);

  if (action === "cancel") {
    if (!run) return { action, run: null, message: "There is no current edition to cancel." };
    if (run.status === "published") throw new Error("Published editions cannot be cancelled.");

    const { data, error } = await supabase
      .from(RUN_TABLE)
      .update({
        status: "cancelled",
        stage: "cancelled",
        completed_at: nowIso(),
        updated_at: nowIso(),
      })
      .eq("id", run.id)
      .select("*")
      .single();
    if (error) throw error;
    await releaseAnyProductionLock(supabase);
    await logControl(supabase, run.id, "Edition cancelled by the Editor-in-Chief.");
    return { action, run: data, message: "Current production cancelled safely." };
  }

  if (action === "restart_fresh") {
    const data = await resetRunFresh(supabase, run, "Edition restarted fresh from news collection.");
    return { action, run: data, message: "Fresh production queued from news collection." };
  }

  if (action === "force_new_morning") {
    const data = await resetRunFresh(supabase, run, "Force New Morning requested. Previous incomplete production was discarded.");
    return { action, run: data, message: "New morning production queued from collection." };
  }

  if (action === "new_edition") {
    if (!run) {
      const data = await ensureDailyRun({ force: false });
      await releaseAnyProductionLock(supabase);
      return { action, run: data, message: "Today's edition created and queued." };
    }

    if (["cancelled", "archived"].includes(run.status)) {
      const data = await resetRunFresh(supabase, run, "New edition created after the previous run was closed.");
      return { action, run: data, message: "New edition queued for today's publication date." };
    }

    throw new Error("An edition for the current publication date already exists. Use Restart Fresh to replace an incomplete edition, or Cancel/Archive it first.");
  }

  if (action === "archive") {
    if (!run) return { action, run: null, message: "There is no edition to archive." };
    if (run.status === "published") throw new Error("Published editions already belong to the public archive and should not be changed here.");

    const ids = [run.english_edition_id, run.hindi_edition_id].filter(Boolean);
    if (ids.length) {
      const { error: editionError } = await supabase
        .from("news_editions")
        .update({ status: "archived", is_published: false, updated_at: nowIso() })
        .in("id", ids);
      if (editionError) {
        const { error: fallbackError } = await supabase
          .from("news_editions")
          .update({ status: "archived", is_published: false })
          .in("id", ids);
        if (fallbackError) throw fallbackError;
      }
    }

    const { data, error } = await supabase
      .from(RUN_TABLE)
      .update({ status: "archived", stage: "archived", completed_at: nowIso(), updated_at: nowIso() })
      .eq("id", run.id)
      .select("*")
      .single();
    if (error) throw error;
    await releaseAnyProductionLock(supabase);
    await logControl(supabase, run.id, "Edition archived without publication.");
    return { action, run: data, message: "Edition archived safely." };
  }

  throw new Error("Unknown newsroom control action.");
}
