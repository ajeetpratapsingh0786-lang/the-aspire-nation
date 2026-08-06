"use client";

function lines(value = "") {
  return String(value || "")
    .split(/\n|•|;/)
    .map((item) => item.replace(/^[-–—*\s]+/, "").trim())
    .filter(Boolean);
}

function sentences(value = "") {
  return String(value || "")
    .split(/(?<=[.!?।])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 28);
}

function pickNumbers(article) {
  const source = `${article.headline || ""} ${article.deck || ""} ${article.fact_box || ""}`;
  const matches = source.match(/(?:₹\s?)?\d[\d,.]*(?:\s?(?:%|crore|lakh|million|billion|km|MW|GW|years?|days?))?/gi) || [];
  return [...new Set(matches.map((item) => item.trim()))].slice(0, 4);
}

function pickTimeline(article) {
  const source = `${article.fact_box || ""}\n${article.body || ""}`;
  const datePattern = /\b(?:19|20)\d{2}\b|\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2}\b/gi;
  const dates = [...new Set(source.match(datePattern) || [])].slice(0, 5);
  const context = sentences(source);
  return dates.map((date) => ({
    date,
    text: context.find((item) => item.includes(date)) || "Important date connected with this topic.",
  }));
}

export default function VisualNotes({ article, hindi = false }) {
  const facts = lines(article.fact_box).slice(0, 8);
  const exam = lines(article.exam_connection).slice(0, 4);
  const keyPoints = sentences(`${article.deck || ""} ${article.body || ""}`).slice(0, 5);
  const numbers = pickNumbers(article);
  const timeline = pickTimeline(article);

  return (
    <section className="visual-notes-paper relative overflow-hidden rounded-3xl border border-amber-200 bg-[#fffdf4] px-5 py-7 shadow-sm md:px-9 md:py-10">
      <style jsx>{`
        .visual-notes-paper {
          background-image:
            linear-gradient(rgba(59,130,246,.10) 1px, transparent 1px),
            linear-gradient(90deg, transparent 0, transparent 42px, rgba(239,68,68,.18) 43px, transparent 44px);
          background-size: 100% 30px, 100% 100%;
        }
        .hand-title { font-family: "Comic Sans MS", "Segoe Print", cursive; }
        .marker { box-shadow: inset 0 -0.42em rgba(250,204,21,.35); }
        .note-arrow::before { content: "→"; margin-right: .65rem; color: #b91c1c; font-weight: 900; }
      `}</style>

      <div className="ml-8 md:ml-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
              {hindi ? "त्वरित रिवीजन शीट" : "Quick Revision Sheet"}
            </p>
            <h2 className="hand-title marker mt-2 inline text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              {article.headline}
            </h2>
          </div>
          <span className="rotate-2 rounded-lg border-2 border-red-700 px-3 py-1 text-xs font-black uppercase text-red-700">
            {article.visual_type || (hindi ? "विजुअल नोट्स" : "Visual notes")}
          </span>
        </div>

        {article.deck ? (
          <div className="mt-7 -rotate-1 rounded-xl bg-amber-100/90 px-5 py-4 text-lg font-bold leading-8 text-slate-800">
            {article.deck}
          </div>
        ) : null}

        {numbers.length ? (
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {numbers.map((number) => (
              <div key={number} className="rounded-xl border-2 border-dashed border-blue-300 bg-white/80 p-3 text-center">
                <div className="hand-title text-2xl font-black text-blue-950">{number}</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{hindi ? "मुख्य आंकड़ा" : "Key number"}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-blue-200 bg-white/80 p-5">
            <h3 className="hand-title text-2xl font-black text-blue-950">{hindi ? "विषय को ऐसे समझें" : "Understand the topic"}</h3>
            <ol className="mt-4 space-y-3">
              {keyPoints.map((point, index) => (
                <li key={`${index}-${point.slice(0, 18)}`} className="flex gap-3 leading-7 text-slate-800">
                  <span className="hand-title grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-blue-700 font-black text-blue-900">{index + 1}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5">
            <h3 className="hand-title text-2xl font-black text-amber-950">{hindi ? "परीक्षा के लिए याद रखें" : "Remember for exams"}</h3>
            <ul className="mt-4 space-y-3">
              {facts.map((fact, index) => (
                <li key={`${index}-${fact}`} className="note-arrow leading-7 text-amber-950">{fact}</li>
              ))}
            </ul>
          </div>
        </div>

        {timeline.length ? (
          <div className="mt-7 rounded-2xl border-2 border-dashed border-violet-300 bg-white/85 p-5">
            <h3 className="hand-title text-2xl font-black text-violet-950">{hindi ? "महत्वपूर्ण टाइमलाइन" : "Important timeline"}</h3>
            <div className="mt-5 space-y-4 border-l-4 border-violet-300 pl-5">
              {timeline.map((item) => (
                <div key={item.date} className="relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white bg-violet-700" />
                  <div className="font-black text-violet-900">{item.date}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-700">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {exam.length ? (
          <div className="mt-7 rotate-[0.3deg] rounded-2xl border-2 border-green-300 bg-green-50/90 p-5">
            <h3 className="hand-title text-2xl font-black text-green-950">{hindi ? "प्रिलिम्स + मेन्स कनेक्शन" : "Prelims + Mains connection"}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {exam.slice(0, 3).map((item, index) => (
                <div key={`${index}-${item}`} className="rounded-xl bg-white/80 p-4 leading-7 text-green-950">{item}</div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-7 text-xs font-bold text-slate-500">
          {hindi ? "यह रिवीजन शीट लेख के सत्यापित कंटेंट से स्वतः तैयार की गई है।" : "This revision sheet is generated automatically from the article’s verified content."}
        </p>
      </div>
    </section>
  );
}
