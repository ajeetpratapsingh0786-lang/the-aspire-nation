import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser } from "@/lib/serverAuth";
import { buildEditionQualityReport } from "@/lib/newsroom/editionQuality";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const adminEmail = String(
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || ""
  ).toLowerCase();

  if (
    adminEmail &&
    String(user.email || "").toLowerCase() !== adminEmail
  ) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const editionId = String(body?.editionId || "").trim();

  if (!editionId) {
    return NextResponse.json(
      { error: "editionId is required." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();

  const { data: existingEdition, error: editionError } = await supabase
    .from("news_editions")
    .select("*")
    .eq("id", editionId)
    .maybeSingle();

  if (editionError) {
    return NextResponse.json(
      { error: `Could not load edition: ${editionError.message}` },
      { status: 500 }
    );
  }

  if (!existingEdition) {
    return NextResponse.json(
      { error: "Edition not found. Open Publish from the actual edition review page." },
      { status: 404 }
    );
  }

  const { data: articles, error: articlesError } = await supabase
    .from("news_articles")
    .select("*")
    .eq("edition_id", editionId);

  if (articlesError) {
    return NextResponse.json(
      { error: `Could not validate stories: ${articlesError.message}` },
      { status: 500 }
    );
  }

  const qualityReport = buildEditionQualityReport(existingEdition, articles || []);

  if (!qualityReport.ready) {
    return NextResponse.json(
      {
        error: `Cannot publish. ${qualityReport.critical.join(" ")}`,
        qualityReport,
      },
      { status: 400 }
    );
  }

  const publishedAt = new Date().toISOString();

  const publishPayload = {
    status: "published",
    is_published: true,
    approved_at: existingEdition.approved_at || publishedAt,
    approved_by: user.email || null,
    published_at: publishedAt,
    live_at: publishedAt,
    updated_at: publishedAt,
  };

  const { data: savedEdition, error: updateError } = await supabase
    .from("news_editions")
    .update(publishPayload)
    .eq("id", editionId)
    .select("*")
    .maybeSingle();

  if (updateError || !savedEdition) {
    return NextResponse.json(
      {
        error:
          updateError?.message ||
          "Could not publish edition because no database row was updated.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    edition: savedEdition,
    publishedAt,
    publicUrl: `/newspaper/${editionId}?page=1`,
    qualityReport,
    message: qualityReport.warnings.length
      ? `Edition published with ${qualityReport.warnings.length} non-blocking quality warning(s).`
      : "Edition published and made visible in the public archive.",
  });
}
