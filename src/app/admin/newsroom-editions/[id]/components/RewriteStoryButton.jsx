"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RewriteStoryButton({ editionId, articleId, hindi = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function rewrite() {
    setLoading(true);
    setMessage(hindi ? "संपादकीय सुधार चल रहा है…" : "Editorial rewrite in progress…");
    try {
      const response = await fetch("/api/admin/newsroom/rewrite-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId, articleId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Rewrite failed.");
      setMessage(hindi ? "स्टोरी सुधार दी गई है।" : "Story rewritten successfully.");
      router.refresh();
    } catch (error) {
      setMessage(error?.message || "Rewrite failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={rewrite} disabled={loading}
        className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800 disabled:opacity-60">
        {loading ? (hindi ? "सुधार जारी…" : "Rewriting…") : (hindi ? "V14 से स्टोरी सुधारें" : "Rewrite with V14")}
      </button>
      {message ? <span className="text-xs text-slate-500">{message}</span> : null}
    </div>
  );
}
