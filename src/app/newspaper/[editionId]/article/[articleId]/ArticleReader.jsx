"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import VisualNotes from "@/components/article/VisualNotes";

function facts(value = "") {
  return String(value || "")
    .split(/\n|•|;/)
    .map((item) => item.replace(/^[-–—\s]+/, "").trim())
    .filter(Boolean);
}

export default function ArticleReader({ edition, article }) {
  const isFree = Number(article.page || 1) === 1;
  const [user, setUser] = useState(null);
  const [premium, setPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [readingMode, setReadingMode] = useState("article");

  useEffect(() => {
    let active = true;

    async function loadAccess() {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user || null;
      if (!active) return;
      setUser(currentUser);

      if (!currentUser) {
        setChecking(false);
        return;
      }

      const { data } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const now = Date.now();
      const valid = (data || []).some((item) => !item.expiry_date || new Date(item.expiry_date).getTime() >= now);
      setPremium(valid);
      setChecking(false);
    }

    loadAccess();
    return () => { active = false; };
  }, []);

  async function authorizedFetch(url, options = {}) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) throw new Error("Please login first.");

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  async function saveArticle() {
    try {
      setMessage("");
      const response = await authorizedFetch("/api/user/saved-articles", {
        method: "POST",
        body: JSON.stringify({ articleId: article.id, editionId: edition.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save article.");
      setSaved(true);
      setMessage("Article saved and sorted by subject.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveNote() {
    try {
      setMessage("");
      const response = await authorizedFetch("/api/user/notes", {
        method: "POST",
        body: JSON.stringify({ articleId: article.id, editionId: edition.id, note }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save note.");
      setMessage("Note saved under its subject.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const locked = !isFree && !premium;

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 font-bold">Checking access…</main>;
  }

  if (locked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-xl rounded-3xl bg-white p-9 text-center shadow-2xl">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-3xl font-black">Premium article</h1>
          <p className="mt-3 text-slate-600">Articles from Pages 2–8 are available only to Premium members. Page 1 and its full articles remain free.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/subscribe" className="rounded-xl bg-red-700 px-6 py-3 font-black text-white">Unlock Premium</Link>
            <Link href={`/newspaper/${edition.id}?page=1`} className="rounded-xl bg-blue-950 px-6 py-3 font-black text-white">Open Page 1</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <article className="mx-auto max-w-4xl rounded-3xl bg-white p-7 shadow-xl md:p-12">
        <Link href={`/newspaper/${edition.id}?page=${article.page || 1}`} className="text-sm font-black text-blue-950">← Back to newspaper</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-red-700">{article.section || "Current Affairs"}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 md:text-5xl">{article.headline}</h1>
        {article.deck ? <p className="mt-5 text-xl font-semibold leading-8 text-slate-600">{article.deck}</p> : null}
        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2" role="tablist" aria-label="Article reading mode">
          <button
            type="button"
            role="tab"
            aria-selected={readingMode === "article"}
            onClick={() => setReadingMode("article")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${readingMode === "article" ? "bg-slate-950 text-white shadow" : "text-slate-700 hover:bg-white"}`}
          >
            {edition.language === "HINDI" ? "पूरा लेख पढ़ें" : "Read Full Article"}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={readingMode === "notes"}
            onClick={() => setReadingMode("notes")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${readingMode === "notes" ? "bg-red-700 text-white shadow" : "text-slate-700 hover:bg-white"}`}
          >
            {edition.language === "HINDI" ? "हस्तलिखित विजुअल नोट्स" : "Handwritten Visual Notes"}
          </button>
        </div>

        {readingMode === "notes" ? (
          <div className="mt-7">
            <VisualNotes article={article} hindi={edition.language === "HINDI"} />
          </div>
        ) : (
          <>
            {article.image_url ? <img src={article.image_url} alt={article.caption || article.headline} className="mt-8 max-h-[520px] w-full rounded-2xl object-cover" /> : null}
            {article.caption ? <p className="mt-2 text-xs text-slate-500">{article.caption}</p> : null}

            <div className="mt-9 whitespace-pre-line text-[17px] leading-8 text-slate-900">{article.body}</div>

            {article.fact_box ? (
              <section className="mt-10 rounded-2xl bg-amber-50 p-6">
                <h2 className="text-xl font-black text-amber-950">{edition.language === "HINDI" ? "एग्ज़ाम के लिए जरूरी तथ्य" : "Key Facts for Exams"}</h2>
                <ul className="mt-4 space-y-2">
                  {facts(article.fact_box).map((fact, index) => <li key={index} className="flex gap-3"><span>•</span><span>{fact}</span></li>)}
                </ul>
              </section>
            ) : null}

            {article.exam_connection ? (
              <section className="mt-6 rounded-2xl bg-blue-50 p-6">
                <h2 className="text-xl font-black text-blue-950">{edition.language === "HINDI" ? "एग्ज़ाम कनेक्शन" : "Exam Connection"}</h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-blue-950">{article.exam_connection}</p>
              </section>
            ) : null}
          </>
        )}

        {article.source_name || article.source_url ? (
          <div className="mt-8 border-t pt-5 text-sm text-slate-600">
            <strong>Official source:</strong> {article.source_name || "Official source"}
            {article.source_url ? <a href={article.source_url} target="_blank" rel="noreferrer" className="ml-2 font-bold text-blue-800 underline">Verify source</a> : null}
          </div>
        ) : null}

        {premium ? (
          <section className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <h2 className="text-xl font-black">Save this article</h2>
              <p className="mt-2 text-sm text-slate-300">It will automatically appear under the correct subject.</p>
              <button onClick={saveArticle} className="mt-4 rounded-xl bg-red-700 px-5 py-3 font-black">{saved ? "Saved ✓" : "Save Article"}</button>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-black">Create a note</h2>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} placeholder="Write your revision note..." className="mt-3 w-full rounded-xl border p-3" />
              <button onClick={saveNote} className="mt-3 rounded-xl bg-blue-950 px-5 py-3 font-black text-white">Save Note</button>
            </div>
          </section>
        ) : user ? (
          <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Upgrade to Premium to save articles and create subject-wise notes.</div>
        ) : null}

        {message ? <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-bold">{message}</p> : null}
      </article>
    </main>
  );
}
