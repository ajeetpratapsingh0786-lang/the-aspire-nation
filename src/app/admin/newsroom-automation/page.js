import Link from "next/link";
import { loadCanonicalNewsroomRuns } from "@/lib/newsroom/newsroomState";
import ProductionController from "./ProductionController";

export const dynamic = "force-dynamic";

function badgeClass(status) {
  if (status === "published") return "bg-green-100 text-green-800";
  if (["failed", "needs_review", "needs_attention"].includes(status)) {
    return "bg-red-100 text-red-800";
  }
  if (status === "paused") return "bg-blue-100 text-blue-800";
  return "bg-amber-100 text-amber-800";
}

export default async function NewsroomAutomationPage() {
  let runs = [];
  let errorMessage = "";

  try {
    runs = await loadCanonicalNewsroomRuns(14);
  } catch (error) {
    errorMessage = error?.message || "Could not load newsroom runs.";
  }

  const latestRun = runs[0] || null;

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Editorial Production</p>
          <h1 className="mt-2 text-3xl font-black">AI Newsroom</h1>
          <p className="mt-2 text-sm text-slate-300">Generate, resume, validate and publish the complete bilingual daily edition.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/admin/newsroom-editions" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold">Editions</Link>
            <Link href="/newspaper" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold">Public Archive</Link>
          </div>
        </div>

        {errorMessage ? <div className="mt-5 rounded-xl bg-red-50 p-5 text-red-800">{errorMessage}</div> : null}

        <ProductionController latestRun={latestRun} />

        <div className="mt-6 space-y-4">
          {runs.map((run) => {
            const displayStatus = run.display_status || run.status;
            const completed = displayStatus === "published";
            const showErrors = ["failed", "needs_review", "needs_attention"].includes(displayStatus);

            return (
              <article key={run.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Edition {run.publication_date}</h2>
                    <p className="text-sm text-slate-500">News date: {run.news_date}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${badgeClass(displayStatus)}`}>
                    {displayStatus === "paused" ? "Paused — ready to resume" : displayStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-3"><b>Stage</b><br />{run.display_stage || run.stage}</div>
                  <div className="rounded-lg bg-slate-50 p-3"><b>Language</b><br />{run.current_language || "—"}</div>
                  <div className="rounded-lg bg-slate-50 p-3"><b>Page</b><br />{run.current_page || "—"}</div>
                  <div className="rounded-lg bg-slate-50 p-3"><b>Images processed</b><br />{run.image_index || 0}</div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className={`rounded-lg p-3 ${run.english_published ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"}`}>
                    <b>English</b><br />{run.english_edition ? (run.english_published ? "Published" : run.english_edition.status) : "Not created"}
                  </div>
                  <div className={`rounded-lg p-3 ${run.hindi_published ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"}`}>
                    <b>Hindi</b><br />{run.hindi_edition ? (run.hindi_published ? "Published" : run.hindi_edition.status) : "Not created"}
                  </div>
                </div>

                {run.stats && Object.keys(run.stats).length ? (
                  <pre className="mt-4 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-200">{JSON.stringify(run.stats, null, 2)}</pre>
                ) : null}

                {showErrors && Array.isArray(run.errors) && run.errors.length ? (
                  <pre className="mt-3 overflow-auto rounded-lg bg-red-950 p-3 text-xs text-red-100">{JSON.stringify(run.errors.slice(-3), null, 2)}</pre>
                ) : null}

                {!showErrors && Array.isArray(run.errors) && run.errors.length ? (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                    Earlier errors are archived because this run is resumable or completed.
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {run.english_edition_id ? <Link href={`/admin/newsroom-editions/${run.english_edition_id}`} className="rounded-lg bg-blue-950 px-3 py-2 text-xs font-bold text-white">English Review</Link> : null}
                  {run.hindi_edition_id ? <Link href={`/admin/newsroom-editions/${run.hindi_edition_id}`} className="rounded-lg bg-red-800 px-3 py-2 text-xs font-bold text-white">Hindi Review</Link> : null}
                  {completed ? <Link href="/newspaper" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">View Live Edition</Link> : null}
                </div>
              </article>
            );
          })}

          {!runs.length ? <div className="rounded-2xl bg-white p-8 text-center text-slate-500">No automation runs yet.</div> : null}
        </div>
      </div>
    </main>
  );
}
