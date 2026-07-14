import Link from "next/link";
import { FaArrowLeft, FaNewspaper } from "react-icons/fa";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-red-50 to-gray-100 px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-700 text-3xl text-white shadow-xl">
          <FaNewspaper />
        </div>

        <p className="mt-8 text-7xl font-black text-red-700 sm:text-9xl">
          404
        </p>

        <h1 className="mt-4 text-3xl font-black text-gray-950 sm:text-5xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-gray-600">
          The page you are looking for may have been moved, removed or is
          temporarily unavailable.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-700 px-7 py-3.5 font-black text-white transition hover:bg-red-800"
        >
          <FaArrowLeft />
          Return to Homepage
        </Link>

        <p className="mt-8 text-sm font-semibold text-gray-500">
          Every Aspirant&apos;s Morning Starts Here.
        </p>
      </div>
    </main>
  );
}