"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RewriteEditionButton({ editionId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function rewriteEdition() {
    if (loading) return;
    setLoading(true);
    setMessage("V14 editorial desk is rewriting Page 1…");

    try {
      let total = 0;
      const failures = [];

      for (let page = 1; page <= 8; page += 1) {
        setMessage(`V14 editorial desk: rewriting Page ${page} of 8…`);
        const response = await fetch("/api/admin/newsroom/rewrite-edition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editionId, page }),
        });
        const data = await response.json();
        if (!response.ok) {
          failures.push(`Page ${page}: ${data.error || "failed"}`);
          continue;
        }
        total += Number(data.updated || 0);
        if (Array.isArray(data.failures) && data.failures.length) {
          const first = data.failures[0]?.error || "article rewrite failed";
          failures.push(`Page ${page}: ${data.failures.length} article(s) failed — ${first}`);
        }
      }

      if (failures.length) {
        setMessage(`${total} stories rewritten. ${failures[0]}`);
      } else if (total === 0) {
        setMessage("No stories were rewritten. Check OPENAI_API_KEY, OPENAI_TEXT_MODEL and the server terminal.");
      } else {
        setMessage(`${total} stories rewritten in professional newsroom style.`);
      }
      router.refresh();
    } catch (error) {
      setMessage(error?.message || "Editorial rewrite failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={rewriteEdition}
        disabled={loading}
        className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Editorial Rewrite Running…" : "Rewrite Edition — V14"}
      </button>
      {message ? <span className="max-w-[300px] text-xs leading-4 text-slate-300">{message}</span> : null}
    </div>
  );
}
