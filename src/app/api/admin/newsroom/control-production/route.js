import { NextResponse } from "next/server";
import { controlNewsroomProduction } from "@/lib/newsroom/automationControls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = new Set([
  "cancel",
  "restart_fresh",
  "new_edition",
  "archive",
  "force_new_morning",
]);

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || "").trim();

    if (!ALLOWED.has(action)) {
      return NextResponse.json({ ok: false, error: "Invalid newsroom control action." }, { status: 400 });
    }

    const result = await controlNewsroomProduction(action);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not update newsroom production." },
      { status: 400 }
    );
  }
}
