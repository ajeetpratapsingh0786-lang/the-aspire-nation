import { NextResponse } from "next/server";
import { ensureDailyRun } from "@/lib/newsroom/automationPipeline";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const run = await ensureDailyRun({ force: Boolean(body?.force) });

    return NextResponse.json({
      ok: true,
      run: {
        id: run.id,
        publicationDate: run.publication_date,
        newsDate: run.news_date,
        status: run.status,
        stage: run.stage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not start newsroom production." },
      { status: 500 }
    );
  }
}
