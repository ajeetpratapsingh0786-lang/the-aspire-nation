import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const runId = body?.runId;
    if (!runId) {
      return NextResponse.json({ ok: false, error: "runId is required." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: existing, error: readError } = await supabase
      .from("newsroom_automation_runs")
      .select("*")
      .eq("id", runId)
      .single();

    if (readError || !existing) {
      return NextResponse.json({ ok: false, error: readError?.message || "Run not found." }, { status: 404 });
    }

    const safeStage = existing.stage === "needs_review" || existing.stage === "completed" ? "validate" : existing.stage;
    const errors = Array.isArray(existing.errors) ? existing.errors : [];

    const { data, error } = await supabase
      .from("newsroom_automation_runs")
      .update({
        status: "queued",
        stage: safeStage || "collect",
        errors,
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("newsroom_automation_logs").insert({
      run_id: runId,
      level: "info",
      message: `Run queued again from stage ${data.stage}.`,
      details: { retryRequestedAt: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, run: data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not retry newsroom run." },
      { status: 500 }
    );
  }
}
