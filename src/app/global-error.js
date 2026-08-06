"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en-IN">
      <body className="bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-6">
          <section className="max-w-xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-700">The Aspire Nation</p>
            <h1 className="mt-4 text-3xl font-black text-slate-950">Something went wrong</h1>
            <p className="mt-4 text-slate-600">Your data has not been changed. Retry the page, and use the Editorial Control Room if the problem continues.</p>
            <button onClick={() => reset()} className="mt-7 rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
