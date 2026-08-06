import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const STALE_RUN_MS = 15 * 60 * 1000;

function isPublishedEdition(edition) {
  return Boolean(
    edition &&
      (edition.status === "published" || edition.is_published === true)
  );
}

function isStaleRun(run) {
  if (!run || run.status !== "running") return false;
  const timestamp = run.updated_at || run.started_at || run.created_at;
  if (!timestamp) return false;
  return Date.now() - new Date(timestamp).getTime() > STALE_RUN_MS;
}

function editionForLanguage(run, editions, language) {
  const linkedId =
    language === "ENGLISH" ? run.english_edition_id : run.hindi_edition_id;

  return (
    editions.find((edition) => linkedId && edition.id === linkedId) ||
    editions.find(
      (edition) =>
        edition.publication_date === run.publication_date &&
        edition.language === language
    ) ||
    null
  );
}

export function normalizeRun(run, editions = []) {
  if (!run) return null;

  const englishEdition = editionForLanguage(run, editions, "ENGLISH");
  const hindiEdition = editionForLanguage(run, editions, "HINDI");
  const englishPublished = isPublishedEdition(englishEdition);
  const hindiPublished = isPublishedEdition(hindiEdition);
  const bothPublished = englishPublished && hindiPublished;
  const stale = isStaleRun(run);

  let displayStatus = run.status;
  let displayStage = run.stage;
  let canResume = false;

  if (bothPublished) {
    displayStatus = "published";
    displayStage = "completed";
  } else if (stale) {
    displayStatus = "paused";
    canResume = true;
  } else if (run.status === "queued") {
    displayStatus = "paused";
    canResume = true;
  } else if (run.status === "failed") {
    canResume = true;
  } else if (run.status === "running") {
    displayStatus = "running";
  }

  if (run.status === "published" && !bothPublished) {
    displayStatus = "needs_attention";
    canResume = true;
  }

  return {
    ...run,
    display_status: displayStatus,
    display_stage: displayStage,
    is_stale: stale,
    can_resume: canResume,
    english_edition: englishEdition,
    hindi_edition: hindiEdition,
    english_published: englishPublished,
    hindi_published: hindiPublished,
    both_published: bothPublished,
  };
}

export async function loadCanonicalNewsroomRuns(limit = 14) {
  const supabase = createSupabaseAdmin();

  const { data: runs, error: runsError } = await supabase
    .from("newsroom_automation_runs")
    .select("*")
    .order("publication_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (runsError) throw runsError;
  if (!runs?.length) return [];

  const publicationDates = [...new Set(runs.map((run) => run.publication_date))];
  const { data: editions, error: editionsError } = await supabase
    .from("news_editions")
    .select(
      "id,publication_date,language,status,is_published,published_at,approved_at,updated_at"
    )
    .in("publication_date", publicationDates);

  if (editionsError) throw editionsError;

  return runs.map((run) => normalizeRun(run, editions || []));
}

export async function loadLatestCanonicalNewsroomRun() {
  const runs = await loadCanonicalNewsroomRuns(1);
  return runs[0] || null;
}
