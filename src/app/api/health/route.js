import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "CRON_SECRET",
  ];
  const missing = required.filter((name) => !process.env[name]);
  const healthy = missing.length === 0;

  return NextResponse.json(
    {
      ok: healthy,
      service: "the-aspire-nation",
      release: "1.0-rc1",
      checkedAt: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      configuration: healthy ? "ready" : "incomplete",
      missingCount: missing.length,
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
