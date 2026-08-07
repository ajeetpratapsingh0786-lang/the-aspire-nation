import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/newsroom/automationAuth";
import {
  ensureDailyRun,
  processNextAutomationStep,
} from "@/lib/newsroom/automationPipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function indiaClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return { hour: get("hour"), minute: get("minute") };
}

function insideProductionWindow(now = new Date()) {
  const { hour } = indiaClock(now);
  // Supabase cron normally calls only during this window, but keep this guard
  // so an accidental all-day schedule cannot create editions throughout the day.
  return hour >= 1 && hour < 8;
}

export async function GET(request) {
  const auth = verifyCronRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });

  const force = new URL(request.url).searchParams.get("force") === "true";
  if (!force && !insideProductionWindow()) {
    return NextResponse.json({
      ok: true,
      idle: true,
      reason: "outside_production_window",
      indiaTime: indiaClock(),
    });
  }

  const started = Date.now();
  const steps = [];

  try {
    // ensureDailyRun also automatically revives a transiently failed/paused
    // run for today's publication date without deleting completed work.
    const run = await ensureDailyRun({ force });

    // A pulse is deliberately bounded. Supabase calls it again every few
    // minutes, so serverless timeouts or network failures never require a
    // laptop or a persistent process.
    for (let i = 0; i < 2 && Date.now() - started < 240_000; i += 1) {
      const result = await processNextAutomationStep();
      steps.push(result);

      if (
        result?.idle ||
        result?.published ||
        result?.waitingForApproval ||
        result?.valid === false
      ) {
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      runId: run?.id || null,
      publicationDate: run?.publication_date || null,
      stepsCompleted: steps.length,
      steps,
    });
  } catch (error) {
    // Return 200 so the database scheduler itself stays healthy. The pipeline
    // records the failure in newsroom_automation_runs/logs, and the next pulse
    // will automatically resume the saved stage.
    return NextResponse.json({
      ok: false,
      retryable: true,
      stepsCompleted: steps.length,
      steps,
      error: error?.message || "Autonomous newsroom pulse failed.",
    });
  }
}
