"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCrown,
  FaExclamationTriangle,
  FaLock,
  FaNewspaper,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

export default function CurrentAffairsArticlePage() {
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const [article, setArticle] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!slug) {
        setErrorMessage("Invalid article address.");
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          router.replace(
            `/login?redirect=/current-affairs/${encodeURIComponent(slug)}`
          );
          return;
        }

        const response = await fetch(
          `/api/current-affairs/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace(
              `/login?redirect=/current-affairs/${encodeURIComponent(slug)}`
            );
            return;
          }

          if (response.status === 403) {
            router.replace("/subscribe");
            return;
          }

          throw new Error(
            result?.error || "Unable to load the premium article."
          );
        }

        setArticle(result.article);
        setSubscription(result.subscription);
      } catch (error) {
        console.error("Premium article error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to open this article."
        );
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug, router]);

  function formatDate(value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function renderContent(content) {
    if (!content) return null;

    return content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph, index) => (
        <p
          key={`${paragraph.slice(0, 30)}-${index}`}
          className="mb-5 text-lg leading-8 text-gray-700"
        >
          {paragraph}
        </p>
      ));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-300">
            Checking premium access...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-2xl text-red-600" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-gray-900">
            Unable to Open Article
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage || "The requested article was not found."}
          </p>

          <Link
            href="/current-affairs"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            <FaArrowLeft />
            Return to Current Affairs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-950 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/current-affairs"
            className="inline-flex items-center gap-2 font-bold text-red-400 hover:text-red-300"
          >
            <FaArrowLeft />
            Back to Current Affairs
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-red-600/20 px-4 py-2 text-sm font-bold text-red-300">
              {article.category}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-green-700 bg-green-950/60 px-4 py-2 text-sm font-bold text-green-300">
              <FaLock />
              Premium Article
            </span>

            {article.is_featured && (
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2 text-sm font-bold text-yellow-300">
                <FaCrown />
                Featured
              </span>
            )}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            {article.title}
          </h1>

          <div className="mt-5 flex items-center gap-2 text-gray-400">
            <FaCalendarAlt />
            {formatDate(article.published_at)}
          </div>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-gray-300">
            {article.summary}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="max-h-[560px] w-full rounded-3xl object-cover shadow-xl"
          />
        ) : (
          <div className="flex h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-900 to-red-900 shadow-xl">
            <FaNewspaper size={80} className="text-white/70" />
          </div>
        )}

        <article className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-10">
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-4">
              <FaCrown className="mt-1 shrink-0 text-yellow-600" size={24} />

              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Premium Current Affairs Analysis
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Your {subscription?.plan || "premium"} subscription gives
                  access to the complete explanation and exam-focused analysis.
                </p>
              </div>
            </div>
          </div>

          <div>{renderContent(article.content)}</div>

          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="mt-10 border-t border-gray-200 pt-6">
              <p className="font-black text-gray-900">Related Topics</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <section className="mt-8 rounded-3xl bg-gray-950 p-7 text-white shadow-xl sm:p-10">
          <h2 className="text-2xl font-black">
            Continue Your Daily Preparation
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-gray-300">
            Read today&apos;s e-paper, review editorials and practise the daily
            quiz from your premium dashboard.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/epaper"
              className="rounded-xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-700"
            >
              Open E-Paper
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-black text-white hover:bg-white/20"
            >
              My Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}