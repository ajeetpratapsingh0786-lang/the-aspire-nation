import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/newsroom/automationAuth";
import { processNextAutomationStep, publishReadyAutomationRun } from "@/lib/newsroom/automationPipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
  const auth = verifyCronRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  try {
    let result = await publishReadyAutomationRun();
    if (!result.published) {
      const worker = await processNextAutomationStep();
      result = { ...result, worker };
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Automatic publication failed." }, { status: 500 });
  }
}
