import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { AUTO_PUBLISH, IMAGE_TARGET, PAGE_PLAN, indiaDateParts, slotFor } from "./automationConfig";
import { assignCandidatesToPages, collectVerifiedCandidates, generateEditorialImage, writePagePackage } from "./automationOpenAI";

const RUN_TABLE = "newsroom_automation_runs";

function nowIso() { return new Date().toISOString(); }

async function updateRun(supabase, id, patch) {
  const { data, error } = await supabase.from(RUN_TABLE).update({ ...patch, updated_at: nowIso() }).eq("id", id).select("*").single();
  if (error) throw new Error(`Automation run update failed: ${error.message}`);
  return data;
}

async function log(supabase, runId, level, message, details = null) {
  await supabase.from("newsroom_automation_logs").insert({ run_id: runId, level, message, details });
}

export async function ensureDailyRun({ force = false } = {}) {
  const supabase = createSupabaseAdmin();
  const { publicationDate, newsDate } = indiaDateParts();
  const { data: existing } = await supabase.from(RUN_TABLE).select("*").eq("publication_date", publicationDate).maybeSingle();
  if (existing && !force) {
    // A transient serverless/API failure must not leave the next morning's
    // edition permanently stuck. Resume from the saved stage without
    // discarding completed English/Hindi pages.
    if (["failed", "paused"].includes(String(existing.status || "").toLowerCase())) {
      const resumed = await updateRun(supabase, existing.id, {
        status: "queued",
        errors: Array.isArray(existing.errors) ? existing.errors : [],
      });
      await log(supabase, existing.id, "warning", `Daily newsroom run automatically resumed from ${existing.stage}.`);
      return resumed;
    }
    return existing;
  }
  if (existing && force) {
    return updateRun(supabase, existing.id, {
      status: "queued", stage: "collect", current_page: 1, current_language: "ENGLISH",
      candidates: null, assigned_stories: null, image_index: 0, errors: [], stats: {}, completed_at: null,
    });
  }
  const { data, error } = await supabase.from(RUN_TABLE).insert({
    publication_date: publicationDate,
    news_date: newsDate,
    status: "queued",
    stage: "collect",
    current_page: 1,
    current_language: "ENGLISH",
    auto_publish: AUTO_PUBLISH,
  }).select("*").single();
  if (error) throw new Error(`Could not create automation run: ${error.message}`);
  await log(supabase, data.id, "info", `Daily newsroom run created for ${publicationDate}.`);
  return data;
}

async function createEditionStable(supabase, run, language) {
  const base = {
    publication_date: run.publication_date,
    news_date: run.news_date,
    edition_name: "National Edition",
    language,
    title: `THE ASPIRE NATION — ${run.publication_date}`,
    status: "automation",
    updated_at: nowIso(),
  };
  const attempts = [base, { ...base, updated_at: undefined }, {
    publication_date: run.publication_date, edition_name: "National Edition", language,
    title: `THE ASPIRE NATION — ${run.publication_date}`, status: "automation",
  }];
  let lastError;
  for (const candidate of attempts) {
    const payload = Object.fromEntries(Object.entries(candidate).filter(([, value]) => value !== undefined));
    const { data, error } = await supabase.from("news_editions").upsert(payload, { onConflict: "publication_date,language,edition_name" }).select("*").single();
    if (!error && data) return data;
    lastError = error;
  }
  throw new Error(`Could not create ${language} edition: ${lastError?.message || "unknown error"}`);
}

async function savePageArticles(supabase, editionId, language, page, packages) {
  const storyRows = (Array.isArray(packages) ? packages : []).map((article, index) => ({
    edition_id: editionId,
    story_id: article.story_id,
    page: Number(page),
    slot: slotFor(Number(page), index, article.editorial_role),
    display_order: index + 1,
    section: article.section || PAGE_PLAN[page]?.title,
    headline: article.headline,
    deck: article.deck,
    body: article.body,
    fact_box: article.fact_box,
    exam_connection: article.exam_connection,
    caption: article.caption,
    visual_prompt: article.visual_prompt,
    visual_type: article.visual_type,
    source_name: article.source_name,
    source_url: article.source_url,
    image_credit: null,
    is_premium: Number(page) > 1,
    is_deleted: false,
  }));
  const { error: deleteError } = await supabase.from("news_articles").delete().eq("edition_id", editionId).eq("page", Number(page));
  if (deleteError) throw new Error(`Could not clear ${language} Page ${page}: ${deleteError.message}`);

  const attempts = [
    storyRows,
    storyRows.map(({ visual_prompt, visual_type, display_order, ...row }) => row),
    storyRows.map(({ visual_prompt, visual_type, display_order, is_deleted, ...row }) => row),
  ];
  let lastError;
  for (const rows of attempts) {
    const { error } = await supabase.from("news_articles").insert(rows);
    if (!error) return rows.length;
    lastError = error;
  }
  throw new Error(`Could not save ${language} Page ${page}: ${lastError?.message || "unknown error"}`);
}

