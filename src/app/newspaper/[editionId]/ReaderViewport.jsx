"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_WIDTH = 1024;
const PAGE_HEIGHT = 1536;

export default function ReaderViewport({ children }) {
  const hostRef = useRef(null);
  const [mode, setMode] = useState("fit");
  const [manualScale, setManualScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    function measure() {
      const host = hostRef.current;
      if (!host) return;
      const available = Math.max(320, host.clientWidth - 24);
      // Fill the reader width on ordinary desktop screens while avoiding
      // accidental enlargement beyond a comfortable newspaper-reading size.
      setFitScale(Math.min(1.18, Math.max(0.58, available / PAGE_WIDTH)));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const scale = mode === "fit" ? fitScale : manualScale;
  const scaledHeight = useMemo(() => Math.ceil(PAGE_HEIGHT * scale), [scale]);

  function changeZoom(delta) {
    setMode("manual");
    setManualScale((current) => Math.min(1.45, Math.max(0.6, Number((current + delta).toFixed(2)))));
  }

  function printPage() {
    window.print();
  }

  async function toggleFullscreen() {
    const host = hostRef.current;
    if (!host) return;
    if (!document.fullscreenElement) await host.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }

  return (
    <div ref={hostRef} className="reader-shell-chrome rounded-xl bg-slate-600 p-3 shadow-2xl md:p-5">
      <div className="reader-toolbar sticky top-2 z-40 mb-3 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-slate-950/95 p-2 text-white shadow-lg backdrop-blur">
        <button type="button" onClick={() => changeZoom(-0.1)} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-black hover:bg-white/20">−</button>
        <button type="button" onClick={() => { setMode("manual"); setManualScale(1); }} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-black hover:bg-white/20">100%</button>
        <button type="button" onClick={() => setMode("fit")} className={`rounded-lg px-3 py-1.5 text-xs font-black ${mode === "fit" ? "bg-red-700" : "bg-white/10 hover:bg-white/20"}`}>Fit width</button>
        <button type="button" onClick={() => changeZoom(0.1)} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-black hover:bg-white/20">+</button>
        <button type="button" onClick={toggleFullscreen} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-black hover:bg-white/20">Full screen</button>
        <button type="button" onClick={printPage} className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-black hover:bg-red-800">Print page</button>
        <span className="ml-1 text-[11px] font-bold text-slate-300">{Math.round(scale * 100)}%</span>
      </div>

      <div className="mx-auto overflow-x-auto" style={{ height: scaledHeight }}>
        <div
          className="mx-auto origin-top"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
