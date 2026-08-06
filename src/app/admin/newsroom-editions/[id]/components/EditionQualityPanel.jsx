export default function EditionQualityPanel({ report }) {
  const statusClass = report.ready ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30" : "bg-red-500/15 text-red-200 ring-red-400/30";

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Launch quality gate</p>
          <h2 className="mt-1 text-lg font-black">Edition readiness</h2>
        </div>
        <div className={`rounded-full px-4 py-2 text-sm font-black ring-1 ${statusClass}`}>
          {report.ready ? "READY FOR REVIEW" : "FIX REQUIRED"} · {report.score}/100
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {Object.entries(report.pageCounts).map(([page, count]) => (
          <div key={page} className="rounded-xl bg-black/20 p-3 text-center">
            <div className="text-xs font-bold text-slate-400">Page {page}</div>
            <div className="mt-1 text-xl font-black">{count}</div>
            <div className="text-[11px] text-slate-400">stories</div>
          </div>
        ))}
      </div>

      {report.critical.length ? (
        <div className="mt-4 rounded-xl bg-red-500/10 p-4 ring-1 ring-red-400/20">
          <p className="text-sm font-black text-red-200">Critical problems</p>
          <ul className="mt-2 space-y-1 text-xs text-red-100">
            {report.critical.slice(0, 8).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      ) : null}

      {report.warnings.length ? (
        <details className="mt-4 rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-400/20">
          <summary className="cursor-pointer text-sm font-black text-amber-100">Warnings ({report.warnings.length})</summary>
          <ul className="mt-2 space-y-1 text-xs text-amber-50">
            {report.warnings.slice(0, 20).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
