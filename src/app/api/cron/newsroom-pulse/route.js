import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/newsroom/automationAuth";
import {
  ensureDailyRun,
  processNextAutomationStep,
} from "@/lib/newsroom/automationPipeline";
import {
  acquireAutomationLease,
  releaseAutomationLease,
} from "@/lib/newsroom/automationLease";

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
  return hour >= 1 && hour < 8;
}

function shouldStop(result) {
  return Boolean(
    result?.idle ||
      result?.published ||
      result?.waitingForApproval ||
      result?.valid === false
  );
}

export async function GET(request) {
  const auth = verifyCronRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "true";
  if (!force && !insideProductionWindow()) {
    return NextResponse.json({
      ok: true,
      idle: true,
      reason: "outside_production_window",
      indiaTime: indiaClock(),
    });
  }

  let lease = null;
  const started = Date.now();
  const steps = [];

  try {
    lease = await acquireAutomationLease({ leaseSeconds: 480 });
    if (!lease.acquired) {
      return NextResponse.json({
        ok: true,
        busy: true,
        reason: "another_production_pulse_is_active",
      });
    }

    const run = await ensureDailyRun({ force });

    // Every invocation is bounded. Supabase cron invokes this endpoint again
    // every few minutes. Completed work is persisted in Supabase after each
    // stage, so a serverless timeout, transient API failure or laptop shutdown
    // cannot destroy progress.
    for (let i = 0; i < 3 && Date.now() - started < 235_000; i += 1) {
      const result = await processNextAutomationStep();
      steps.push(result);
      if (shouldStop(result)) break;

      // Image generation and page-writing are expensive. Yield after two heavy
      // operations so the request stays safely inside the serverless limit.
      if (i >= 1 && ["write", "images", "collect"].includes(String(result?.stage))) {
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      runId: run?.id || null,
      publicationDate: run?.publication_date || null,
      stage: run?.stage || null,
      stepsCompleted: steps.length,
      steps,
    });
  } catch (error) {
    // Keep the scheduler healthy. The pipeline persists the stage and the next
    // pulse resumes it. A failed pulse therefore becomes a retry, not a dead
    // newspaper run.
    return NextResponse.json({
      ok: false,
      retryable: true,
      stepsCompleted: steps.length,
      steps,
      error: error?.message || "Autonomous newsroom pulse failed.",
    });
  } finally {
    if (lease?.acquired) await releaseAutomationLease(lease.owner);
  }
}
