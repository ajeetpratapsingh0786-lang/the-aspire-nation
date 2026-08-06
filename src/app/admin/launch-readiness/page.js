"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { FaCheckCircle, FaExclamationTriangle, FaRocket, FaSyncAlt, FaTimesCircle } from "react-icons/fa";

function Badge({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800"><FaCheckCircle /> PASS</span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800"><FaTimesCircle /> CHECK</span>
  );
}

export default function LaunchReadinessPage() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  async function runCheck() {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Administrator login required.");
      const response = await fetch("/api/admin/launch-readiness", {
        cache: "no-store",
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Launch check failed.");
      setPayload(data);
    } catch (err) {
      setError(err.message || "Launch check failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runCheck(); }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">Release 1.0</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Launch Readiness</h1>
            <p className="mt-3 max-w-2xl text-slate-300">One final control point for environment, database, automation, bilingual editions and newspaper quality.</p>
          </div>
          <button onClick={runCheck} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-slate-950 disabled:opacity-60">
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> {loading ? "Checking…" : "Run checks again"}
          </button>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-800">{error}</div> : null}

      {payload ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Readiness score</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{payload.score}%</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Critical failures</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{payload.criticalFailures}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Warnings</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{payload.warnings}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Latest edition</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{payload.latestDate || "None"}</p>
            </div>
          </section>

          <section className={`rounded-3xl border p-6 shadow-sm ${payload.launchReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-start gap-4">
              {payload.launchReady ? <FaRocket className="mt-1 text-emerald-700" size={28} /> : <FaExclamationTriangle className="mt-1 text-amber-700" size={28} />}
              <div>
                <h2 className="text-2xl font-black text-slate-950">{payload.launchReady ? "Ready for final production deployment" : "Resolve remaining checks before public launch"}</h2>
                <p className="mt-2 text-slate-700">Last checked {new Date(payload.checkedAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6"><h2 className="text-2xl font-black text-slate-950">Launch checks</h2></div>
            <div className="divide-y divide-slate-100">
              {payload.checks.map((item) => (
                <div key={item.label} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><p className="font-black text-slate-950">{item.label}</p><p className="mt-1 text-sm text-slate-600">{item.detail}</p></div>
                  <Badge ok={item.ok} />
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <Link href="/admin/newsroom-automation" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">AI Newsroom</Link>
            <Link href="/admin/newsroom-editions" className="rounded-xl bg-red-700 px-5 py-3 font-black text-white">Review Editions</Link>
            <Link href="/newspaper" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800">Public Newspaper</Link>
          </section>
        </>
      ) : null}
    </main>
  );
}
