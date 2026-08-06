import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser } from "@/lib/serverAuth";
import { loadLatestCanonicalNewsroomRun } from "@/lib/newsroom/newsroomState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_TABLES = [
  "news_editions",
  "news_articles",
  "newsroom_automation_runs",
  "newsroom_automation_logs",
  "user_subscriptions",
  "payments",
  "saved_articles",
  "article_notes",
];

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

const PLACEHOLDER_PATTERN = /AI EDITORIAL VISUAL|USE CREATE AI IMAGES ABOVE|GENERATE THE FINAL VISUAL|PLACEHOLDER/i;

function isAdminEmail(email) {
  const configured = String(process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  return Boolean(configured && String(email || "").toLowerCase() === configured);
}

function result(ok, label, detail = "") {
  return { ok: Boolean(ok), label, detail };
}

export async function GET(request) {
  try {
    const { user, error: authError } = await getRequestUser(request);
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: authError || "Authentication required." }, { status: 401 });
    }
    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ ok: false, error: "Administrator access required." }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();
    const checks = [];

    for (const name of REQUIRED_ENV) {
      checks.push(result(Boolean(process.env[name]), `Environment: ${name}`, process.env[name] ? "Configured" : "Missing"));
    }

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
      checks.push(result(!error, `Database table: ${table}`, error?.message || "Available"));
    }

    const bucket = process.env.NEWSROOM_IMAGE_BUCKET || "news-images";
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const bucketFound = !bucketError && (buckets || []).some((item) => item.name === bucket);
    checks.push(result(bucketFound, `Storage bucket: ${bucket}`, bucketError?.message || (bucketFound ? "Available" : "Missing")));

    const { data: editions, error: editionError } = await supabase
      .from("news_editions")
      .select("id,publication_date,language,status,is_published,published_at")
      .order("publication_date", { ascending: false })
      .order("language", { ascending: true })
      .limit(8);
    checks.push(result(!editionError, "Edition query", editionError?.message || "Working"));

    const latestDate = editions?.[0]?.publication_date || null;
    const latestEditions = latestDate ? (editions || []).filter((item) => item.publication_date === latestDate) : [];
    const english = latestEditions.find((item) => item.language === "ENGLISH");
    const hindi = latestEditions.find((item) => item.language === "HINDI");
    checks.push(result(Boolean(english), "Latest English edition", english ? `${english.status} · ${latestDate}` : "Missing"));
    checks.push(result(Boolean(hindi), "Latest Hindi edition", hindi ? `${hindi.status} · ${latestDate}` : "Missing"));

    const editionIds = latestEditions.map((item) => item.id);
    let articles = [];
    if (editionIds.length) {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id,edition_id,page,headline,body,image_url,source_url,is_deleted")
        .in("edition_id", editionIds);
      articles = (data || []).filter((item) => !item.is_deleted);
      checks.push(result(!error, "Latest edition articles", error?.message || `${articles.length} article records`));
    }

    for (const edition of latestEditions) {
      const editionArticles = articles.filter((item) => item.edition_id === edition.id);
      const pages = new Set(editionArticles.map((item) => Number(item.page)).filter(Boolean));
      const placeholders = editionArticles.filter((item) => PLACEHOLDER_PATTERN.test(`${item.headline || ""} ${item.body || ""}`));
      const emptyStories = editionArticles.filter((item) => !String(item.headline || "").trim() || !String(item.body || "").trim());
      checks.push(result(pages.size === 8, `${edition.language}: eight populated pages`, `${pages.size}/8 pages`));
      checks.push(result(editionArticles.length >= 45, `${edition.language}: story density`, `${editionArticles.length} stories`));
      checks.push(result(placeholders.length === 0, `${edition.language}: no production placeholders`, placeholders.length ? `${placeholders.length} found` : "Clear"));
      checks.push(result(emptyStories.length === 0, `${edition.language}: no empty stories`, emptyStories.length ? `${emptyStories.length} found` : "Clear"));
    }

    const latestRun = await loadLatestCanonicalNewsroomRun();
    const runHealthy = !latestRun || !["failed"].includes(String(latestRun.display_status || latestRun.status || "").toLowerCase());
    checks.push(result(runHealthy, "Automation state", latestRun ? `${latestRun.display_status || latestRun.status} · ${latestRun.display_stage || latestRun.stage}` : "No active run"));

    const criticalLabels = ["Environment:", "Database table:", "Storage bucket:", "Edition query"];
    const criticalFailures = checks.filter((item) => !item.ok && criticalLabels.some((prefix) => item.label.startsWith(prefix)));
    const allFailures = checks.filter((item) => !item.ok);
    const score = Math.max(0, Math.round(((checks.length - allFailures.length) / Math.max(1, checks.length)) * 100));

    return NextResponse.json({
      ok: criticalFailures.length === 0,
      launchReady: allFailures.length === 0,
      score,
      checkedAt: new Date().toISOString(),
      latestDate,
      latestEditions,
      latestRun,
      checks,
      criticalFailures: criticalFailures.length,
      warnings: allFailures.length - criticalFailures.length,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "Launch readiness check failed." }, { status: 500 });
  }
}
