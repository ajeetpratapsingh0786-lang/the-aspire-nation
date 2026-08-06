import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-red-700">The Aspire Nation</p>
        <h1 className="mt-4 text-4xl font-black text-slate-950">Page not found</h1>
        <p className="mt-4 text-slate-600">The page may have moved, or the edition is no longer available at this address.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Go to homepage</Link>
          <Link href="/newspaper" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800">Open newspaper archive</Link>
        </div>
      </section>
    </main>
  );
}
