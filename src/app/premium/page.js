export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="max-w-xl bg-white rounded-2xl shadow-xl p-10 text-center">
        <div className="text-6xl mb-6">🔒</div>

        <h1 className="text-4xl font-black text-red-800">
          Premium Content
        </h1>

        <p className="text-gray-600 mt-4 text-lg">
          This section is available only for The Aspire Nation premium members.
        </p>

        <p className="text-gray-500 mt-3">
          Subscribe now to access Daily E-Paper, Current Affairs, Editorials,
          PDFs and complete archive.
        </p>

        <a
          href="/subscribe"
          className="inline-block mt-8 bg-red-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-800 transition"
        >
          Subscribe Now
        </a>

        <div className="mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-red-700">
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}