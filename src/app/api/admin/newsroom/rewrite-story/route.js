import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rewriteArticleV14 } from "@/lib/newsroom/editorialV14";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request) {
  try {
    const { editionId, articleId } = await request.json();
    if (!editionId || !articleId) return NextResponse.json({ error: "editionId and articleId are required." }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data: edition, error: editionError } = await supabase.from("news_editions").select("id,language").eq("id", editionId).maybeSingle();
    if (editionError || !edition) return NextResponse.json({ error: editionError?.message || "Edition not found." }, { status: 404 });

    const { data: article, error: articleError } = await supabase.from("news_articles").select("*").eq("id", articleId).eq("edition_id", editionId).maybeSingle();
    if (articleError || !article) return NextResponse.json({ error: articleError?.message || "Article not found." }, { status: 404 });

    const rewritten = await rewriteArticleV14({ article, language: edition.language });
    const { error: updateError } = await supabase.from("news_articles").update(rewritten).eq("id", article.id);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ ok: true, articleId: article.id });
  } catch (error) {
    console.error("V14 story rewrite error:", error);
    return NextResponse.json({ error: error?.message || "V14 editorial rewrite failed." }, { status: 500 });
  }
}
