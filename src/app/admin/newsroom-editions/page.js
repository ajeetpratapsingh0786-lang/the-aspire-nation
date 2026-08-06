import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function statusClass(status) {
  if (status === "published") return "bg-emerald-100 text-emerald-800";
  if (status === "review") return "bg-blue-100 text-blue-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  if (status === "automation" || status === "draft") return "bg-amber-100 text-amber-800";
  return "bg-slate-200 text-slate-700";
}

export default async function NewsroomEditionsPage() {
  const supabase = createSupabaseAdmin();

  const { data: editions, error } = await supabase
    .from("news_editions")
    .select(`
      id,
      title,
      publication_date,
      news_date,
      issue,
      edition_name,
      language,
      status,
      created_at,
      published_at,
      news_articles(count)
    `)
    .order("publication_date", { ascending: false })
    .order("language", { ascending: true });

  if (error) {
    return (
      <main className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Could not load newsroom editions: {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-7">
      <section className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
          Editorial Desk
        </p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">Editions</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Review, approve and open every English and Hindi edition from one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/newsroom-automation" className="rounded-xl bg-red-600 px-5 py-3 font-black text-white">
            Open AI Newsroom
          </Link>
          <Link href="/newspaper" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-black text-white">
            View Public Archive
          </Link>
        </div>
      </section>

      {!editions?.length ? (
        <div className="rounded-2xl bg-white p-8 shadow">No newsroom editions were found.</div>
      ) : (
        <div className="grid gap-5">
          {editions.map((edition) => {
            const articleCount = edition.news_articles?.[0]?.count || 0;
            const published = edition.status === "published";

            return (
              <article key={edition.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${edition.language === "HINDI" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                        {edition.language}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(edition.status)}`}>
                        {published ? "LIVE" : edition.status.toUpperCase()}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-950">{edition.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                      <span>Publication: {edition.publication_date}</span>
                      <span>News date: {edition.news_date || "Not specified"}</span>
                      <span>{articleCount} stories</span>
                      <span>{edition.edition_name}</span>
                      {edition.published_at ? <span>Live: {new Date(edition.published_at).toLocaleString("en-IN")}</span> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/newsroom-editions/${edition.id}`} className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-black text-white">
                      Review Edition
                    </Link>
                    {published ? (
                      <Link href={`/newspaper/${edition.id}?page=1`} className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 font-black text-white">
                        View Live
                      </Link>
                    ) : (
                      <Link href={`/admin/newsroom-editions/${edition.id}/publish`} className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 font-black text-white">
                        Approve Edition
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
