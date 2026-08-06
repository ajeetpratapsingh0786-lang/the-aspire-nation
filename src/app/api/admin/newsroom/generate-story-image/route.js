import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 180;

function buildPrompt(article, language) {
  const visualType = String(article.visual_type || "editorial illustration").toLowerCase();
  const facts = [article.deck, article.body, article.fact_box]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 1800);

  return `Create a premium editorial news visual for an Indian competitive-exam current-affairs study publication.
Story headline: ${article.headline}
Section: ${article.section || "Current Affairs"}
Verified story context: ${facts}
Preferred visual form: ${visualType}.

Requirements:
- Landscape newspaper composition, 3:2 ratio.
- Serious, factual, clean editorial style suitable for a front page.
- Prefer an explanatory illustration, data-inspired visual, map, institutional scene, or symbolic composition.
- Do not invent quotations, statistics, official emblems, documents, uniforms, insignia, or identifiable public figures.
- Do not depict a fabricated real event as documentary photography.
- Avoid readable text, labels, logos, watermarks, newspaper mastheads, and flags unless essential and generic.
- Strong focal subject, restrained colours, realistic lighting, high print clarity.
- The result must support the article without making unsupported factual claims.
- Language context: ${language || "ENGLISH"}. Do not place text in the image.`;
}

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
    }

    const { editionId, articleId, force = false } = await request.json();
    if (!editionId || !articleId) {
      return NextResponse.json({ error: "editionId and articleId are required." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: article, error: articleError } = await supabase
      .from("news_articles")
      .select("id, edition_id, story_id, section, headline, deck, body, fact_box, visual_type, image_url")
      .eq("id", articleId)
      .eq("edition_id", editionId)
      .single();

    if (articleError || !article) {
      return NextResponse.json({ error: articleError?.message || "Article not found." }, { status: 404 });
    }

    if (article.image_url && !force) {
      return NextResponse.json({ skipped: true, imageUrl: article.image_url });
    }

    const { data: edition } = await supabase
      .from("news_editions")
      .select("language, publication_date")
      .eq("id", editionId)
      .single();

    await supabase
      .from("news_articles")
      .update({ visual_status: "generating" })
      .eq("id", articleId);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      prompt: buildPrompt(article, edition?.language),
      size: "1536x1024",
      quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
      output_format: "png",
    });

    const base64 = result.data?.[0]?.b64_json;
    if (!base64) throw new Error("The image API returned no image data.");

    const bucket = process.env.NEWSROOM_IMAGE_BUCKET || "news-images";
    const safeStory = String(article.story_id || article.id).replace(/[^a-zA-Z0-9_-]/g, "-");
    const filePath = `${editionId}/${safeStory}-${Date.now()}.png`;
    const imageBuffer = Buffer.from(base64, "base64");

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const imageUrl = publicData?.publicUrl;
    if (!imageUrl) throw new Error("Could not create a public image URL.");

    const { error: updateError } = await supabase
      .from("news_articles")
      .update({
        image_url: imageUrl,
        image_credit: "AI-generated editorial visual",
        caption: article.headline,
        visual_status: "generated",
      })
      .eq("id", articleId);

    if (updateError) throw new Error(`Article update failed: ${updateError.message}`);

    return NextResponse.json({ ok: true, imageUrl, articleId });
  } catch (error) {
    console.error("Generate story image error:", error);
    return NextResponse.json({ error: error?.message || "Image generation failed." }, { status: 500 });
  }
}
