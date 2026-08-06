import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rewriteArticleV14 } from "@/lib/newsroom/editorialV14";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request) {
  try {
    const { editionId, page } = await request.json();
    if (!editionId || !page) return NextResponse.json({ error: "editionId and page are required." }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data: edition, error: editionError } = await supabase.from("news_editions").select("id,language").eq("id", editionId).maybeSingle();
    if (editionError || !edition) return NextResponse.json({ error: editionError?.message || "Edition not found." }, { status: 404 });

    const { data: articles, error: articleError } = await supabase
      .from("news_articles").select("*").eq("edition_id", editionId).eq("page", Number(page)).order("display_order", { ascending: true });
    if (articleError) throw new Error(articleError.message);

    let updated = 0;
    const failures = [];
    for (const article of (articles || []).filter((item) => !item.is_deleted)) {
      try {
        const rewritten = await rewriteArticleV14({ article, language: edition.language });
        // Update only editorial fields known to exist in the imported news_articles schema.
        // Earlier versions also wrote updated_at; projects without that optional column
        // silently failed every article and displayed “0 stories rewritten”.
        const { error } = await supabase.from("news_articles").update(rewritten).eq("id", article.id);
        if (error) throw error;
        updated += 1;
      } catch (error) {
        failures.push({ articleId: article.id, error: error?.message || "failed" });
      }
    }

    return NextResponse.json({
      ok: failures.length === 0,
      updated,
      attempted: (articles || []).filter((item) => !item.is_deleted).length,
      failures,
    });
  } catch (error) {
    console.error("V14 edition rewrite error:", error);
    return NextResponse.json({ error: error?.message || "Edition rewrite failed." }, { status: 500 });
  }
}
