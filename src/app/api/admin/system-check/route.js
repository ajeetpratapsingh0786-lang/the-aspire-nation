import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyCronRequest } from "@/lib/newsroom/automationAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = verifyCronRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });

  const checks = {
    environment: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      openaiApiKey: Boolean(process.env.OPENAI_API_KEY),
      cronSecret: Boolean(process.env.CRON_SECRET),
      siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    },
    database: {},
    storage: {},
  };

  try {
    const supabase = createSupabaseAdmin();
    for (const table of ["news_editions", "news_articles", "newsroom_automation_runs", "newsroom_automation_logs", "saved_articles", "article_notes"]) {
      const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
      checks.database[table] = error ? { ok: false, error: error.message } : { ok: true };
    }
    const bucket = process.env.NEWSROOM_IMAGE_BUCKET || "news-images";
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    checks.storage[bucket] = bucketError
      ? { ok: false, error: bucketError.message }
      : { ok: (buckets || []).some((item) => item.name === bucket) };
  } catch (error) {
    checks.database.connection = { ok: false, error: error.message };
  }

  const environmentOk = Object.values(checks.environment).every(Boolean);
  const databaseOk = Object.values(checks.database).every((item) => item?.ok !== false);
  const storageOk = Object.values(checks.storage).every((item) => item?.ok === true);
  return NextResponse.json({ ok: environmentOk && databaseOk && storageOk, checkedAt: new Date().toISOString(), checks });
}
