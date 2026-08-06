import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getPremiumAccess } from "@/lib/premiumAccess";
import NewspaperRenderer from "@/components/newspaper/NewspaperRenderer";
import PrintToolbar from "./PrintToolbar";

export const dynamic = "force-dynamic";

export default async function FullEditionPrintPage({ params }) {
  const { editionId } = await params;
  const access = await getPremiumAccess();

  if (!access.hasPremium) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-7 shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Premium edition export</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Full-edition PDF export is locked</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in with an active subscription to open all eight pages in one print-ready view.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/login?returnTo=${encodeURIComponent(`/newspaper/${editionId}/print`)}`} className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-black text-white">Login</Link>
            <Link href="/subscribe" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-black text-white">View plans</Link>
            <Link href={`/newspaper/${editionId}?page=1`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-800">Read Page 1</Link>
          </div>
        </div>
      </main>
    );
  }

  const supabase = createSupabaseAdmin();
  const { data: edition, error: editionError } = await supabase
    .from("news_editions")
    .select("*")
    .eq("id", editionId)
    .maybeSingle();

  if (editionError || !edition) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-red-50 p-6">
          <h1 className="text-xl font-black">Edition unavailable</h1>
          <p className="mt-2 text-sm">{editionError?.message || editionId}</p>
          <Link href="/newspaper" className="mt-4 inline-block rounded bg-blue-950 px-4 py-2 text-white">Back to archive</Link>
        </div>
      </main>
    );
  }

  if (String(edition.status || "").toLowerCase() !== "published") {
    return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-2xl rounded-xl bg-amber-50 p-6"><h1 className="text-xl font-black">This edition is not published</h1></div></main>;
  }

  const { data: rawArticles, error: articlesError } = await supabase
    .from("news_articles")
    .select("*")
    .eq("edition_id", editionId);

  if (articlesError) {
    return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-2xl rounded-xl bg-red-50 p-6"><h1 className="text-xl font-black">Could not load stories</h1><p>{articlesError.message}</p></div></main>;
  }

  const articles = (rawArticles || []).filter((article) => article?.is_deleted !== true);

  return (
    <main className="edition-export-screen min-h-screen bg-slate-700">
      <PrintToolbar editionId={editionId} />
      <div className="edition-export-stack mx-auto flex max-w-[1120px] flex-col items-center gap-8 px-3 py-8 print:block print:max-w-none print:p-0">
        {Array.from({ length: 8 }, (_, index) => index + 1).map((pageNumber) => (
          <section key={pageNumber} className="edition-export-page">
            <NewspaperRenderer
              edition={edition}
              articles={articles}
              currentPage={pageNumber}
              mode="public"
            />
          </section>
        ))}
      </div>
    </main>
  );
}
