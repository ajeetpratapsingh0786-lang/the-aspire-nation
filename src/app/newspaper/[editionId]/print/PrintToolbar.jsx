"use client";

import Link from "next/link";

export default function PrintToolbar({ editionId }) {
  return (
    <div className="edition-export-toolbar sticky top-0 z-50 border-b border-slate-200 bg-slate-950 px-4 py-3 text-white shadow-xl print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">Release 1.0 Export Centre</p>
          <h1 className="text-lg font-black">Full 8-page edition preview</h1>
          <p className="text-xs text-slate-400">Use the browser print window and choose “Save as PDF”.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/newspaper/${editionId}?page=1`} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-black hover:bg-white/20">
            Back to reader
          </Link>
          <button type="button" onClick={() => window.print()} className="rounded-lg bg-red-700 px-4 py-2 text-xs font-black hover:bg-red-800">
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
