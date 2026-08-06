import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getPremiumAccess } from "@/lib/premiumAccess";
import ArticleReader from "./ArticleReader";

export const dynamic = "force-dynamic";

function LockedArticle({ editionId, page, isSignedIn }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-950 text-2xl text-white">🔒</div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-red-700">Premium Article</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Continue with Aspire Premium</h1>
        <p className="mt-3 text-slate-600">This article belongs to Page {page}. Page 1 articles are free; complete articles from Pages 2–8 require an active Premium subscription.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/subscribe" className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white">Buy Premium</Link>
          {!isSignedIn && <Link href="/login" className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Login</Link>}
          <Link href={`/newspaper/${editionId}?page=1`} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">Back to Free Page 1</Link>
        </div>
      </section>
    </main>
  );
}

export default async function PublicArticlePage({ params }) {
  const { editionId, articleId } = await params;
  const supabase = createSupabaseAdmin();

  const { data: article, error: articleError } = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", articleId)
    .eq("edition_id", editionId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (articleError || !article) notFound();

  const { data: edition, error: editionError } = await supabase
    .from("news_editions")
    .select("*")
    .eq("id", editionId)
    .maybeSingle();

  if (editionError || !edition || String(edition.status || "").toLowerCase() !== "published") notFound();

  const page = Number(article.page || 1);
  if (page > 1) {
    const access = await getPremiumAccess();
    if (!access.hasPremium) return <LockedArticle editionId={editionId} page={page} isSignedIn={access.isSignedIn} />;
  }

  return <ArticleReader edition={edition} article={article} />;
}
