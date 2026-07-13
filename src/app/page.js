import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

import {
  FaArrowRight,
  FaBell,
  FaBookOpen,
  FaBriefcase,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaExternalLinkAlt,
  FaFileAlt,
  FaGlobeAsia,
  FaGraduationCap,
  FaNewspaper,
  FaPenNib,
  FaQuestionCircle,
  FaSearch,
  FaStopwatch,
  FaTrophy,
  FaUserCircle,
} from "react-icons/fa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export const dynamic = "force-dynamic";

async function getHomepageData() {
  const [
    newspaperResponse,
    currentAffairsResponse,
    jobsResponse,
    resultsResponse,
  ] = await Promise.all([
    supabase
      .from("newspapers")
      .select(
        "id, title, edition_date, preview_url, is_published"
      )
      .eq("is_published", true)
      .order("edition_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("current_affairs")
      .select(
        `
          id,
          title,
          slug,
          summary,
          category,
          image_url,
          is_featured,
          published_at
        `
      )
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(4),

    supabase
      .from("jobs")
      .select(
        `
          id,
          title,
          description,
          category,
          official_link,
          published_at
        `
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(4),

    supabase
      .from("results")
      .select(
        `
          id,
          title,
          description,
          category,
          official_link,
          published_at
        `
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  return {
    latestNewspaper: newspaperResponse.data || null,
    currentAffairs: currentAffairsResponse.data || [],
    jobs: jobsResponse.data || [],
    results: resultsResponse.data || [],
  };
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function Home() {
  const {
    latestNewspaper,
    currentAffairs,
    jobs,
    results,
  } = await getHomepageData();

  const featuredArticle =
    currentAffairs.find((article) => article.is_featured) ||
    currentAffairs[0] ||
    null;

  const latestArticles = currentAffairs.filter(
    (article) => article.id !== featuredArticle?.id
  );

  const breakingHeadline =
    featuredArticle?.title ||
    jobs[0]?.title ||
    results[0]?.title ||
    "Daily exam-focused current affairs and updates for serious aspirants.";

  const includedFeatures = [
    {
      title: "Daily Current Affairs",
      description:
        "Important national and international updates explained simply.",
      icon: FaBookOpen,
    },
    {
      title: "Editorial Analysis",
      description:
        "Exam-focused analysis for mains, essays and interviews.",
      icon: FaPenNib,
    },
    {
      title: "Government Jobs",
      description:
        "Latest official recruitment and examination notifications.",
      icon: FaBriefcase,
    },
    {
      title: "Daily E-Paper",
      description:
        "An organised edition designed to be completed quickly.",
      icon: FaNewspaper,
    },
    {
      title: "Daily Quiz",
      description:
        "Revise important topics through exam-oriented questions.",
      icon: FaQuestionCircle,
    },
    {
      title: "Results and Alerts",
      description:
        "Quick access to important exam results and official links.",
      icon: FaBell,
    },
  ];

  const timeComparison = [
    {
      traditional: "Read multiple newspapers",
      aspire: "One focused e-paper",
    },
    {
      traditional: "Visit many websites",
      aspire: "One organised platform",
    },
    {
      traditional: "2–3 hours of searching",
      aspire: "About 20 minutes of reading",
    },
    {
      traditional: "Information overload",
      aspire: "Only exam-relevant updates",
    },
    {
      traditional: "Miss important notifications",
      aspire: "Jobs and results in one place",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-950">
      {/* Breaking News */}

      <div className="bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white">
        <span className="font-black">Breaking:</span>{" "}
        {breakingHeadline}
      </div>

      <Header />

      {/* Main Hero */}

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50 to-gray-100">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gray-300/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700 shadow-sm">
              <FaStopwatch />
              Save 2–3 Hours Every Day
            </div>

            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your Most Valuable Resource Isn&apos;t Notes.
              <span className="block text-red-700">It&apos;s Time.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Stop spending hours reading multiple newspapers, websites,
              Telegram channels and random updates. The Aspire Nation gives
              you one organised, exam-focused source every morning.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Read in about 20 minutes",
                "Only exam-relevant information",
                "Jobs, results and current affairs together",
                "Built for UPSC, SSC, Banking and Railway aspirants",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 shadow-sm"
                >
                  <FaCheckCircle className="mt-1 shrink-0 text-red-700" />
                  <p className="font-semibold text-gray-800">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/epaper"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 font-black text-white transition hover:bg-black"
              >
                Read Today&apos;s Edition
                <FaArrowRight />
              </Link>

              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 font-black text-white transition hover:bg-red-800"
              >
                <FaCrown />
                Become Premium
              </Link>

              <Link
                href="/current-affairs"
                className="rounded-xl border-2 border-gray-900 px-6 py-3.5 font-black text-gray-900 transition hover:bg-gray-100"
              >
                Latest Headlines
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Average Reading Time
              </p>

              <div className="mt-2 flex items-center gap-2">
                <FaClock className="text-red-700" />
                <p className="text-2xl font-black">20 Minutes</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-2xl">
              <Image
                src="/images/hero/hero.png"
                alt="The Aspire Nation digital newspaper"
                width={900}
                height={600}
                priority
                className="h-auto w-full rounded-2xl object-contain"
              />
            </div>

            <div className="absolute -bottom-6 -right-3 rounded-2xl bg-gray-950 px-5 py-4 text-white shadow-xl sm:right-6">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                One Platform
              </p>

              <p className="mt-1 text-lg font-black">
                Complete Daily Preparation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Time-Saving Newspaper Section */}

      <section className="bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="font-black uppercase tracking-[0.22em] text-red-400">
                Today&apos;s Time-Saving Edition
              </p>

              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                One Newspaper.
                <span className="block text-red-500">
                  Everything That Matters.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                The Aspire Nation is designed to reduce searching, scrolling
                and information overload. Read the most important exam-focused
                updates in one structured daily edition.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    value: "20 Min",
                    label: "Focused Reading",
                  },
                  {
                    value: "8 Pages",
                    label: "Organised Edition",
                  },
                  {
                    value: "1 Platform",
                    label: "All Major Updates",
                  },
                  {
                    value: "100%",
                    label: "Exam Focused",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-3xl font-black text-red-400">
                      {item.value}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-300">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {latestNewspaper ? (
                <div className="mt-8">
                  <h3 className="text-2xl font-black">
                    {latestNewspaper.title}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt />
                    {formatDate(latestNewspaper.edition_date)}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/epaper/${latestNewspaper.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white transition hover:bg-red-700"
                    >
                      Open Today&apos;s Edition
                      <FaArrowRight />
                    </Link>

                    <Link
                      href="/subscribe"
                      className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white/20"
                    >
                      Unlock Full Access
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-gray-300">
                  The latest edition will appear here after publication.
                </p>
              )}
            </div>

            <div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
                {latestNewspaper?.preview_url ? (
                  <img
                    src={latestNewspaper.preview_url}
                    alt={latestNewspaper.title}
                    className="mx-auto max-h-[620px] w-full rounded-2xl object-contain"
                  />
                ) : (
                  <div className="flex min-h-[460px] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-red-950">
                    <FaNewspaper
                      size={90}
                      className="text-white/50"
                    />
                  </div>
                )}

                <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-gray-950/85 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                        Time-Smart Preparation
                      </p>

                      <p className="mt-1 font-black">
                        Read what matters. Skip what doesn&apos;t.
                      </p>
                    </div>

                    <FaStopwatch className="text-3xl text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Comparison */}

      <section className="bg-red-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-black uppercase tracking-[0.2em] text-red-700">
              Preparation Comparison
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Spend More Time Preparing,
              <span className="block text-red-700">
                Less Time Searching.
              </span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              A focused source helps you reduce duplication, confusion and
              unnecessary reading.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-xl">
            <div className="grid grid-cols-2 bg-gray-950 text-white">
              <div className="border-r border-white/10 p-5 sm:p-6">
                <p className="text-lg font-black">
                  Traditional Preparation
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-lg font-black text-red-400">
                  The Aspire Nation
                </p>
              </div>
            </div>

            {timeComparison.map((item, index) => (
              <div
                key={item.traditional}
                className={`grid grid-cols-2 ${
                  index !== timeComparison.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <div className="border-r border-gray-200 p-5 text-sm font-semibold text-gray-500 sm:p-6 sm:text-base">
                  {item.traditional}
                </div>

                <div className="flex items-center gap-3 p-5 text-sm font-black text-gray-900 sm:p-6 sm:text-base">
                  <FaCheck className="shrink-0 text-red-700" />
                  {item.aspire}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-red-700 px-6 py-8 text-center text-white shadow-xl sm:px-10">
            <FaClock className="mx-auto text-4xl" />

            <h3 className="mt-4 text-3xl font-black">
              Save Hundreds of Hours Every Year
            </h3>

            <p className="mx-auto mt-3 max-w-2xl leading-7 text-red-100">
              Use that saved time for revision, mock tests, answer writing and
              deeper preparation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Current Affair */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-black uppercase tracking-widest text-red-700">
              Exam-Focused News
            </p>

            <h2 className="mt-2 text-4xl font-black">
              Featured Current Affair
            </h2>
          </div>

          <Link
            href="/current-affairs"
            className="inline-flex items-center gap-2 font-black text-red-700 hover:text-red-800"
          >
            View All Current Affairs
            <FaArrowRight />
          </Link>
        </div>

        {featuredArticle ? (
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
            <div className="grid lg:grid-cols-2">
              <div className="min-h-[340px] bg-gray-200">
                {featuredArticle.image_url ? (
                  <img
                    src={featuredArticle.image_url}
                    alt={featuredArticle.title}
                    className="h-full min-h-[340px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[340px] items-center justify-center bg-gradient-to-br from-gray-900 to-red-900">
                    <FaGlobeAsia
                      size={80}
                      className="text-white/70"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700">
                    {featuredArticle.category}
                  </span>

                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendarAlt />
                    {formatDate(featuredArticle.published_at)}
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-black leading-tight">
                  {featuredArticle.title}
                </h3>

                <p className="mt-5 text-lg leading-8 text-gray-600">
                  {featuredArticle.summary}
                </p>

                <Link
                  href={`/current-affairs/${featuredArticle.slug}`}
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-black text-white transition hover:bg-red-800"
                >
                  Read Full Article
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <FaNewspaper
              size={46}
              className="mx-auto text-gray-400"
            />

            <p className="mt-4 text-gray-500">
              Published current affairs will appear here.
            </p>
          </div>
        )}

        {latestArticles.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/current-affairs/${article.slug}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                  {article.category}
                </span>

                <h3 className="mt-4 text-xl font-black leading-snug">
                  {article.title}
                </h3>

                <p className="mt-3 line-clamp-3 leading-7 text-gray-600">
                  {article.summary}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 font-black text-red-700">
                  Read More
                  <FaArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Jobs and Results */}

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black uppercase tracking-widest text-red-700">
                  Latest Openings
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Government Jobs
                </h2>
              </div>

              <div className="rounded-2xl bg-red-100 p-4">
                <FaBriefcase
                  size={30}
                  className="text-red-700"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <a
                    key={job.id}
                    href={job.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-gray-200 p-5 transition hover:border-red-200 hover:bg-red-50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                        {job.category}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatDate(job.published_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 font-black">
                      {job.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {job.description}
                    </p>

                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-red-700">
                      Official Notification
                      <FaExternalLinkAlt size={11} />
                    </span>
                  </a>
                ))
              ) : (
                <p className="rounded-xl bg-gray-50 p-6 text-gray-500">
                  No job notifications published yet.
                </p>
              )}
            </div>

            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 font-black text-red-700"
            >
              View All Jobs
              <FaArrowRight />
            </Link>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black uppercase tracking-widest text-red-700">
                  Latest Declarations
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Exam Results
                </h2>
              </div>

              <div className="rounded-2xl bg-red-100 p-4">
                <FaTrophy
                  size={30}
                  className="text-red-700"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {results.length > 0 ? (
                results.map((result) => (
                  <a
                    key={result.id}
                    href={result.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-gray-200 p-5 transition hover:border-red-200 hover:bg-red-50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                        {result.category}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatDate(result.published_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 font-black">
                      {result.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {result.description}
                    </p>

                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-red-700">
                      Check Result
                      <FaExternalLinkAlt size={11} />
                    </span>
                  </a>
                ))
              ) : (
                <p className="rounded-xl bg-gray-50 p-6 text-gray-500">
                  No result notifications published yet.
                </p>
              )}
            </div>

            <Link
              href="/results"
              className="mt-6 inline-flex items-center gap-2 font-black text-red-700"
            >
              View All Results
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* What We Give */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-black uppercase tracking-widest text-red-700">
            Everything in One Place
          </p>

          <h2 className="mt-3 text-4xl font-black sm:text-5xl">
            What We Give You
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            A focused daily preparation system built around the needs of
            competitive exam aspirants.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {includedFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 transition group-hover:bg-red-700">
                  <Icon className="text-2xl text-red-700 transition group-hover:text-white" />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Aspirants Choose Us */}

      <section className="border-y border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div>
            <p className="mb-4 font-black uppercase tracking-widest text-red-700">
              Editor&apos;s Note
            </p>

            <h2 className="text-5xl font-black leading-tight md:text-6xl">
              Why Aspirants Choose Us?
            </h2>

            <p className="mt-7 text-lg leading-8 text-gray-800">
              Aspirants already have enough to study. They should not have to
              spend valuable time searching for reliable current affairs,
              jobs, results and exam updates across many different sources.
            </p>

            <p className="mt-4 text-lg leading-8 text-gray-800">
              The Aspire Nation brings those important updates together in a
              simple, structured and exam-focused format.
            </p>

            <div className="mt-8 border-l-4 border-red-700 pl-5">
              <p className="text-2xl font-black">
                Your preparation deserves a platform built exclusively for
                aspirants.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-black text-gray-900 md:text-3xl">
              What makes it different?
            </h3>

            <div className="mt-7 space-y-4">
              {[
                "Only exam-relevant news and updates",
                "No entertainment or unnecessary content",
                "Saves hours of searching every day",
                "Simple language and organised presentation",
                "Government jobs and result notifications",
                "Editorial analysis for serious preparation",
                "Daily quiz and revision support",
                "Secure premium e-paper access",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 shrink-0 text-red-700" />

                  <p className="font-semibold text-gray-800">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/subscribe"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-700 px-7 py-3.5 font-black text-white transition hover:bg-red-800"
            >
              <FaCrown />
              Join Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Membership */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="font-black uppercase tracking-[0.2em] text-red-400">
                Aspire Nation Premium
              </p>

              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                One Subscription.
                <span className="block text-red-500">
                  Complete Preparation.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Unlock the full e-paper, complete current affairs articles,
                editorial analysis, archive access and premium preparation
                resources.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Complete daily e-paper",
                  "Full current affairs analysis",
                  "Editorial access",
                  "Archive access",
                  "Premium quiz",
                  "Secure reader",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-200"
                  >
                    <FaCheck className="text-red-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center bg-gradient-to-br from-red-700 to-red-950 p-8 sm:p-12">
              <div className="w-full max-w-md rounded-3xl bg-white p-8 text-gray-950 shadow-2xl">
                <FaCrown className="text-5xl text-red-700" />

                <p className="mt-6 text-sm font-black uppercase tracking-widest text-gray-500">
                  Monthly Membership
                </p>

                <h3 className="mt-2 text-5xl font-black">
                  ₹99
                  <span className="text-lg font-bold text-gray-500">
                    /month
                  </span>
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  Start focused preparation with complete premium access.
                </p>

                <Link
                  href="/subscribe"
                  className="mt-7 block rounded-xl bg-red-700 px-7 py-3.5 text-center font-black text-white transition hover:bg-red-800"
                >
                  Start Premium Membership
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}

      <section className="bg-red-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <FaGraduationCap className="mx-auto text-5xl" />

          <h2 className="mt-5 text-4xl font-black sm:text-5xl">
            Make Every Morning Count.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-red-100">
            Begin your day with focused news, organised current affairs and
            important exam updates—all in one place.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/epaper"
              className="rounded-xl bg-white px-7 py-3.5 font-black text-red-700 transition hover:bg-gray-100"
            >
              Read Latest Edition
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 font-black text-white transition hover:bg-white/20"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-2xl font-black">
                The Aspire Nation
              </h3>

              <p className="mt-3 max-w-sm leading-7 text-gray-400">
                A daily digital newspaper and preparation platform built for
                India&apos;s competitive exam aspirants.
              </p>
            </div>

            <div>
              <h4 className="font-black">Explore</h4>

              <div className="mt-4 grid gap-3 text-sm text-gray-400">
                <Link
                  href="/epaper"
                  className="hover:text-white"
                >
                  E-Paper
                </Link>

                <Link
                  href="/current-affairs"
                  className="hover:text-white"
                >
                  Current Affairs
                </Link>

                <Link
                  href="/jobs"
                  className="hover:text-white"
                >
                  Government Jobs
                </Link>

                <Link
                  href="/results"
                  className="hover:text-white"
                >
                  Results
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-black">Company</h4>

              <div className="mt-4 grid gap-3 text-sm text-gray-400">
                <Link
                  href="/about"
                  className="hover:text-white"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  href="/subscribe"
                  className="hover:text-white"
                >
                  Premium
                </Link>

                <Link
                  href="/login"
                  className="hover:text-white"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-gray-800 pt-6 text-sm text-gray-500 md:flex-row">
            <p>© 2026 The Aspire Nation. All rights reserved.</p>

            <p>Every Aspirant&apos;s Morning Starts Here.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}