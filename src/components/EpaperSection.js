export default function EpaperSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-8">
      <div className="bg-black text-white rounded-3xl p-10">
        <p className="text-red-400 font-black uppercase">Premium E-Paper</p>

        <h2 className="text-4xl font-black mt-3">
          Read full 8-page newspaper with subscription
        </h2>

        <p className="text-gray-300 mt-4">
          Free readers can preview Page 1 only. Subscribe to unlock the full
          daily e-paper, downloads, and previous editions.
        </p>

        <div className="flex flex-wrap gap-4 mt-7">
          <a
            href="/epaper"
            className="bg-red-800 px-5 py-3 rounded-md font-bold"
          >
            Preview Page 1
          </a>

          <a
            href="/premium"
            className="bg-white text-black px-5 py-3 rounded-md font-bold"
          >
            Subscribe to Download
          </a>
        </div>
      </div>

      <div className="border bg-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <h3 className="text-2xl font-black">Today&apos;s E-Paper Preview</h3>

        <p className="text-gray-600 mt-3">
          Only Page 1 preview is available for free readers.
        </p>

        <div className="mt-6 h-72 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500 font-bold border">
          <p className="text-5xl mb-3">📰</p>
          <p>Page 1 Preview</p>
          <p className="text-sm mt-2 text-gray-400">
            Pages 2–8 locked for subscribers
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-white p-4 text-center font-bold">
          🔒 Full PDF download requires subscription
        </div>
      </div>
    </section>
  );
}