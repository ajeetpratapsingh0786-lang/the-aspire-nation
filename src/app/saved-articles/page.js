"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SavedArticlesPage() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading saved articles…");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) { setMessage("Please login to view saved articles."); return; }

      const response = await fetch("/api/user/saved-articles", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Could not load saved articles."); return; }
      setItems(result.items || []);
      setMessage("");
    }
    load();
  }, []);

  const groups = useMemo(() => items.reduce((acc, item) => {
    const subject = item.subject || "General Current Affairs";
    acc[subject] = acc[subject] || [];
    acc[subject].push(item);
    return acc;
  }, {}), [items]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black">Saved Articles</h1>
        <p className="mt-2 text-slate-600">Your articles are automatically grouped by subject.</p>
        {message ? <div className="mt-7 rounded-2xl bg-white p-6 shadow">{message}</div> : null}
        <div className="mt-8 space-y-8">
          {Object.entries(groups).map(([subject, articles]) => (
            <section key={subject}>
              <h2 className="text-2xl font-black text-blue-950">{subject}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {articles.map((item) => (
                  <article key={item.id} className="rounded-2xl bg-white p-5 shadow">
                    <p className="text-xs font-bold text-slate-500">Page {item.page_number}</p>
                    <h3 className="mt-2 text-lg font-black">{item.headline}</h3>
                    <Link href={`/newspaper/${item.edition_id}/article/${item.article_id}`} className="mt-4 inline-block font-black text-blue-900">Open article →</Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
