import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/newsroom/automationAuth";
import { processNextAutomationStep } from "@/lib/newsroom/automationPipeline";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = verifyCronRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const started = Date.now();
  const results = [];
  try {
    // Complete more than one small stage per invocation while leaving a safety
    // margin below the serverless timeout. This makes the 16-page bilingual
    // workflow finish within the morning cron window.
    for (let i = 0; i < 2 && Date.now() - started < 240_000; i += 1) {
      const result = await processNextAutomationStep();
      results.push(result);
      if (result?.idle || result?.published || result?.waitingForApproval || result?.valid === false) break;
    }
    return NextResponse.json({ ok: true, stepsCompleted: results.length, results });
  } catch (error) {
    return NextResponse.json({ ok: false, stepsCompleted: results.length, results, error: error.message || "Automation worker failed." }, { status: 500 });
  }
}
