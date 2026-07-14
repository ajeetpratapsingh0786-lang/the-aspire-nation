import { FaNewspaper } from "react-icons/fa";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <div className="text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-700/30" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-700 text-2xl shadow-xl">
            <FaNewspaper />
          </div>
        </div>

        <h1 className="mt-7 text-2xl font-black">
          The Aspire Nation
        </h1>

        <p className="mt-2 font-semibold text-gray-400">
          Loading exam-focused content...
        </p>

        <div className="mx-auto mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-gray-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600" />
        </div>
      </div>
    </main>
  );
}