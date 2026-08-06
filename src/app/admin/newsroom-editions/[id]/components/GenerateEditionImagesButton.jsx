"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateEditionImagesButton({ editionId, missingCount = 0 }) {
  const router = useRouter();
  const autoStarted = useRef(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generate({ automatic = false } = {}) {
    if (loading || missingCount === 0) return;

    setLoading(true);
    setMessage(automatic ? "Preparing AI visuals automatically…" : "Generating selected visuals…");

    try {
      const response = await fetch("/api/admin/newsroom/generate-edition-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId, count: 10 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image generation failed.");

      const completed = (data.results || []).filter((item) => item.ok).length;
      setMessage(`${completed} AI visual${completed === 1 ? "" : "s"} created.`);
      localStorage.setItem(`aspire-ai-images-${editionId}`, "done");
      router.refresh();
    } catch (error) {
      setMessage(error?.message || "Image generation failed. Check the API key and Supabase image bucket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoStarted.current || missingCount === 0) return;
    autoStarted.current = true;

    const key = `aspire-ai-images-${editionId}`;
    if (!localStorage.getItem(key)) {
      const timer = window.setTimeout(() => generate({ automatic: true }), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [editionId, missingCount]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => generate()}
        disabled={loading || missingCount === 0}
        className="rounded-lg bg-fuchsia-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-fuchsia-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating AI Images…" : `Create AI Images (${Math.min(missingCount, 10)})`}
      </button>

      {message ? (
        <span className="max-w-[260px] text-xs leading-4 text-slate-300">{message}</span>
      ) : null}
    </div>
  );
}
