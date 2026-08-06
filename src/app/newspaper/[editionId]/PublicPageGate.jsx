"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PublicPageGate({ pageNumber, editionId, language, children }) {
  const [state, setState] = useState(pageNumber === 1 ? "allowed" : "checking");

  useEffect(() => {
    if (pageNumber === 1) {
      setState("allowed");
      return;
    }

    let active = true;
    async function check() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        if (active) setState("locked");
        return;
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("status, expiry_date, created_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        if (active) setState("locked");
        return;
      }

      const now = Date.now();
      const premium = (data || []).some((row) => {
        if (!row.expiry_date) return true;
        const expiry = new Date(row.expiry_date).getTime();
        return Number.isFinite(expiry) && expiry >= now;
      });
      if (active) setState(premium ? "allowed" : "locked");
    }

    check();
    return () => { active = false; };
  }, [pageNumber]);

  if (state === "checking") {
    return (
      <div className="mx-auto flex min-h-[720px] max-w-[1180px] items-center justify-center rounded-2xl bg-slate-600 text-xl font-black text-white">
        Checking Premium access…
      </div>
    );
  }

  if (state === "locked") {
    const isHindi = String(language || "").toUpperCase() === "HINDI";
    return (
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-2xl bg-slate-700 p-3 shadow-2xl md:p-5">
        <div aria-hidden="true" className="pointer-events-none select-none opacity-55 blur-[7px] saturate-50">
          {children}
        </div>
        <div className="absolute inset-0 z-20 flex items-start justify-center bg-slate-950/38 px-4 pt-24 backdrop-blur-[2px] md:pt-36">
          <div className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white/95 p-8 text-center shadow-2xl backdrop-blur md:p-10">
            <div className="text-5xl">🔒</div>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-red-700">The Aspire Nation Premium</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              {isHindi ? `पेज ${pageNumber} पढ़ने के लिए प्रीमियम लें` : `Unlock Page ${pageNumber} with Premium`}
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              {isHindi
                ? "पेज 1 और उसके पूरे लेख सभी के लिए मुफ्त हैं। पेज 2–8, उनके पूरे लेख, सेव किए गए लेख और विषयवार नोट्स प्रीमियम सदस्यों के लिए उपलब्ध हैं।"
                : "Page 1 and all Page 1 articles are free. Premium unlocks Pages 2–8, every full article, saved stories and subject-wise notes."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/subscribe" className="rounded-xl bg-red-700 px-7 py-3 font-black text-white shadow-lg hover:bg-red-800">
                {isHindi ? "प्रीमियम सदस्यता लें" : "Buy Premium Subscription"}
              </Link>
              <Link href={`/newspaper/${editionId}?page=1`} className="rounded-xl bg-blue-950 px-7 py-3 font-black text-white hover:bg-blue-900">
                {isHindi ? "पेज 1 पर वापस जाएँ" : "Back to Free Page 1"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
