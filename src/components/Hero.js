import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[2fr_1fr] gap-8">
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
        <Image
          src="/images/hero/hero.png"
          alt="The Aspire Nation Hero"
          width={1200}
          height={700}
          priority
          className="w-full h-auto object-cover"
        />

        <div className="p-8">
          <p className="text-red-800 font-black uppercase mb-3">
            Daily E-Paper
          </p>

          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            India&apos;s daily command center for competitive exam aspirants.
          </h2>

          <p className="text-gray-600 mt-5 text-lg">
            Current affairs, job alerts, results, admit cards, editorials, GK,
            and daily quiz — all in one focused platform.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="/epaper"
              className="bg-black text-white px-6 py-3 rounded-md font-bold"
            >
              Read Today&apos;s Edition
            </a>

            <a
              href="/current-affairs"
              className="border border-black px-6 py-3 rounded-md font-bold"
            >
              View Latest News
            </a>
          </div>
        </div>
      </div>

      <aside className="bg-[#111827] text-white rounded-3xl p-7 shadow-lg">
        <div className="flex items-center gap-3">
          <FaGraduationCap className="text-yellow-400 text-4xl" />
          <h3 className="text-3xl font-black">Today&apos;s Focus</h3>
        </div>

        <div className="mt-8 space-y-6">
          {[
            ["Morning Brief", "15-minute current affairs revision"],
            ["Exam Alert", "Track latest vacancies and admit cards"],
            ["Practice", "Attempt today&apos;s quiz before study"],
            ["E-Paper", "Read the 8-page aspirant newspaper"],
          ].map(([label, text]) => (
            <div key={label} className="border-b border-white/10 pb-5">
              <p className="text-sm uppercase text-gray-400 font-bold">
                {label}
              </p>
              <h4 className="mt-1 text-xl font-bold">{text}</h4>
            </div>
          ))}
        </div>

        <a
          href="/epaper"
          className="mt-8 block text-center bg-yellow-400 text-black rounded-xl px-5 py-4 font-black"
        >
          Open E-Paper
        </a>
      </aside>
    </section>
  );
}