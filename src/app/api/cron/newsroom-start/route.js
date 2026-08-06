import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/newsroom/automationAuth";
import { ensureDailyRun } from "@/lib/newsroom/automationPipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  const auth = verifyCronRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  try {
    const run = await ensureDailyRun();
    return NextResponse.json({ ok: true, runId: run.id, publicationDate: run.publication_date, newsDate: run.news_date, status: run.status, stage: run.stage });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not start daily newsroom." }, { status: 500 });
  }
}
