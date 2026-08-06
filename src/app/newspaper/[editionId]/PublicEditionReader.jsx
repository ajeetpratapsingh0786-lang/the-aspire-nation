"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function shortText(value = "", limit = 420) {
  const text = String(value || "").trim();
  return text.length <= limit ? text : `${text.slice(0, limit).trim()}…`;
}

export default function PublicEditionReader({ edition, articles }) {
  const searchParams = useSearchParams();
  const currentPage = Math.min(8, Math.max(1, Number(searchParams.get("page") || 1)));
  const [premium, setPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSubscription() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        if (active) { setPremium(false); setChecking(false); }
        return;
      }

      const { data } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const now = Date.now();
      const valid = (data || []).some((item) => !item.expiry_date || new Date(item.expiry_date).getTime() >= now);
      if (active) { setPremium(valid); setChecking(false); }
    }

    checkSubscription();
    return () => { active = false; };
  }, []);

  const pageArticles = useMemo(
    () => articles.filter((article) => Number(article.page || 1) === currentPage),
    [articles, currentPage]
  );

  const locked = currentPage > 1 && !premium;

  return (
    <main className="min-h-screen bg-slate-700 px-3 py-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-red-400">Public Reader</p>
              <h1 className="mt-1 text-2xl font-black">{edition.masthead_title || "THE ASPIRE NATION"}</h1>
              <p className="text-sm text-slate-400">{edition.publication_date || edition.news_date || ""} · {edition.language || ""}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/saved-articles" className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold">Saved Articles</Link>
              <Link href="/my-notes" className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold">My Notes</Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_, index) => index + 1).map((page) => (
              <Link
                key={page}
                href={`/newspaper/${edition.id}?page=${page}`}
                className={`rounded-lg px-4 py-2 text-sm font-black ${currentPage === page ? "bg-red-700" : "bg-white/10 hover:bg-white/20"}`}
              >
                Page {page}{page > 1 && !premium ? " 🔒" : ""}
              </Link>
            ))}
          </div>
        </div>

        <section className="relative mx-auto min-h-[1200px] max-w-[1024px] bg-white p-7 shadow-2xl">
          <header className="border-b-4 border-blue-950 pb-4 text-center">
            <h2 className="text-5xl font-black tracking-tight text-blue-950">THE ASPIRE NATION</h2>
            <p className="mt-2 text-sm font-bold text-red-800">Every Aspirant’s Morning Starts Here</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">Page {currentPage}</p>
          </header>

          {locked ? (
            <div className="flex min-h-[950px] items-center justify-center px-6 text-center">
              <div className="max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-xl">
                <div className="text-5xl">🔒</div>
                <h2 className="mt-4 text-3xl font-black text-slate-950">Page {currentPage} is for Premium members</h2>
                <p className="mt-3 text-slate-700">Page 1 and all of its full articles are free. Premium unlocks Pages 2–8, full articles, saved stories, subject-wise notes and the archive.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/subscribe" className="rounded-xl bg-red-700 px-6 py-3 font-black text-white">Unlock Premium</Link>
                  <Link href={`/newspaper/${edition.id}?page=1`} className="rounded-xl bg-blue-950 px-6 py-3 font-black text-white">Back to Page 1</Link>
                </div>
              </div>
            </div>
          ) : checking ? (
            <div className="flex min-h-[900px] items-center justify-center text-lg font-bold">Checking access…</div>
          ) : (
            <div className="mt-6 columns-3 gap-6 [column-fill:auto]">
              {pageArticles.map((article, index) => (
                <article key={article.id} className="mb-6 break-inside-avoid border-b border-slate-200 pb-4">
                  {index < 2 && article.image_url ? (
                    <img src={article.image_url} alt={article.headline || "News visual"} className="mb-3 h-44 w-full object-cover" />
                  ) : null}
                  <h3 className={`${index === 0 ? "text-3xl" : "text-xl"} font-black leading-tight text-slate-950`}>{article.headline}</h3>
                  {article.deck ? <p className="mt-2 text-sm font-bold text-slate-600">{shortText(article.deck, 240)}</p> : null}
                  <p className="mt-3 text-sm leading-6 text-slate-800">{shortText(article.body, index === 0 ? 850 : 430)}</p>
                  <Link href={`/newspaper/${edition.id}/article/${article.id}`} className="mt-3 inline-block text-sm font-black text-blue-950 hover:underline">
                    {edition.language === "HINDI" ? "पूरा लेख पढ़ें →" : "Read full article →"}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
