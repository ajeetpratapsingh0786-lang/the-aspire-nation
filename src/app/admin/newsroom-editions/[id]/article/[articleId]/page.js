import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import RewriteStoryButton from "../../components/RewriteStoryButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function paragraphs(text = "") {
  return String(text)
    .split(/\n\s*\n|(?<=[.!?।])\s+(?=[A-Zअ-ह])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function factLines(text = "") {
  return String(text)
    .split(/\n+/)
    .map((item) => item.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function ErrorPanel({ title, message, editionId }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-black text-red-800">{title}</h1>
        <p className="mt-4 break-words text-slate-700">{message}</p>
        <Link
          href={`/admin/newsroom-editions/${editionId}`}
          className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 font-bold text-white"
        >
          Back to newspaper
        </Link>
      </div>
    </main>
  );
}

export default async function FullArticlePage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = decodeURIComponent(String(resolvedParams?.id || "").trim());
  const articleId = decodeURIComponent(String(resolvedParams?.articleId || "").trim());

  if (!id || !articleId) {
    return <ErrorPanel title="Invalid article link" message="The edition ID or article ID is missing from the URL." editionId={id || ""} />;
  }

  let supabase;
  try {
    supabase = createSupabaseAdmin();
  } catch (error) {
    return <ErrorPanel title="Supabase configuration error" message={error?.message || "Could not initialise Supabase."} editionId={id} />;
  }

  // Resolve by the article UUID first. This remains valid even if a link was
  // created from another edition view or an edition ID changed during import.
  let article = null;
  let articleError = null;

  const byId = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", articleId)
    .limit(1)
    .maybeSingle();

  article = byId.data;
  articleError = byId.error;

  // Backward-compatible fallback: older links may contain story_id instead of UUID.
  if (!article) {
    const byStoryId = await supabase
      .from("news_articles")
      .select("*")
      .eq("edition_id", id)
      .eq("story_id", articleId)
      .limit(1)
      .maybeSingle();

    article = byStoryId.data;
    articleError = byStoryId.error || articleError;
  }

  if (!article) {
    return (
      <ErrorPanel
        title="Article could not be loaded"
        message={`No row was found in news_articles for article ${articleId}. ${articleError?.message || ""}`}
        editionId={id}
      />
    );
  }

  const actualEditionId = String(article.edition_id || id);
  let edition = null;
  let editionError = null;

  const editionResult = await supabase
    .from("news_editions")
    .select("*")
    .eq("id", actualEditionId)
    .limit(1)
    .maybeSingle();

  edition = editionResult.data;
  editionError = editionResult.error;

  // Fallback to the edition from the URL if the article row lacks/contains an old edition ID.
  if (!edition && actualEditionId !== id) {
    const fallbackEdition = await supabase
      .from("news_editions")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
    edition = fallbackEdition.data;
    editionError = fallbackEdition.error || editionError;
  }

  if (!edition) {
    return (
      <ErrorPanel
        title="Edition could not be loaded"
        message={`The article exists, but its edition row could not be found. ${editionError?.message || ""}`}
        editionId={id}
      />
    );
  }

  const hindi = String(edition.language || "").toUpperCase() === "HINDI";
  const bodyParagraphs = paragraphs(article.body);
  const facts = factLines(article.fact_box);
  const examLines = factLines(article.exam_connection);
  const backEditionId = String(article.edition_id || edition.id || id);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:py-12">
      <article className="mx-auto max-w-5xl bg-white px-6 py-8 shadow-xl md:px-14 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-4">
          <Link
            href={`/admin/newsroom-editions/${backEditionId}?page=${article.page || 1}`}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white"
          >
            ← {hindi ? "अखबार पर वापस जाएं" : "Back to newspaper"}
          </Link>
          <RewriteStoryButton editionId={backEditionId} articleId={article.id} hindi={hindi} />
          <span className="text-sm font-bold text-slate-500">Page {article.page || "—"} · {article.slot || "story"}</span>
        </div>

        <p className={`mt-8 text-sm font-black text-red-800 ${hindi ? "" : "uppercase tracking-widest"}`}>
          {article.section || "The Aspire Nation"}
        </p>
        <h1 className={`mt-3 font-black text-slate-950 ${hindi ? "text-4xl leading-[1.24] md:text-6xl" : "text-4xl leading-tight md:text-6xl"}`}>
          {article.headline || (hindi ? "शीर्षक उपलब्ध नहीं" : "Headline unavailable")}
        </h1>
        {article.deck ? (
          <p className="mt-5 border-l-4 border-red-800 pl-5 text-xl font-semibold leading-relaxed text-slate-700">{article.deck}</p>
        ) : null}

        {article.image_url && (article.image_url.startsWith("/") || article.image_url.startsWith("http")) ? (
          <figure className="mt-8">
            <img src={article.image_url} alt={article.caption || article.headline || "Article image"} className="max-h-[560px] w-full object-cover" />
            {(article.caption || article.image_credit) ? (
              <figcaption className="mt-2 text-sm text-slate-500">
                {article.caption}{article.image_credit ? ` — ${article.image_credit}` : ""}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <section className={`mt-9 text-slate-900 ${hindi ? "text-[19px] leading-[2.05]" : "text-lg leading-9"}`}>
          {bodyParagraphs.length ? bodyParagraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 20)}`} className={index ? "mt-6" : ""}>{paragraph}</p>
          )) : (
            <p>{hindi ? "इस लेख का पूरा विवरण उपलब्ध नहीं है।" : "The full article text is not available."}</p>
          )}
        </section>

        {facts.length ? (
          <section className="mt-10 bg-amber-50 px-6 py-6">
            <h2 className="text-xl font-black text-amber-950">{hindi ? "एग्ज़ाम के लिए जरूरी तथ्य" : "Key Facts for Exams"}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {facts.map((fact, index) => (
                <li key={`${index}-${fact}`} className="flex gap-3 leading-7 text-amber-950">
                  <span className="font-black text-red-800">•</span><span>{fact}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {examLines.length ? (
          <section className="mt-6 bg-blue-50 px-6 py-6">
            <h2 className="text-xl font-black text-blue-950">{hindi ? "एग्ज़ाम कनेक्शन" : "Exam Connection"}</h2>
            <ul className="mt-4 space-y-3">
              {examLines.map((line, index) => (
                <li key={`${index}-${line}`} className="flex gap-3 leading-7 text-blue-950">
                  <span className="font-black">→</span><span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-9 border-t border-slate-300 pt-5 text-sm text-slate-600">
          <strong>{hindi ? "आधिकारिक स्रोत:" : "Official source:"}</strong> {article.source_name || "Not specified"}
          {article.source_url ? (
            <a href={article.source_url} target="_blank" rel="noreferrer" className="ml-3 font-bold text-blue-800 underline">
              {hindi ? "स्रोत खोलें" : "Open source"}
            </a>
          ) : null}
        </div>
      </article>
    </main>
  );
}
