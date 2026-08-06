import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getPremiumAccess } from "@/lib/premiumAccess";
import NewspaperRenderer from "@/components/newspaper/NewspaperRenderer";
import ReaderViewport from "./ReaderViewport";
import LockedPremiumPage from "./LockedPremiumPage";

export const dynamic = "force-dynamic";

export default async function PublicNewspaperPage({ params, searchParams }) {
  const { editionId: id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedPage = Number(resolvedSearchParams?.page || 1);
  const currentPage = requestedPage >= 1 && requestedPage <= 8 ? requestedPage : 1;
  const supabase = createSupabaseAdmin();

  const { data: edition, error: editionError } = await supabase.from("news_editions").select("*").eq("id", id).maybeSingle();
  if (editionError || !edition) return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-3xl rounded-xl bg-red-50 p-6"><h1 className="text-xl font-black">Edition unavailable</h1><p className="mt-2">{editionError?.message || id}</p><Link href="/newspaper" className="mt-4 inline-block rounded bg-blue-950 px-4 py-2 text-white">Back to Archive</Link></div></main>;
  if (String(edition.status || "").toLowerCase() !== "published") return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-3xl rounded-xl bg-amber-50 p-6"><h1 className="text-xl font-black">This edition is not published</h1></div></main>;

  const access = currentPage === 1 ? { hasPremium: true, isSignedIn: false, reason: "free_page_one" } : await getPremiumAccess();

  // Secure fail-closed gate: for Pages 2–8, return before fetching or rendering article content.
  if (currentPage > 1 && !access.hasPremium) {
    return <LockedPremiumPage edition={edition} pageNumber={currentPage} editionId={id} isSignedIn={access.isSignedIn} />;
  }

  const { data: rawArticles, error: articlesError } = await supabase.from("news_articles").select("*").eq("edition_id", id);
  if (articlesError) return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-3xl rounded-xl bg-red-50 p-6"><h1 className="text-xl font-black">Could not load stories</h1><p>{articlesError.message}</p></div></main>;
  const articles = (rawArticles || []).filter((a) => a?.is_deleted !== true);

  return (
    <main className="min-h-screen bg-slate-700 px-3 py-4 md:px-6">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Aspire Reader V16</p><h1 className="mt-1 text-2xl font-black">{edition.masthead_title || "THE ASPIRE NATION"}</h1><p className="text-xs text-slate-400">{edition.publication_date || edition.news_date || ""} · {edition.language || ""}</p></div>
            <div className="flex flex-wrap gap-2"><Link href="/newspaper" className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold">Archive</Link><Link href={`/newspaper/${id}/print`} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black">Print full edition</Link><Link href="/saved-articles" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">Saved Articles</Link><Link href="/my-notes" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">My Notes</Link></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{Array.from({length:8},(_,i)=>i+1).map((page)=><Link key={page} href={`/newspaper/${id}?page=${page}`} className={`rounded-lg px-3 py-2 text-xs font-black ${currentPage===page?"bg-red-700":"bg-white/10"}`}>Page {page}{page>1&&!access.hasPremium?" 🔒":""}</Link>)}</div>
        </div>
        <ReaderViewport><NewspaperRenderer edition={edition} articles={articles} currentPage={currentPage} mode="public" /></ReaderViewport>
      </div>
    </main>
  );
}
