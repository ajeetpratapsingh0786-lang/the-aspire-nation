import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser } from "@/lib/serverAuth";
import { loadLatestCanonicalNewsroomRun } from "@/lib/newsroom/newsroomState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminEmail(email) {
  const configured = String(
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  return Boolean(configured && String(email || "").toLowerCase() === configured);
}

export async function GET(request) {
  try {
    const { user, error: authError } = await getRequestUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: authError || "Authentication required." },
        { status: 401 }
      );
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json(
        { ok: false, error: "Administrator access required." },
        { status: 403 }
      );
    }

    const supabase = createSupabaseAdmin();
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    const [editionResponse, latestRun, premiumResponse, paymentResponse] =
      await Promise.all([
        supabase
          .from("news_editions")
          .select(
            "id,title,publication_date,news_date,language,status,is_published,created_at,published_at,news_articles(count)"
          )
          .order("publication_date", { ascending: false })
          .order("language", { ascending: true })
          .limit(20),
        loadLatestCanonicalNewsroomRun(),
        supabase
          .from("user_subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .gte("expiry_date", new Date().toISOString()),
        supabase.from("payments").select("amount").gte("created_at", monthStart),
      ]);

    const firstError = [editionResponse, premiumResponse, paymentResponse].find(
      (response) => response?.error
    )?.error;
    if (firstError) throw firstError;

    const monthlyRevenue = (paymentResponse.data || []).reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    return NextResponse.json({
      ok: true,
      editions: editionResponse.data || [],
      latestRun,
      premiumUsers: premiumResponse.count || 0,
      monthlyRevenue,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not load control-room data." },
      { status: 500 }
    );
  }
}
