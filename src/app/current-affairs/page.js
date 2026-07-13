import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCrown,
  FaNewspaper,
  FaStar,
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

export default async function CurrentAffairsPage() {
  const { data: articles, error } = await supabase
    .from("current_affairs")
    .select(
      `
        id,
        title,
        slug,
        summary,
        category,
        image_url,
        tags,
        is_featured,
        published_at
      `
    )
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  function formatDate(value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-3xl font-black text-red-600">
            Unable to Load Current Affairs
          </h1>

          <p className="mt-4 text-gray-600">
            {error.message || "Please try again later."}
          </p>

          <Link
            href="/"
            className="mt-7 inline-block rounded-xl bg-gray-900 px-6 py-3 font-bold text-white"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  const featuredArticle = articles?.find(
    (article) => article.is_featured
  );

  const remainingArticles =
    articles?.filter(
      (article) => article.id !== featuredArticle?.id
    ) || [];

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="bg-gray-950 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">
              The Aspire Nation
            </p>

            <h1 className="mt-4 text-4xl font-black sm:text-5xl">
              Daily Current Affairs
            </h1>

            <p className="mt-4 text-lg leading-8 text-gray-300">
              Read daily exam-focused headlines and summaries for free.
              Premium members can open the complete explanation, important
              facts and exam analysis.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                Headlines Free
              </span>

              <span className="rounded-full border border-red-500/30 bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-200">
                Full Articles Premium
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {!articles || articles.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow">
            <FaNewspaper
              size={44}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-black text-gray-900">
              No Current Affairs Published Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Today&apos;s current affairs will appear here after publication.
            </p>
          </div>
        ) : (
          <>
            {featuredArticle && (
              <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="grid lg:grid-cols-2">
                  <div className="min-h-[320px] bg-gray-200">
                    {featuredArticle.image_url ? (
                      <img
                        src={featuredArticle.image_url}
                        alt={featuredArticle.title}
                        className="h-full min-h-[320px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-gray-900 to-red-900">
                        <FaNewspaper
                          size={70}
                          className="text-white/70"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center p-7 sm:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-bold text-yellow-700">
                        <FaStar />
                        Featured
                      </span>

                      <span className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700">
                        {featuredArticle.category}
                      </span>
                    </div>

                    <h2 className="mt-5 text-3xl font-black leading-tight text-gray-900">
                      {featuredArticle.title}
                    </h2>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <FaCalendarAlt />
                      {formatDate(featuredArticle.published_at)}
                    </div>

                    <p className="mt-5 text-lg leading-8 text-gray-600">
                      {featuredArticle.summary}
                    </p>

                    <Link
                      href={`/current-affairs/${featuredArticle.slug}`}
                      className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white transition hover:bg-red-700"
                    >
                      Read Full Article
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">
                    Latest Headlines
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Public summaries with premium full explanations.
                  </p>
                </div>

                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-2 font-bold text-red-600 hover:text-red-700"
                >
                  <FaCrown />
                  Get Premium Access
                </Link>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {remainingArticles.map((article) => (
                  <article
                    key={article.id}
                    className="flex flex-col overflow-hidden rounded-3xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-52 bg-gray-200">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-red-800">
                          <FaNewspaper
                            size={46}
                            className="text-white/70"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          {article.category}
                        </span>

                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          <FaCalendarAlt />
                          {formatDate(article.published_at)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-black leading-snug text-gray-900">
                        {article.title}
                      </h3>

                      <p className="mt-3 line-clamp-4 leading-7 text-gray-600">
                        {article.summary}
                      </p>

                      {Array.isArray(article.tags) &&
                        article.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {article.tags
                              .slice(0, 3)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        )}

                      <div className="mt-auto pt-6">
                        <Link
                          href={`/current-affairs/${article.slug}`}
                          className="inline-flex items-center gap-2 font-black text-red-600 transition hover:text-red-700"
                        >
                          Read Full Article
                          <FaArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-12 rounded-3xl bg-gradient-to-r from-gray-950 to-red-950 px-6 py-10 text-white shadow-xl sm:px-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    <FaCrown className="text-yellow-400" size={26} />

                    <p className="font-bold uppercase tracking-widest text-red-300">
                      Aspire Nation Premium
                    </p>
                  </div>

                  <h2 className="mt-4 text-3xl font-black">
                    Unlock Complete Current Affairs
                  </h2>

                  <p className="mt-3 leading-7 text-gray-300">
                    Get complete explanations, exam relevance, important facts,
                    editorials, quizzes and secure access to the daily e-paper.
                  </p>
                </div>

                <Link
                  href="/subscribe"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-red-600 px-7 py-3.5 font-black text-white transition hover:bg-red-700"
                >
                  Subscribe Now
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}