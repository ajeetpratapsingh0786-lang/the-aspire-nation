import { NextResponse } from "next/server";
import { loadLatestCanonicalNewsroomRun } from "@/lib/newsroom/newsroomState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const run = await loadLatestCanonicalNewsroomRun();
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not read newsroom status." },
      { status: 500 }
    );
  }
}
