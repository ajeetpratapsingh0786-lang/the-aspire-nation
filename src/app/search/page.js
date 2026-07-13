import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  FaBookOpen,
  FaBriefcase,
  FaFileAlt,
  FaNewspaper,
  FaSearch,
  FaTrophy,
} from "react-icons/fa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.trim() : "";

  let searchResults = [];
  let searchError = "";

  if (query) {
    const safeQuery = query.replace(/[%_,]/g, " ");

    const [
      currentAffairsResponse,
      jobsResponse,
      resultsResponse,
      newspapersResponse,
    ] = await Promise.all([
      supabase
        .from("current_affairs")
        .select("id, title, slug, summary")
        .eq("is_published", true)
        .or(
          `title.ilike.%${safeQuery}%,summary.ilike.%${safeQuery}%`
        )
        .limit(10),

      supabase
        .from("jobs")
        .select("id, title, description, official_link")
        .eq("is_published", true)
        .or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        )
        .limit(10),

      supabase
        .from("results")
        .select("id, title, description, official_link")
        .eq("is_published", true)
        .or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        )
        .limit(10),

      supabase
        .from("newspapers")
        .select("id, title, edition_date")
        .eq("is_published", true)
        .ilike("title", `%${safeQuery}%`)
        .limit(10),
    ]);

    const errors = [
      currentAffairsResponse.error,
      jobsResponse.error,
      resultsResponse.error,
      newspapersResponse.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Search errors:", errors);

      searchError =
        errors[0]?.message ||
        "Some website content could not be searched.";
    }

    searchResults = [
      ...(currentAffairsResponse.data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.summary,
        type: "Current Affairs",
        href: item.slug
          ? `/current-affairs/${item.slug}`
          : "/current-affairs",
        iconName: "current-affairs",
        external: false,
      })),

      ...(jobsResponse.data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: "Government Job",
        href: item.official_link || "/jobs",
        iconName: "job",
        external: Boolean(item.official_link),
      })),

      ...(resultsResponse.data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: "Exam Result",
        href: item.official_link || "/results",
        iconName: "result",
        external: Boolean(item.official_link),
      })),

      ...(newspapersResponse.data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.edition_date
          ? `Edition date: ${new Date(
              item.edition_date
            ).toLocaleDateString("en-IN")}`
          : "Daily e-paper edition",
        type: "E-Paper",
        href: `/epaper/${item.id}`,
        iconName: "epaper",
        external: false,
      })),
    ];
  }

  function getIcon(iconName) {
    if (iconName === "job") {
      return <FaBriefcase className="text-xl text-red-700" />;
    }

    if (iconName === "result") {
      return <FaTrophy className="text-xl text-red-700" />;
    }

    if (iconName === "epaper") {
      return <FaNewspaper className="text-xl text-red-700" />;
    }

    return <FaBookOpen className="text-xl text-red-700" />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-gray-950 to-red-900 px-4 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <FaSearch className="text-3xl text-red-300" />
            </div>

            <div>
              <p className="font-black uppercase tracking-[0.2em] text-red-300">
                Search The Aspire Nation
              </p>

              <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                Find What You Need
              </h1>
            </div>
          </div>

          <form
            action="/search"
            method="GET"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              name="q"
              defaultValue={query}
              required
              placeholder="Search current affairs, jobs, results or e-papers..."
              className="w-full rounded-xl border border-white/20 bg-white px-5 py-4 text-gray-950 outline-none"
            />

            <button
              type="submit"
              className="rounded-xl bg-red-700 px-7 py-4 font-black text-white transition hover:bg-red-800"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {searchError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">Search database warning</p>
            <p className="mt-1 text-sm">{searchError}</p>
          </div>
        )}

        {!query ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <FaSearch className="mx-auto text-5xl text-gray-300" />

            <h2 className="mt-5 text-2xl font-black text-gray-800">
              Start your search
            </h2>

            <p className="mt-2 text-gray-500">
              Enter a keyword from a published article, job, result or
              e-paper.
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-widest text-red-700">
                Search Results
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Results for &quot;{query}&quot;
              </h2>

              <p className="mt-2 text-gray-500">
                {searchResults.length} matching item
                {searchResults.length !== 1 ? "s" : ""} found.
              </p>
            </div>

            <div className="space-y-4">
              {searchResults.map((item, index) => {
                const content = (
                  <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-lg">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                      {getIcon(item.iconName)}
                    </div>

                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-red-700">
                        {item.type}
                      </span>

                      <h3 className="mt-2 text-xl font-black text-gray-950">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-2 leading-7 text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );

                return item.external ? (
                  <a
                    key={`${item.type}-${item.id}-${index}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={`${item.type}-${item.id}-${index}`}
                    href={item.href}
                    className="block"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <FaFileAlt className="mx-auto text-5xl text-gray-300" />

            <h2 className="mt-5 text-2xl font-black text-gray-800">
              No results found
            </h2>

            <p className="mt-2 text-gray-500">
              No published content matched &quot;{query}&quot;. Try one word
              from an existing job or current-affairs title.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}