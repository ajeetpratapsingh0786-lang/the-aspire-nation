"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function MyNotesPage() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading notes…");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) { setMessage("Please login to view your notes."); return; }
      const response = await fetch("/api/user/notes", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Could not load notes."); return; }
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
        <h1 className="text-4xl font-black">My Subject-wise Notes</h1>
        <p className="mt-2 text-slate-600">Notes are automatically sorted using each article’s subject.</p>
        {message ? <div className="mt-7 rounded-2xl bg-white p-6 shadow">{message}</div> : null}
        <div className="mt-8 space-y-8">
          {Object.entries(groups).map(([subject, notes]) => (
            <section key={subject}>
              <h2 className="text-2xl font-black text-blue-950">{subject}</h2>
              <div className="mt-4 space-y-4">
                {notes.map((item) => (
                  <article key={item.id} className="rounded-2xl bg-white p-6 shadow">
                    <h3 className="text-lg font-black">{item.headline}</h3>
                    <p className="mt-3 whitespace-pre-line leading-7 text-slate-800">{item.note}</p>
                    <Link href={`/newspaper/${item.edition_id}/article/${item.article_id}`} className="mt-4 inline-block font-black text-blue-900">Open source article →</Link>
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
