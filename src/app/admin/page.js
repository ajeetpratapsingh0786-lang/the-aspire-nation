"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  FaArchive,
  FaCheckCircle,
  FaExclamationTriangle,
  FaNewspaper,
  FaPlay,
  FaRobot,
  FaSignOutAlt,
  FaUpload,
} from "react-icons/fa";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}

function statusClass(status) {
  if (status === "published") return "bg-emerald-100 text-emerald-800";
  if (status === "review") return "bg-blue-100 text-blue-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  if (status === "paused") return "bg-blue-100 text-blue-800";
  if (status === "running" || status === "queued") return "bg-amber-100 text-amber-800";
  return "bg-slate-200 text-slate-700";
}

export default function EditorialControlRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editions, setEditions] = useState([]);
  const [latestRun, setLatestRun] = useState(null);
  const [premiumUsers, setPremiumUsers] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    initialise();
  }, []);

  async function initialise() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      await loadControlRoom(session.access_token);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load the editorial control room.");
    } finally {
      setLoading(false);
    }
  }

  async function loadControlRoom(accessToken) {
    const response = await fetch("/api/admin/control-room", {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Could not load the editorial control room.");
    }

    setEditions(payload.editions || []);
    setLatestRun(payload.latestRun || null);
    setPremiumUsers(payload.premiumUsers || 0);
    setMonthlyRevenue(Number(payload.monthlyRevenue || 0));
  }

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      setLoggingOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  const groupedEditions = useMemo(() => {
    const groups = new Map();
    for (const edition of editions) {
      const key = edition.publication_date || "Unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(edition);
    }
    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  }, [editions]);

  const todayGroup = groupedEditions[0] || null;
  const liveEditions = todayGroup?.items.filter((edition) => edition.status === "published") || [];
  const storyCount = todayGroup?.items.reduce(
    (total, edition) => total + Number(edition.news_articles?.[0]?.count || 0),
    0
  ) || 0;
  const englishEdition = todayGroup?.items.find((edition) => edition.language === "ENGLISH");
  const hindiEdition = todayGroup?.items.find((edition) => edition.language === "HINDI");
  const bothLanguagesLive = Boolean(
    englishEdition?.status === "published" && hindiEdition?.status === "published"
  );
  const runStatus = bothLanguagesLive
    ? "published"
    : latestRun?.display_status || latestRun?.status || "idle";

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-red-600" />
          <p className="mt-4 font-bold text-slate-600">Opening editorial control room…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-7">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-7 p-7 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-400">
              The Aspire Nation
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Editorial Control Room
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Produce, review, approve and publish the complete bilingual daily edition from one place.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-400">
              Signed in as {user?.email}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/newsroom-automation"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700"
              >
                <FaPlay /> Open AI Newsroom
              </Link>
              <Link
                href="/admin/newsroom-editions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-black text-white hover:bg-white/20"
              >
                <FaNewspaper /> Review Editions
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-slate-950 disabled:opacity-60"
              >
                <FaSignOutAlt /> {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-400">Production status</p>
                <p className="mt-1 text-2xl font-black capitalize">{runStatus}</p>
              </div>
              <div className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${statusClass(runStatus)}`}>
                {runStatus}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm">
              <div>
                <p className="text-slate-400">Stage</p>
                <p className="mt-1 font-black">{latestRun?.display_stage || latestRun?.stage || "Ready"}</p>
              </div>
              <div>
                <p className="text-slate-400">Current page</p>
                <p className="mt-1 font-black">{latestRun?.current_page || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <FaExclamationTriangle className="mt-1 shrink-0" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Today’s edition</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {todayGroup ? formatDate(todayGroup.date) : "Not started"}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {liveEditions.length ? `${liveEditions.length} language edition(s) live` : "Awaiting publication"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Stories</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{storyCount}</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">Across English and Hindi</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Active Premium</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{premiumUsers}</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">Candidate subscriptions</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Monthly revenue</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            ₹{monthlyRevenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">Recorded payments</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Today</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Edition readiness</h2>
            </div>
            {todayGroup ? (
              <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${liveEditions.length === todayGroup.items.length ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {liveEditions.length === todayGroup.items.length ? "LIVE" : "IN PROGRESS"}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[englishEdition, hindiEdition].map((edition, index) => {
              const language = index === 0 ? "ENGLISH" : "HINDI";
              return (
                <div key={language} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-950">{language}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(edition?.status || "missing")}`}>
                      {(edition?.status || "missing").toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {edition ? `${edition.news_articles?.[0]?.count || 0} stories` : "No edition found"}
                  </p>
                  {edition ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/newsroom-editions/${edition.id}`}
                        className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white"
                      >
                        Review
                      </Link>
                      {edition.status === "published" ? (
                        <Link
                          href={`/newspaper/${edition.id}?page=1`}
                          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-black text-white"
                        >
                          View live
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Quick actions</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Newsroom tools</h2>
          <div className="mt-5 grid gap-3">
            <Link href="/admin/newsroom-automation" className="flex items-center gap-3 rounded-2xl bg-slate-950 p-4 font-black text-white">
              <FaRobot /> Generate or resume today’s edition
            </Link>
            <Link href="/admin/newsroom-editions" className="flex items-center gap-3 rounded-2xl bg-red-700 p-4 font-black text-white">
              <FaCheckCircle /> Review and approve editions
            </Link>
            <Link href="/newspaper" className="flex items-center gap-3 rounded-2xl bg-slate-700 p-4 font-black text-white">
              <FaArchive /> View public archive
            </Link>
            <Link href="/admin/upload" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-black text-slate-800">
              <FaUpload /> Manual PDF upload
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">History</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Previous editions</h2>
          </div>
          <Link href="/admin/newsroom-editions" className="font-black text-red-700">View all editions →</Link>
        </div>

        <div className="mt-6 grid gap-3">
          {groupedEditions.slice(0, 5).map((group) => {
            const liveCount = group.items.filter((item) => item.status === "published").length;
            return (
              <div key={group.date} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-black text-slate-950">{formatDate(group.date)}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {group.items.length} edition(s) · {group.items.reduce((total, item) => total + Number(item.news_articles?.[0]?.count || 0), 0)} stories
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${liveCount === group.items.length ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {liveCount === group.items.length ? "LIVE" : "REVIEW"}
                  </span>
                  {group.items[0] ? (
                    <Link href={`/admin/newsroom-editions/${group.items[0].id}`} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white">
                      Open
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}

          {!groupedEditions.length ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">No newsroom editions found yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
