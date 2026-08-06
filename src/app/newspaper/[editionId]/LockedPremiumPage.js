import Link from "next/link";

export default function LockedPremiumPage({ editionId, pageNumber, language, isSignedIn }) {
  const isHindi = String(language || "").toUpperCase() === "HINDI";

  return (
    <section className="relative mx-auto min-h-[720px] max-w-[1120px] overflow-hidden rounded-2xl bg-slate-200 p-5 shadow-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden rounded-xl bg-white p-6 opacity-35 blur-[10px]"
      >
        <div className="mx-auto h-[88px] max-w-3xl rounded-lg bg-slate-300" />
        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-[1.5fr_0.8fr] gap-5">
          <div className="space-y-4">
            <div className="h-12 rounded bg-slate-400" />
            <div className="h-6 w-4/5 rounded bg-slate-300" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-72 rounded bg-slate-300" />
              <div className="h-72 rounded bg-slate-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-44 rounded bg-slate-300" />
              <div className="h-44 rounded bg-slate-300" />
              <div className="h-44 rounded bg-slate-300" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-52 rounded bg-slate-400" />
            <div className="h-32 rounded bg-slate-300" />
            <div className="h-32 rounded bg-slate-300" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-[2px]">
        <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white p-7 text-center shadow-2xl md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-3xl text-white shadow-lg">🔒</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-red-700">
            {isHindi ? `पृष्ठ ${pageNumber} प्रीमियम है` : `Page ${pageNumber} is Premium`}
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            {isHindi ? "पूरा अखबार पढ़ने के लिए प्रीमियम लें" : "Unlock the complete newspaper"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            {isHindi
              ? "पृष्ठ 1 सभी पाठकों के लिए मुफ्त है। पृष्ठ 2 से 8, उनके पूरे लेख, सेव किए गए लेख और विषयवार नोट्स प्रीमियम सदस्यों के लिए उपलब्ध हैं।"
              : "Page 1 is free for everyone. Pages 2–8, their complete articles, saved articles and subject-wise notes are available to Premium members."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/subscribe" className="rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white hover:bg-red-800">
              {isHindi ? "प्रीमियम सदस्यता लें" : "Buy Premium Subscription"}
            </Link>
            <Link href={`/newspaper/${editionId}?page=1`} className="rounded-xl bg-blue-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-900">
              {isHindi ? "मुफ्त पृष्ठ 1 पर जाएं" : "Back to Free Page 1"}
            </Link>
          </div>

          {!isSignedIn && (
            <Link href={`/login?returnTo=${encodeURIComponent(`/newspaper/${editionId}?page=${pageNumber}`)}`} className="mt-4 inline-block text-sm font-bold text-blue-800 underline underline-offset-4">
              {isHindi ? "पहले से सदस्य हैं? लॉगिन करें" : "Already subscribed? Log in"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
