import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser, hasActiveSubscription } from "@/lib/serverAuth";
import { getArticleSubject } from "@/lib/articleSubjects";

export async function GET(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  if (!(await hasActiveSubscription(user.id))) {
    return NextResponse.json({ error: "Premium membership required." }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error: queryError } = await supabase
    .from("article_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  if (!(await hasActiveSubscription(user.id))) {
    return NextResponse.json({ error: "Premium membership required." }, { status: 403 });
  }

  const body = await request.json();
  const { articleId, editionId, note } = body || {};
  if (!articleId || !editionId || !String(note || "").trim()) {
    return NextResponse.json({ error: "Article, edition and note are required." }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: article, error: articleError } = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError || !article) {
    return NextResponse.json({ error: articleError?.message || "Article not found." }, { status: 404 });
  }

  const payload = {
    user_id: user.id,
    article_id: article.id,
    edition_id: editionId,
    subject: getArticleSubject(article),
    headline: article.headline || "Untitled article",
    note: String(note).trim(),
    language: article.language || null,
    page_number: Number(article.page || 1),
    updated_at: new Date().toISOString(),
  };

  const { data, error: saveError } = await supabase
    .from("article_notes")
    .upsert(payload, { onConflict: "user_id,article_id" })
    .select("*")
    .single();

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const articleId = new URL(request.url).searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId is required." }, { status: 400 });

  const supabase = createSupabaseAdmin();
  const { error: deleteError } = await supabase
    .from("article_notes")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
