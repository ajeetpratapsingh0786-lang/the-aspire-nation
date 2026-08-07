"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function progressFor(run) {
  if (!run) return 0;
  if (run.display_status === "published" || run.status === "published" || run.stage === "completed") return 100;
  if (run.stage === "collect") return 8;
  if (run.stage === "write") {
    const page = Math.max(1, Number(run.current_page || 1));
    if ((run.current_language || "ENGLISH") === "ENGLISH") {
      return Math.min(48, 10 + (page - 1) * 5);
    }
    return Math.min(82, 50 + (page - 1) * 4);
  }
  if (run.stage === "images") {
    return Math.min(92, 84 + Math.floor(Number(run.image_index || 0) / 2));
  }
  if (run.stage === "validate" || run.stage === "needs_review") return 96;
  if (run.stage === "publish") return 99;
  return 5;
}

export default function ProductionController({ latestRun }) {
  const router = useRouter();
  const stopRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [run, setRun] = useState(latestRun || null);
  const [controlBusy, setControlBusy] = useState("");

  useEffect(() => {
    setRun(latestRun || null);
  }, [latestRun]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/newsroom/status", { cache: "no-store" });
        const payload = await response.json();
        if (response.ok && payload.ok) setRun(payload.run);
      } catch {
        // The production request remains the source of truth. Polling failure is non-fatal.
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const progress = useMemo(() => progressFor(run), [run]);
  const effectiveStatus = run?.display_status || run?.status;
  const alreadyComplete = effectiveStatus === "published" || run?.stage === "completed";
  const needsReview = effectiveStatus === "needs_review";
  const failed = effectiveStatus === "failed";
  const paused = effectiveStatus === "paused" || effectiveStatus === "needs_attention";

  async function startDailyRun(force = false) {
    const response = await fetch("/api/admin/newsroom/start-production", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ force }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not start production.");
    return payload.run;
  }

  async function retryFailedRun() {
    if (!run?.id) throw new Error("No failed run is available.");
    const response = await fetch("/api/admin/newsroom/retry-run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ runId: run.id }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not retry the failed run.");
    setRun(payload.run);
  }

  async function callNextBatch() {
    const response = await fetch("/api/admin/newsroom/continue-production", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Production request failed.");
    }

    setHistory((current) => [...payload.results, ...current].slice(0, 18));
    return payload;
  }

  async function controlProduction(action, confirmation) {
    if (controlBusy || running) return;
    if (confirmation && !window.confirm(confirmation)) return;

    setControlBusy(action);
    setMessage("Updating newsroom production…");
    try {
      const response = await fetch("/api/admin/newsroom/control-production", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Production control failed.");
      setRun(payload.run || null);
      setMessage(payload.message || "Production updated.");
      router.refresh();
    } catch (error) {
      setMessage(error?.message || "Could not update production.");
    } finally {
      setControlBusy("");
    }
  }

  async function startContinuousProduction() {
    if (running) return;
    stopRef.current = false;
    setRunning(true);
    setHistory([]);

    try {
      let activeRun = run;
      if (!activeRun || alreadyComplete) {
        setMessage("Creating today's newsroom run…");
        activeRun = await startDailyRun(false);
        setRun(activeRun);
      } else if (failed) {
        setMessage("Re-queuing the failed run safely…");
        await retryFailedRun();
      }

      setMessage("Production started. You may keep this page open while the full bilingual edition is completed.");

      for (let cycle = 1; cycle <= 40 && !stopRef.current; cycle += 1) {
        setMessage(`Processing production batch ${cycle}…`);
        const payload = await callNextBatch();
        router.refresh();

        const last = payload.results?.at(-1);
        if (payload.finished || last?.published || last?.waitingForApproval || last?.valid === false || last?.idle) {
          setMessage(
            last?.published
              ? "English and Hindi editions completed and published."
              : last?.waitingForApproval
                ? "Production completed and is waiting for your approval."
                : last?.valid === false
                  ? "Production completed but validation requires your review."
                  : "No pending production work remains."
          );
          break;
        }

        await wait(1200);
      }
    } catch (error) {
      setMessage(error?.message || "Production stopped because of an error.");
    } finally {
      setRunning(false);
      router.refresh();
    }
  }

  function stopProduction() {
    stopRef.current = true;
    setMessage("Stopping after the current safe batch finishes…");
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Launch control</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Generate the complete bilingual edition</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            One button starts or resumes collection, English, Hindi, visuals, validation and publication approval.
          </p>
        </div>
        <div className="flex max-w-3xl flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={startContinuousProduction}
            disabled={running || needsReview || Boolean(controlBusy)}
            className="rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {running
              ? "Production Running…"
              : failed
                ? "Retry and Resume"
                : alreadyComplete
                  ? "Start Today's Edition"
                  : needsReview
                    ? "Review Required"
                    : paused
                      ? "Resume Full Production"
                      : run
                        ? "Continue Full Production"
                        : "Generate Today's Edition"}
          </button>

          <button
            type="button"
            onClick={() => controlProduction("restart_fresh", "Restart today's edition from the beginning? Existing generated stories for this unfinished edition will be cleared.")}
            disabled={running || Boolean(controlBusy) || alreadyComplete}
            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {controlBusy === "restart_fresh" ? "Restarting…" : "Restart Fresh"}
          </button>

          <button
            type="button"
            onClick={() => controlProduction("cancel", "Cancel the current production? It will not resume automatically unless you restart it.")}
            disabled={running || Boolean(controlBusy) || !run || alreadyComplete}
            className="rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-black text-red-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {controlBusy === "cancel" ? "Cancelling…" : "Cancel Edition"}
          </button>

          <button
            type="button"
            onClick={() => controlProduction("archive", "Archive this unfinished edition without publishing it?")}
            disabled={running || Boolean(controlBusy) || !run || alreadyComplete}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {controlBusy === "archive" ? "Archiving…" : "Archive"}
          </button>

          <button
            type="button"
            onClick={() => controlProduction("new_edition")}
            disabled={running || Boolean(controlBusy) || (run && !["cancelled", "archived"].includes(effectiveStatus))}
            className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {controlBusy === "new_edition" ? "Creating…" : "New Edition"}
          </button>

          <button
            type="button"
            onClick={() => controlProduction("force_new_morning", "Force a completely fresh morning run? Existing unfinished content for today's edition will be cleared.")}
            disabled={running || Boolean(controlBusy) || alreadyComplete}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {controlBusy === "force_new_morning" ? "Resetting…" : "Force New Morning"}
          </button>

          {running ? (
            <button type="button" onClick={stopProduction} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
              Stop Safely
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>{run ? `${run.current_language || "—"} · ${run.display_stage || run.stage || "—"} · Page ${run.current_page || "—"}` : "No current run"}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-red-700 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {message ? <div className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-800">{message}</div> : null}

      {history.length ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {history.map((item, index) => (
            <div key={`${index}-${item?.stage || "step"}`} className="rounded-lg border border-slate-200 p-3 text-xs text-slate-700">
              <b>{item?.stage || "step"}</b>
              {item?.language ? ` · ${item.language}` : ""}
              {item?.page ? ` · Page ${item.page}` : ""}
              {item?.saved ? ` · ${item.saved} stories saved` : ""}
              {item?.generated ? ` · ${item.generated} images` : ""}
              {item?.assigned ? ` · ${item.assigned} units assigned` : ""}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
