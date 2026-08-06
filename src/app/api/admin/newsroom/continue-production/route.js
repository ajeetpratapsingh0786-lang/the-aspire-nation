import { NextResponse } from "next/server";
import { processNextAutomationStep } from "@/lib/newsroom/automationPipeline";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST() {
  const started = Date.now();
  const results = [];

  try {
    // Process multiple safe units per request. The browser controller calls this
    // endpoint again automatically until the complete bilingual edition ends.
    for (let i = 0; i < 2 && Date.now() - started < 240_000; i += 1) {
      const result = await processNextAutomationStep();
      results.push(result);

      if (
        result?.idle ||
        result?.published ||
        result?.waitingForApproval ||
        result?.valid === false
      ) {
        break;
      }
    }

    const last = results.at(-1) || null;
    const finished = Boolean(
      last?.idle ||
      last?.published ||
      last?.waitingForApproval ||
      last?.valid === false
    );

    return NextResponse.json({
      ok: true,
      stepsCompleted: results.length,
      finished,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        stepsCompleted: results.length,
        finished: true,
        results,
        error: error?.message || "Continuous newsroom production failed.",
      },
      { status: 500 }
    );
  }
}
