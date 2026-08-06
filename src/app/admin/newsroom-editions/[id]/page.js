import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import NewspaperRenderer from "@/components/newspaper/NewspaperRenderer";
import GenerateEditionImagesButton from "./components/GenerateEditionImagesButton";
import RewriteEditionButton from "./components/RewriteEditionButton";
import EditionQualityPanel from "./components/EditionQualityPanel";
import { buildEditionQualityReport } from "@/lib/newsroom/editionQuality";

export const dynamic = "force-dynamic";

export default async function NewspaperProofPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedPage = Number(resolvedSearchParams?.page || 1);
  const currentPage = requestedPage >= 1 && requestedPage <= 8 ? requestedPage : 1;
  const supabase = createSupabaseAdmin();

  const { data: edition, error: editionError } = await supabase.from("news_editions").select("*").eq("id", id).maybeSingle();
  if (editionError || !edition) {
    return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-3xl rounded-xl bg-red-50 p-6 text-red-900"><h1 className="text-xl font-black">Could not load edition</h1><p className="mt-2 text-sm">{editionError?.message || `Edition not found: ${id}`}</p></div></main>;
  }

  const { data: rawArticles, error: articlesError } = await supabase.from("news_articles").select("*").eq("edition_id", id);
  if (articlesError) {
    return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-3xl rounded-xl bg-red-50 p-6 text-red-900"><h1 className="text-xl font-black">Could not load stories</h1><p className="mt-2 text-sm">{articlesError.message}</p></div></main>;
  }

  const articles = (rawArticles || []).filter((a) => a?.is_deleted !== true);
  const missingImageCount = articles.filter((a) => !a?.image_url).length;
  const qualityReport = buildEditionQualityReport(edition, articles);

  return (
    <main className="min-h-screen bg-slate-700 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-5 rounded-2xl bg-slate-950 p-5 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Unified Newspaper Engine V16</p><h1 className="mt-2 text-3xl font-black">{edition.language} Edition</h1><p className="mt-1 text-sm text-slate-400">One renderer for Admin Review and Public Reader</p></div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/newsroom-editions" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold">Back to Editions</Link>
              <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold">Add Topic</button>
              <button className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold">Replace with AI</button>
              <GenerateEditionImagesButton editionId={edition.id} missingCount={missingImageCount} />
              <RewriteEditionButton editionId={edition.id} />
              <Link href={`/admin/newsroom-editions/${id}/publish`} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold">Publish Edition</Link>
            </div>
          </div>
          <EditionQualityPanel report={qualityReport} />
          <div className="mt-5 flex flex-wrap gap-2">{Array.from({length:8},(_,i)=>i+1).map((page)=><Link key={page} href={`/admin/newsroom-editions/${id}?page=${page}`} className={`rounded-lg px-4 py-2 text-sm font-black ${currentPage===page?"bg-red-700":"bg-white/10"}`}>Page {page}</Link>)}</div>
        </div>
        <div className="overflow-auto rounded-xl bg-slate-600 p-4 shadow-2xl md:p-8"><NewspaperRenderer edition={edition} articles={articles} currentPage={currentPage} mode="admin" /></div>
      </div>
    </main>
  );
}
