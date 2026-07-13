export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">The Aspire Nation</h3>
          <p className="text-gray-400 mt-2">
            Every Aspirant&apos;s Morning Starts Here.
          </p>
        </div>

        <p className="text-gray-400">© 2026 The Aspire Nation</p>
      </div>
    </footer>
  );
}