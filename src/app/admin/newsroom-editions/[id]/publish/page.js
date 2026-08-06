"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  FaCheckCircle,
  FaExternalLinkAlt,
  FaGlobe,
  FaNewspaper,
} from "react-icons/fa";

function formatPublishedAt(value) {
  if (!value) return "Not recorded";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function PublishEditionPage() {
  const params = useParams();
  const editionId = String(params?.id || "");

  const [loading, setLoading] = useState(false);
  const [loadingEdition, setLoadingEdition] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [edition, setEdition] = useState(null);
  const [articleCount, setArticleCount] = useState(0);
  const [qualityReport, setQualityReport] = useState(null);

  const published = edition?.status === "published";

  useEffect(() => {
    if (!editionId) return;
    loadEdition();
  }, [editionId]);

  async function loadEdition() {
    setLoadingEdition(true);
    try {
      const [{ data: editionData, error: editionError }, articlesResponse] =
        await Promise.all([
          supabase
            .from("news_editions")
            .select("*")
            .eq("id", editionId)
            .maybeSingle(),
          supabase
            .from("news_articles")
            .select("id", { count: "exact", head: true })
            .eq("edition_id", editionId),
        ]);

      if (editionError) throw editionError;
      setEdition(editionData || null);
      setArticleCount(articlesResponse.count || 0);
    } catch (error) {
      setErrorMessage(error.message || "Could not load edition details.");
    } finally {
      setLoadingEdition(false);
    }
  }

  async function approveEdition() {
    try {
      setLoading(true);
      setMessage("");
      setErrorMessage("");

      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Please log in as administrator first.");

      const response = await fetch("/api/admin/newsroom/publish-edition", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ editionId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Publishing failed.");

      setEdition(result.edition || edition);
      setQualityReport(result.qualityReport || null);
      setMessage(
        result.qualityReport?.warnings?.length
          ? `Edition is live with ${result.qualityReport.warnings.length} non-blocking quality warning(s).`
          : "Edition approved and published successfully."
      );
    } catch (error) {
      setErrorMessage(error.message || "Publishing failed.");
    } finally {
      setLoading(false);
    }
  }

  const checks = useMemo(
    () => [
      { label: "Edition status", value: published ? "LIVE" : "Ready for approval" },
      { label: "Language", value: edition?.language || "—" },
      { label: "Articles", value: String(articleCount || 0) },
      { label: "Public archive", value: published ? "Updated" : "Pending" },
      { label: "Candidate access", value: published ? "Active" : "Pending" },
      { label: "Publication time", value: formatPublishedAt(edition?.published_at) },
    ],
    [articleCount, edition, published]
  );

  if (loadingEdition) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="font-bold text-slate-600">Loading edition status…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
              Edition Approval
            </p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              {published ? "Today’s edition is live" : "Approve this edition"}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Page 1 and its articles remain free. Pages 2–8 and their articles
              require an active Premium subscription.
            </p>
          </div>

          <div className={`rounded-2xl px-5 py-3 text-center font-black ${published ? "bg-emerald-500 text-white" : "bg-amber-300 text-slate-950"}`}>
            {published ? "LIVE" : "AWAITING APPROVAL"}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-red-700">
              {edition?.language || "Edition"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {edition?.title || "The Aspire Nation"}
            </h2>
            <p className="mt-2 text-slate-600">
              Publication date: {edition?.publication_date || "Not available"}
            </p>
          </div>

          {!published ? (
            <button
              onClick={approveEdition}
              disabled={loading}
              className="rounded-xl bg-red-700 px-7 py-4 font-black text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Approving and publishing…" : "Approve Edition"}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 font-black text-emerald-800 ring-1 ring-emerald-200">
              <FaCheckCircle /> Published successfully
            </div>
          )}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => (
            <div key={check.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                {check.label}
              </p>
              <p className="mt-2 font-black text-slate-950">{check.value}</p>
            </div>
          ))}
        </div>

        {qualityReport?.warnings?.length ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <p className="font-black">Non-blocking quality warnings</p>
            <ul className="mt-2 space-y-1 text-sm">
              {qualityReport.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-900 ring-1 ring-emerald-200">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 font-bold text-red-900 ring-1 ring-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/admin/newsroom-editions"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            <FaNewspaper /> Back to Editions
          </Link>
          <Link
            href={`/newspaper/${editionId}?page=1`}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-black text-white"
          >
            <FaExternalLinkAlt /> View Live Newspaper
          </Link>
          <Link
            href="/newspaper"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-black text-white"
          >
            <FaGlobe /> View Archive
          </Link>
        </div>
      </section>
    </main>
  );
}
