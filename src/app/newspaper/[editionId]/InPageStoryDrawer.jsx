"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import VisualNotes from "@/components/article/VisualNotes";
import { supplementaryOptions, shouldOfferCompleteAnalysis } from "@/lib/newspaperSupplement";

function splitFacts(value = "") {
  return String(value || "")
    .split(/\n|•|;/)
    .map((item) => item.replace(/^[-–—\s]+/, "").trim())
    .filter(Boolean);
}

function buildTimeline(article) {
  const text = [article.body, article.fact_box, article.deck].filter(Boolean).join(" ");
  const years = [...new Set((text.match(/\b(?:19|20)\d{2}\b/g) || []))].slice(0, 5);
  return years.map((year) => ({ year, text: text.split(year)[1]?.trim().slice(0, 130) || article.headline }));
}

function SupplementPanel({ type, article, hindi }) {
  const facts = splitFacts(article.fact_box);
  if (type === "visual-notes" || type === "scheme" || type === "smart-revision") {
    return <VisualNotes article={article} hindi={hindi} />;
  }
  if (type === "timeline") {
    const timeline = buildTimeline(article);
    return (
      <div className="space-y-4 rounded-2xl bg-amber-50 p-5">
        <h3 className="text-xl font-black text-amber-950">{hindi ? "मुख्य टाइमलाइन" : "Key timeline"}</h3>
        {(timeline.length ? timeline : [{ year: "Now", text: article.deck || article.body }]).map((item, index) => (
          <div key={`${item.year}-${index}`} className="grid grid-cols-[70px_1fr] gap-4">
            <div className="rounded-lg bg-amber-200 px-2 py-2 text-center font-black text-amber-950">{item.year}</div>
            <p className="border-l-2 border-amber-300 pl-4 leading-7 text-slate-800">{item.text}</p>
          </div>
        ))}
      </div>
    );
  }
  if (type === "data") {
    const values = [...new Set(([article.body, article.fact_box].join(" ").match(/(?:₹\s?)?\d[\d,.]*(?:\s?(?:%|crore|lakh|million|billion|km|GW|MW))?/gi) || []))].slice(0, 8);
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(values.length ? values : facts.slice(0, 4)).map((value, index) => (
          <div key={`${value}-${index}`} className="rounded-2xl bg-blue-50 p-4">
            <p className="text-2xl font-black text-blue-950">{value}</p>
            <p className="mt-2 text-sm leading-5 text-slate-600">{facts[index] || article.deck || article.headline}</p>
          </div>
        ))}
      </div>
    );
  }
  if (type === "map") {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6">
        <h3 className="text-xl font-black text-emerald-950">{hindi ? "स्थान और संदर्भ" : "Place and context"}</h3>
        <p className="mt-3 leading-7 text-slate-800">{article.deck || article.exam_connection || article.body}</p>
        <p className="mt-4 rounded-xl bg-white p-4 text-sm font-bold text-emerald-900">{hindi ? "यह एक संदर्भ पैनल है; केवल सत्यापित भौगोलिक जानकारी ही दिखाई जाती है।" : "This context panel uses only verified geographic information from the story."}</p>
      </div>
    );
  }
  return null;
}

export default function InPageStoryDrawer({ edition, articles, currentPage }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const storyId = searchParams.get("story");
  const requestedTool = searchParams.get("tool");
  const [activeTool, setActiveTool] = useState(requestedTool || "article");
  const article = useMemo(() => articles.find((item) => String(item.id) === String(storyId)), [articles, storyId]);
  const options = article ? supplementaryOptions(article) : [];
  const hindi = String(edition.language || "").toUpperCase() === "HINDI";

  useEffect(() => setActiveTool(requestedTool || "article"), [requestedTool, storyId]);
  useEffect(() => {
    if (!storyId) return undefined;
    const onKey = (event) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  function close() {
    router.replace(`${pathname}?page=${currentPage}`, { scroll: false });
  }

  if (!article) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/55" role="dialog" aria-modal="true" aria-label={article.headline}>
      <button type="button" aria-label="Close article" onClick={close} className="absolute inset-0 cursor-default" />
      <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-700">{article.section || (hindi ? "करंट अफेयर्स" : "Current Affairs")}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{hindi ? `पेज ${currentPage} · अखबार पढ़ना जारी रखें` : `Page ${currentPage} · continue newspaper reading`}</p>
          </div>
          <button type="button" onClick={close} className="rounded-full bg-slate-100 px-4 py-2 text-lg font-black text-slate-900">×</button>
        </div>

        <div className="p-6 md:p-9">
          <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">{article.headline}</h2>
          {article.deck ? <p className="mt-4 text-lg font-semibold leading-7 text-slate-600">{article.deck}</p> : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {shouldOfferCompleteAnalysis(article) ? (
              <button type="button" onClick={() => setActiveTool("article")} className={`rounded-xl px-4 py-2 text-sm font-black ${activeTool === "article" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}>
                {hindi ? "पूरा विश्लेषण" : "Complete analysis"}
              </button>
            ) : null}
            {options.map((option) => (
              <button key={option.id} type="button" onClick={() => setActiveTool(option.id)} className={`rounded-xl px-4 py-2 text-sm font-black ${activeTool === option.id ? "bg-red-700 text-white" : "bg-slate-100 text-slate-800"}`}>
                {hindi ? option.hindiLabel : option.label}
              </button>
            ))}
          </div>

          {activeTool === "article" ? (
            <>
              {article.image_url ? <img src={article.image_url} alt={article.caption || article.headline} className="mt-7 max-h-[400px] w-full rounded-2xl object-cover" /> : null}
              <div className="mt-7 whitespace-pre-line text-[17px] leading-8 text-slate-900">{article.body}</div>
              {article.fact_box ? (
                <div className="mt-7 rounded-2xl bg-amber-50 p-5">
                  <h3 className="font-black text-amber-950">{hindi ? "याद रखने योग्य तथ्य" : "Facts to remember"}</h3>
                  <ul className="mt-3 space-y-2 text-slate-800">{splitFacts(article.fact_box).map((fact, index) => <li key={index}>• {fact}</li>)}</ul>
                </div>
              ) : null}
            </>
          ) : <div className="mt-7"><SupplementPanel type={activeTool} article={article} hindi={hindi} /></div>}

          {article.source_url ? <a href={article.source_url} target="_blank" rel="noreferrer" className="mt-8 inline-block text-sm font-black text-blue-900 underline">{hindi ? "आधिकारिक स्रोत देखें" : "Verify official source"}</a> : null}
        </div>
      </aside>
    </div>
  );
}
