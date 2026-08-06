import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 300;

function score(article) {
  const slot = String(article.slot || "").toLowerCase();
  let value = 0;
  if (article.page === 1) value += 100;
  if (slot.includes("hero") || slot.includes("lead")) value += 100;
  if (slot.includes("major") || slot.includes("secondary")) value += 55;
  if (article.visual_prompt || article.visual_type) value += 20;
  value -= Number(article.display_order || 99);
  return value;
}

export async function POST(request) {
  try {
    const { editionId, count = 5 } = await request.json();
    if (!editionId) return NextResponse.json({ error: "editionId is required." }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("*")
      .eq("edition_id", editionId)
      ;

    if (error) throw error;

    const selected = (articles || [])
      .filter((article) => article?.is_deleted !== true && !article?.image_url)
      .sort((a, b) => score(b) - score(a))
      .slice(0, Math.max(1, Math.min(Number(count) || 10, 10)));

    const origin = new URL(request.url).origin;
    const results = [];

    for (const article of selected) {
      const response = await fetch(`${origin}/api/admin/newsroom/generate-story-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId, articleId: article.id }),
      });
      const payload = await response.json();
      results.push({ articleId: article.id, ok: response.ok, ...payload });
    }

    return NextResponse.json({ ok: true, requested: selected.length, results });
  } catch (error) {
    console.error("Generate edition images error:", error);
    return NextResponse.json({ error: error?.message || "Bulk image generation failed." }, { status: 500 });
  }
}
