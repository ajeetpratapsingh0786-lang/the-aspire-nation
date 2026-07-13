"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  FaArrowRight,
  FaCalendarAlt,
  FaCrown,
  FaExclamationTriangle,
  FaPenNib,
  FaRedo,
  FaStar,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

export default function EditorialPage() {
  const [editorials, setEditorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEditorials();
  }, []);

  async function loadEditorials() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("editorials")
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
      .order("is_featured", {
        ascending: false,
      })
      .order("published_at", {
        ascending: false,
      });

    if (error) {
      setErrorMessage(
        error.message || "Unable to load editorials."
      );
      setLoading(false);
      return;
    }

    setEditorials(data || []);
    setLoading(false);
  }

  function formatDate(value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const featuredEditorial = useMemo(
    () =>
      editorials.find(
        (editorial) => editorial.is_featured
      ) ||
      editorials[0] ||
      null,
    [editorials]
  );

  const remainingEditorials = useMemo(
    () =>
      editorials.filter(
        (editorial) =>
          editorial.id !== featuredEditorial?.id
      ),
    [editorials, featuredEditorial]
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-600">
            Loading editorials...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-9 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-2xl text-red-600" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-gray-950">
            Unable to Load Editorials
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={loadEditorials}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-700"
          >
            <FaRedo />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-950 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="font-black uppercase tracking-[0.24em] text-red-400">
            The Aspire Nation
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Editorial Analysis
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
            Balanced, exam-focused analysis for mains,
            essays, interviews and deeper understanding.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold">
              Summaries Free
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold">
              <FaCrown />
              Full Analysis Premium
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {editorials.length === 0 ? (
          <section className="rounded-3xl bg-white px-6 py-16 text-center shadow">
            <FaPenNib
              size={48}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-black text-gray-950">
              No Editorial Published Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Published editorials will appear here.
            </p>
          </section>
        ) : (
          <>
            {featuredEditorial && (
              <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="grid lg:grid-cols-2">
                  <div className="min-h-[360px] bg-gradient-to-br from-gray-950 to-red-950">
                    {featuredEditorial.image_url ? (
                      <img
                        src={featuredEditorial.image_url}
                        alt={featuredEditorial.title}
                        className="h-full min-h-[360px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[360px] items-center justify-center">
                        <FaPenNib
                          size={90}
                          className="text-white/50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center p-7 sm:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      {featuredEditorial.is_featured && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-700">
                          <FaStar />
                          Featured
                        </span>
                      )}

                      <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700">
                        {featuredEditorial.category}
                      </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
                      {featuredEditorial.title}
                    </h2>

                    <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-500">
                      <FaCalendarAlt />
                      {formatDate(
                        featuredEditorial.published_at
                      )}
                    </p>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      {featuredEditorial.summary}
                    </p>

                    <Link
                      href={`/editorial/${featuredEditorial.slug}`}
                      className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 font-black text-white hover:bg-red-800"
                    >
                      Read Editorial
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {remainingEditorials.length > 0 && (
              <section className="mt-12">
                <div>
                  <p className="font-black uppercase tracking-widest text-red-700">
                    Editorial Library
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-gray-950">
                    Latest Analysis
                  </h2>
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {remainingEditorials.map(
                    (editorial) => (
                      <article
                        key={editorial.id}
                        className="flex flex-col overflow-hidden rounded-3xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="h-48 bg-gradient-to-br from-gray-900 to-red-900">
                          {editorial.image_url ? (
                            <img
                              src={editorial.image_url}
                              alt={editorial.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FaPenNib
                                size={55}
                                className="text-white/55"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                              {editorial.category}
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                              <FaCalendarAlt />
                              {formatDate(
                                editorial.published_at
                              )}
                            </span>
                          </div>

                          <h3 className="mt-4 text-xl font-black leading-snug text-gray-950">
                            {editorial.title}
                          </h3>

                          <p className="mt-3 line-clamp-4 leading-7 text-gray-600">
                            {editorial.summary}
                          </p>

                          {Array.isArray(editorial.tags) &&
                            editorial.tags.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {editorial.tags
                                  .slice(0, 3)
                                  .map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                              </div>
                            )}

                          <Link
                            href={`/editorial/${editorial.slug}`}
                            className="mt-6 inline-flex items-center gap-2 font-black text-red-700"
                          >
                            Read Analysis
                            <FaArrowRight size={13} />
                          </Link>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <section className="mt-12 rounded-3xl bg-gray-950 p-7 text-white shadow-xl sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <FaCrown className="text-4xl text-yellow-400" />

              <h2 className="mt-4 text-3xl font-black">
                Unlock Complete Editorial Analysis
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-gray-300">
                Premium members get the complete analysis,
                important arguments and examination relevance.
              </p>
            </div>

            <Link
              href="/subscribe"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-red-600 px-7 py-3.5 font-black text-white hover:bg-red-700"
            >
              Become Premium
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}