function pageStories(run, page) {
  return (run.assigned_stories || []).filter((item) => Number(item.page) === Number(page)).slice(0, PAGE_PLAN[page]?.count || 6);
}

async function selectImageArticles(supabase, run) {
  const { data, error } = await supabase.from("news_articles").select("*").eq("edition_id", run.english_edition_id);
  if (error) throw error;
  return (data || []).filter((a) => !a.is_deleted && !a.image_url).sort((a, b) => {
    const score = (x) => (Number(x.page) === 1 ? 1000 : 0) + (/hero|lead|major/.test(String(x.slot)) ? 500 : 0) - Number(x.display_order || 99);
    return score(b) - score(a);
  }).slice(0, IMAGE_TARGET);
}

async function generateNextImages(supabase, run, batchSize = 2) {
  const selected = await selectImageArticles(supabase, run);
  const start = Number(run.image_index || 0);
  const batch = selected.slice(start, start + batchSize);
  if (!batch.length) return { finished: true, generated: 0 };
  let generated = 0;
  for (const article of batch) {
    try {
      let buffer = null;
      let imageError = null;
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          buffer = await generateEditorialImage({ article, language: "ENGLISH" });
          break;
        } catch (error) {
          imageError = error;
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 2500));
        }
      }
      if (!buffer) throw imageError || new Error("Image generation failed after retry.");
      const bucket = process.env.NEWSROOM_IMAGE_BUCKET || "news-images";
      const safeStory = String(article.story_id || article.id).replace(/[^a-zA-Z0-9_-]/g, "-");
      const filePath = `${run.publication_date}/${safeStory}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, buffer, { contentType: "image/png", cacheControl: "31536000", upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const imageUrl = publicData?.publicUrl;
      if (!imageUrl) throw new Error("No public image URL returned.");
      await supabase.from("news_articles").update({ image_url: imageUrl, image_credit: "AI-generated editorial visual" }).eq("id", article.id);
      await supabase.from("news_articles").update({ image_url: imageUrl, image_credit: "AI-generated editorial visual" }).eq("edition_id", run.hindi_edition_id).eq("story_id", article.story_id);
      generated += 1;
    } catch (error) {
      await log(supabase, run.id, "warning", `Image generation failed for ${article.story_id}.`, { error: error.message });
    }
  }
  await updateRun(supabase, run.id, { image_index: start + batch.length });
  return { finished: start + batch.length >= selected.length, generated };
}

async function validateRun(supabase, run) {
  const results = {};
  let valid = true;
  for (const [language, editionId] of [["ENGLISH", run.english_edition_id], ["HINDI", run.hindi_edition_id]]) {
    const { data, error } = await supabase.from("news_articles").select("id,page,headline,body,source_url,image_url,is_deleted").eq("edition_id", editionId);
    if (error) throw error;
    const active = (data || []).filter((a) => !a.is_deleted);
    const pages = new Set(active.map((a) => Number(a.page)));
    const missingPages = Array.from({ length: 8 }, (_, i) => i + 1).filter((page) => !pages.has(page));
    const broken = active.filter((a) => !a.headline || !a.body || !a.source_url).length;
    const imageCount = active.filter((a) => a.image_url).length;
    results[language] = { stories: active.length, missingPages, incompleteStories: broken, images: imageCount };
    if (missingPages.length || broken || active.length < 30 || imageCount < 6) valid = false;
  }
  return { valid, results };
}

async function publishBoth(supabase, run) {
  const publishedAt = nowIso();
  for (const editionId of [run.english_edition_id, run.hindi_edition_id]) {
    const { data, error } = await supabase
      .from("news_editions")
      .update({
        status: "published",
        is_published: true,
        approved_at: publishedAt,
        published_at: publishedAt,
        live_at: publishedAt,
        updated_at: publishedAt,
      })
      .eq("id", editionId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      throw new Error(
        `Could not publish edition ${editionId}: ${error?.message || "row not updated"}`
      );
    }
  }
  return publishedAt;
}

export async function processNextAutomationStep() {
  const supabase = createSupabaseAdmin();
  const { data: run, error } = await supabase.from(RUN_TABLE).select("*").in("status", ["queued", "running", "ready_to_publish"]).order("publication_date", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  if (!run) return { idle: true, message: "No pending automation run." };

  try {
    await updateRun(supabase, run.id, { status: "running", started_at: run.started_at || nowIso() });

    if (run.stage === "collect") {
      const candidates = await collectVerifiedCandidates(run.news_date);
      if (candidates.length < 8) throw new Error(`Only ${candidates.length} verified candidates were collected; at least 8 are required.`);
      const assigned = await assignCandidatesToPages(candidates, run.news_date);
      if (!Array.isArray(assigned) || assigned.length < 30) throw new Error(`Only ${assigned?.length || 0} editorial units were assigned; at least 30 are required.`);
      const english = await createEditionStable(supabase, run, "ENGLISH");
      const hindi = await createEditionStable(supabase, run, "HINDI");
      await updateRun(supabase, run.id, { candidates, assigned_stories: assigned, english_edition_id: english.id, hindi_edition_id: hindi.id, stage: "write", current_language: "ENGLISH", current_page: 1 });
      await log(supabase, run.id, "info", `${assigned.length} verified stories assigned across eight pages.`);
      return { stage: "collect", candidates: candidates.length, assigned: assigned.length };
    }

    if (run.stage === "write") {
      const language = run.current_language || "ENGLISH";
      const page = Number(run.current_page || 1);
      const stories = pageStories(run, page);
      if (!stories.length) throw new Error(`No assigned stories for ${language} Page ${page}.`);
      const packages = await writePagePackage({ assignedStories: stories, page, language, newsDate: run.news_date, publicationDate: run.publication_date });
      const editionId = language === "HINDI" ? run.hindi_edition_id : run.english_edition_id;
      const saved = await savePageArticles(supabase, editionId, language, page, packages);
      let nextLanguage = language;
      let nextPage = page + 1;
      let nextStage = "write";
      if (nextPage > 8 && language === "ENGLISH") { nextLanguage = "HINDI"; nextPage = 1; }
      else if (nextPage > 8 && language === "HINDI") { nextStage = "images"; nextPage = 1; }
      await updateRun(supabase, run.id, { stage: nextStage, current_language: nextLanguage, current_page: nextPage });
      await log(supabase, run.id, "info", `${language} Page ${page} completed with ${saved} stories.`);
      return { stage: "write", language, page, saved };
    }

    if (run.stage === "images") {
      const result = await generateNextImages(supabase, run, 2);
      if (result.finished) await updateRun(supabase, run.id, { stage: "validate" });
      return { stage: "images", ...result };
    }

    if (run.stage === "validate") {
      const validation = await validateRun(supabase, run);
      if (!validation.valid) {
        await updateRun(supabase, run.id, { status: "needs_review", stage: "needs_review", stats: validation.results, errors: ["Validation failed. Open the automation dashboard."] });
        await log(supabase, run.id, "error", "Daily edition validation failed.", validation.results);
        return { stage: "validate", valid: false, results: validation.results };
      }
      await updateRun(supabase, run.id, { status: "ready_to_publish", stage: "publish", stats: validation.results });
      return { stage: "validate", valid: true, results: validation.results };
    }

    if (run.stage === "publish") {
      if (!run.auto_publish) return { stage: "publish", waitingForApproval: true };
      const publishedAt = await publishBoth(supabase, run);
      await updateRun(supabase, run.id, { status: "published", stage: "completed", completed_at: publishedAt });
      await log(supabase, run.id, "info", "English and Hindi editions published automatically.");
      return { stage: "publish", published: true, publishedAt, englishEditionId: run.english_edition_id, hindiEditionId: run.hindi_edition_id };
    }

    return { idle: true, message: `No handler for stage ${run.stage}.` };
  } catch (error) {
    const errors = Array.isArray(run.errors) ? [...run.errors] : [];
    errors.push({ at: nowIso(), stage: run.stage, message: error.message });
    await updateRun(supabase, run.id, { status: "failed", errors });
    await log(supabase, run.id, "error", error.message, { stage: run.stage });
    throw error;
  }
}

export async function publishReadyAutomationRun() {
  const supabase = createSupabaseAdmin();
  const { data: run, error } = await supabase.from(RUN_TABLE).select("*").eq("status", "ready_to_publish").order("publication_date", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  if (!run) return { published: false, message: "No validated edition is ready." };
  const publishedAt = await publishBoth(supabase, run);
  await updateRun(supabase, run.id, { status: "published", stage: "completed", completed_at: publishedAt });
  return { published: true, publishedAt, englishEditionId: run.english_edition_id, hindiEditionId: run.hindi_edition_id };
}
