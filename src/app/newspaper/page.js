import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadPublishedEditions(supabase) {
  // Do not combine optional columns in one PostgREST filter. If one optional
  // column is absent, Supabase rejects the entire query and the archive looks
  // empty. Try the stable status field first, then compatible fallbacks.
  const attempts = [
    () =>
      supabase
        .from("news_editions")
        .select("*")
        .eq("status", "published")
        .order("publication_date", { ascending: false })
        .limit(30),
    () =>
      supabase
        .from("news_editions")
        .select("*")
        .eq("status", "published")
        .order("news_date", { ascending: false })
        .limit(30),
    () =>
      supabase
        .from("news_editions")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(30),
    () =>
      supabase
        .from("news_editions")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(30),
  ];

  let lastError = null;
  for (const attempt of attempts) {
    const { data, error } = await attempt();
    if (!error) return { editions: data || [], error: null };
    lastError = error;
  }

  return { editions: [], error: lastError };
}

function editionDate(edition) {
  return (
    edition.publication_date ||
    edition.news_date ||
    edition.issue_date ||
    edition.created_at ||
    ""
  );
}

export default async function NewspaperArchivePage() {
  const supabase = createSupabaseAdmin();
  const { editions, error } = await loadPublishedEditions(supabase);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">
            The Aspire Nation
          </p>
          <h1 className="mt-3 text-4xl font-black">Daily Newspaper</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Page 1 and its complete articles are free for everyone. Premium
            members can read Pages 2–8, save articles and create subject-wise
            notes.
          </p>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow">
            <p className="font-black">The public archive could not be loaded.</p>
            <p className="mt-2 break-words text-sm">{error.message}</p>
          </div>
        ) : editions.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
            No published editions are available yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {editions.map((edition) => (
              <article
                key={edition.id}
                className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
              >
                <p className="text-xs font-black uppercase tracking-wider text-red-700">
                  {edition.language || edition.edition_name || "Edition"}
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  {edition.masthead_title ||
                    edition.title ||
                    edition.edition_name ||
                    "The Aspire Nation"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {String(editionDate(edition)).slice(0, 10)}
                </p>
                <Link
                  href={`/newspaper/${edition.id}?page=1`}
                  className="mt-5 inline-flex rounded-xl bg-blue-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-900"
                >
                  Open Page 1
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
