import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

function verifySecret(request) {
  const expectedSecret = process.env.NEWSROOM_IMPORT_SECRET;
  const suppliedSecret = request.headers.get("x-newsroom-secret");

  return Boolean(
    expectedSecret &&
      suppliedSecret &&
      expectedSecret === suppliedSecret
  );
}

export async function POST(request) {
  try {
    if (!verifySecret(request)) {
      return NextResponse.json(
        { error: "Unauthorized newsroom request." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const supabase = createSupabaseAdmin();

    const editionData = payload.edition || {};

    const publicationDate =
      editionData.publication_date || editionData.date;

    if (!publicationDate) {
      return NextResponse.json(
        { error: "Publication date is missing." },
        { status: 400 }
      );
    }

    const editionName =
      editionData.edition_name ||
      editionData.edition ||
      "National Edition";

    const languagePackages = [
      {
        language: "ENGLISH",
        articles: Array.isArray(payload.english)
          ? payload.english
          : [],
      },
      {
        language: "HINDI",
        articles: Array.isArray(payload.hindi)
          ? payload.hindi
          : [],
      },
    ];

    const importResults = [];

    for (const languagePackage of languagePackages) {
      const { language, articles } = languagePackage;

      if (articles.length === 0) {
        continue;
      }

      const { data: edition, error: editionError } = await supabase
        .from("news_editions")
        .upsert(
          {
            publication_date: publicationDate,
            news_date: editionData.news_date || null,
            issue: editionData.issue || null,
            edition_name: editionName,
            language,
            title: `THE ASPIRE NATION — ${publicationDate}`,
            status: payload.publish ? "published" : "review",
            source_json: payload,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict:
              "publication_date,language,edition_name",
          }
        )
        .select("id")
        .single();

      if (editionError || !edition) {
        throw new Error(
          `Could not save ${language} edition: ${
            editionError?.message || "Unknown database error"
          }`
        );
      }

      const { error: deleteError } = await supabase
        .from("news_articles")
        .delete()
        .eq("edition_id", edition.id);

      if (deleteError) {
        throw new Error(
          `Could not remove previous ${language} articles: ${deleteError.message}`
        );
      }

      const articleRows = articles.map((article) => ({
        edition_id: edition.id,
        story_id: String(article.story_id),
        page: Number(article.page),
        slot: String(article.slot),
        section: article.section || null,
        headline: article.headline || "Untitled article",
        deck: article.deck || null,
        body: article.body || "",
        caption: article.caption || null,
        fact_box: article.fact_box || null,
        exam_connection: article.exam_connection || null,
        source_name: article.source_name || null,
        source_url: article.source_url || null,
        image_url: article.image_filename || null,
        image_credit: article.image_credit || null,
        is_premium: true,
      }));

      const { error: articleError } = await supabase
        .from("news_articles")
        .insert(articleRows);

      if (articleError) {
        throw new Error(
          `Could not save ${language} articles: ${articleError.message}`
        );
      }

      importResults.push({
        language,
        editionId: edition.id,
        articleCount: articleRows.length,
        status: payload.publish ? "published" : "review",
      });
    }

    if (importResults.length === 0) {
      return NextResponse.json(
        { error: "No English or Hindi articles were found." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      results: importResults,
    });
  } catch (error) {
    console.error("Newsroom import error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown newsroom import error.",
      },
      { status: 500 }
    );
  }
}