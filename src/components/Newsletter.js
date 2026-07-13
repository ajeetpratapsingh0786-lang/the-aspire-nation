export default function Newsletter() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="bg-red-800 text-white rounded-3xl p-10 text-center">
        <h2 className="text-4xl font-black">Join The Aspire Nation</h2>

        <p className="mt-4 text-red-100">
          Get daily updates, e-paper notifications and exam alerts.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-5 py-3 rounded-md text-black outline-none"
          />

          <button className="bg-black px-7 py-3 rounded-md font-bold">
            Subscribe Now
          </button>
        </div>
      </div>
    </section>
  );
}