import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaGlobeAsia,
  FaGraduationCap,
  FaNewspaper,
  FaStopwatch,
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
  const [newspaperResponse, currentAffairsResponse] = await Promise.all([
    supabase
      .from("newspapers")
      .select("id, title, edition_date, preview_url, is_published")
      .eq("is_published", true)
      .order("edition_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("current_affairs")
      .select(`
        id,
        title,
        slug,
        summary,
        category,
        image_url,
        is_featured,
        published_at
      `)
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  return {
    latestNewspaper: newspaperResponse.data || null,
    currentAffairs: currentAffairsResponse.data || [],
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
  const { latestNewspaper, currentAffairs } = await getHomepageData();

  const featuredArticle =
    currentAffairs.find((article) => article.is_featured) ||
    currentAffairs[0] ||
    null;

  const latestArticles = currentAffairs.filter(
    (article) => article.id !== featuredArticle?.id
  );

  const breakingHeadline =
    featuredArticle?.title ||
    "Daily exam-focused current affairs and preparation updates for serious aspirants.";

  const timeComparison = [
    {
      traditional: "Read multiple newspapers",
      aspire: "One focused e-paper",
    },
    {
      traditional: "Visit many different websites",
      aspire: "One organised platform",
    },
    {
      traditional: "Spend 2–3 hours searching",
      aspire: "Read in about 20 minutes",
    },
    {
      traditional: "Face information overload",
      aspire: "Only exam-relevant updates",
    },
    {
      traditional: "Save random posts and PDFs",
      aspire: "Use one structured archive",
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

      {/* Hero */}

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50 to-gray-100">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gray-300/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700 shadow-sm">
              <FaStopwatch />
              India&apos;s Daily Newspaper for Aspirants
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Every Aspirant&apos;s
              <span className="block text-red-700">
                Morning Starts Here.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Save valuable preparation time with a single, exam-focused
              platform. Read the daily e-paper, current affairs, editorial
              analysis and important updates every morning—carefully selected
              for UPSC, SSC, Banking, Railway, Defence and State exam aspirants.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Daily E-Paper",
                "Current Affairs",
                "Editorial Analysis",
                "Premium Preparation Resources",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 shadow-sm"
                >
                  <FaCheckCircle className="mt-1 shrink-0 text-red-700" />
                  <p className="font-semibold text-gray-800">{item}</p>
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
            <div className="absolute -left-6 -top-6 z-10 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
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

      {/* Today’s Edition */}

      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-900/30 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-red-700/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-red-300">
              <FaNewspaper />
              Today&apos;s Edition
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Your Daily Exam-Focused
              <span className="block text-red-500">
                Newspaper Is Ready.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              Read the most important current affairs, editorials and exam
              updates in one structured eight-page digital newspaper.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="absolute left-10 top-10 z-10 rounded-full bg-red-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                  First Page Free
                </div>

                <div className="rounded-3xl border border-white/10 bg-gray-900 p-4 shadow-2xl">
                  {latestNewspaper?.preview_url ? (
                    <img
                      src={latestNewspaper.preview_url}
                      alt={
                        latestNewspaper.title ||
                        "Today’s newspaper preview"
                      }
                      className="mx-auto max-h-[700px] w-full rounded-2xl object-contain"
                    />
                  ) : (
                    <div className="flex min-h-[560px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-red-950 text-center">
                      <FaNewspaper className="text-8xl text-white/40" />

                      <p className="mt-6 text-xl font-black text-white">
                        Today&apos;s Edition Preview
                      </p>

                      <p className="mt-2 max-w-sm text-gray-400">
                        The front-page preview will appear here after the
                        newspaper is published.
                      </p>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-12 left-12 right-12 rounded-2xl border border-white/10 bg-gray-950/90 p-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-400">
                        Free Preview
                      </p>

                      <p className="mt-1 font-black text-white">
                        Read page one before subscribing
                      </p>
                    </div>

                    <FaCheckCircle className="shrink-0 text-3xl text-red-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">
                  Published Daily
                </p>

                <h3 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  {latestNewspaper?.title ||
                    "The Aspire Nation Daily E-Paper"}
                </h3>

                {latestNewspaper?.edition_date && (
                  <p className="mt-4 flex items-center gap-2 font-semibold text-gray-400">
                    <FaCalendarAlt className="text-red-500" />
                    {formatDate(latestNewspaper.edition_date)}
                  </p>
                )}

                <div className="mt-8">
                  <h4 className="text-xl font-black text-white">
                    Inside Today&apos;s Newspaper
                  </h4>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      "National Current Affairs",
                      "International Affairs",
                      "Indian Economy",
                      "Science and Technology",
                      "Environment and Ecology",
                      "Editorial Analysis",
                      "Daily Practice MCQs",
                      "Quick Revision Notes",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600">
                          <FaCheck size={11} />
                        </div>

                        <p className="text-sm font-semibold text-gray-200">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600">
                      <FaCrown />
                    </div>

                    <div>
                      <p className="font-black text-white">
                        Full Edition Is Premium
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-300">
                        The first page is available as a free preview. Premium
                        members can securely read the complete eight-page
                        edition.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {latestNewspaper ? (
                    <Link
                      href={`/epaper/${latestNewspaper.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-black text-white transition hover:bg-white/20"
                    >
                      <FaNewspaper />
                      Read Free Preview
                    </Link>
                  ) : (
                    <Link
                      href="/epaper"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-black text-white transition hover:bg-white/20"
                    >
                      <FaNewspaper />
                      View E-Paper
                    </Link>
                  )}

                  <Link
                    href="/subscribe"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-xl"
                  >
                    <FaCrown />
                    Unlock Full Edition
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 py-5 text-center">
                  <div className="px-2">
                    <p className="text-2xl font-black text-red-400">8</p>
                    <p className="mt-1 text-xs font-semibold text-gray-400">
                      Daily Pages
                    </p>
                  </div>

                  <div className="px-2">
                    <p className="text-2xl font-black text-red-400">20</p>
                    <p className="mt-1 text-xs font-semibold text-gray-400">
                      Minutes
                    </p>
                  </div>

                  <div className="px-2">
                    <p className="text-2xl font-black text-red-400">
                      100%
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-400">
                      Exam Focused
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            {/* Preparation Comparison */}

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
              Use your saved time for revision, mock tests, answer writing and
              deeper preparation.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Membership */}

      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[32px] bg-gray-950 text-white shadow-2xl">
            <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-red-900/40 blur-3xl" />

            <div className="relative grid items-stretch lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-10 lg:p-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-red-300">
                  <FaCrown />
                  Aspire Nation Premium
                </div>

                <h2 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  One Subscription.
                  <span className="block text-red-500">
                    Complete Preparation.
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                  Get complete access to the daily e-paper, current affairs,
                  editorial analysis, archive, quizzes and premium preparation
                  resources in one membership.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    "Complete daily e-paper",
                    "Full current affairs access",
                    "Editorial analysis",
                    "Premium archive",
                    "Daily practice quiz",
                    "Exam-focused revision notes",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600">
                        <FaCheck size={13} />
                      </div>

                      <p className="font-semibold text-gray-200">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-gray-400">
                  {[
                    "Secure Payment",
                    "Instant Access",
                    "Cancel Anytime",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <FaCheckCircle className="text-red-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center bg-gradient-to-br from-red-700 via-red-800 to-red-950 p-8 sm:p-10 lg:p-12">
                <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-gray-950 shadow-2xl sm:p-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-950 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                    Most Popular
                  </div>

                  <div className="mt-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                    <FaCrown className="text-3xl text-red-700" />
                  </div>

                  <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-gray-500">
                    Monthly Membership
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-6xl font-black text-gray-950">
                      ₹99
                    </span>

                    <span className="pb-2 text-lg font-bold text-gray-500">
                      /month
                    </span>
                  </div>

                  <p className="mt-5 leading-7 text-gray-600">
                    Unlock every premium preparation resource with one simple
                    monthly plan.
                  </p>

                  <Link
                    href="/subscribe"
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-7 py-4 text-center text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-xl"
                  >
                    Start Premium Membership
                    <FaArrowRight />
                  </Link>

                  <p className="mt-4 text-center text-sm font-semibold text-gray-500">
                    Full premium access begins immediately after payment.
                  </p>

                  <div className="mt-7 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        ["8", "Daily Pages"],
                        ["365", "Editions"],
                        ["100%", "Exam Focused"],
                      ].map(([value, label]) => (
                        <div key={label}>
                          <p className="text-xl font-black text-red-700">
                            {value}
                          </p>

                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            {/* Featured Current Affairs */}

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

      {/* Why Aspirants Choose Us */}

      <section className="border-y border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div>
            <p className="mb-4 font-black uppercase tracking-widest text-red-700">
              Editor&apos;s Note
            </p>

            <h2 className="text-5xl font-black leading-tight drop-shadow-sm md:text-6xl">
              Why Aspirants Choose Us?
            </h2>

            <p className="mt-7 text-lg leading-8 text-gray-800">
              Aspirants already have enough to study. They should not have to
              spend valuable time searching for reliable current affairs,
              editorials and preparation material across many sources.
            </p>

            <p className="mt-4 text-lg leading-8 text-gray-800">
              The Aspire Nation brings important information together in a
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
            <h3 className="text-2xl font-black text-gray-800 drop-shadow-sm md:text-3xl">
              What makes it different?
            </h3>

            <div className="mt-7 space-y-4">
              {[
                "Only exam-relevant news and analysis",
                "No entertainment or unnecessary content",
                "Saves hours of searching every day",
                "Simple language and organised presentation",
                "Editorial analysis for serious preparation",
                "Daily quiz and revision support",
                "Previous editions available in one archive",
                "Secure premium e-paper access",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 shrink-0 text-red-700" />

                  <p className="font-semibold text-gray-800">{item}</p>
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
            {/* Final CTA */}

      <section className="bg-red-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <FaGraduationCap className="mx-auto text-5xl" />

          <h2 className="mt-5 text-4xl font-black sm:text-5xl">
            Make Every Morning Count.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-red-100">
            Begin your day with focused news, organised current affairs and
            useful preparation material—all in one place.
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
                <Link href="/epaper" className="hover:text-white">
                  E-Paper
                </Link>

                <Link
                  href="/current-affairs"
                  className="hover:text-white"
                >
                  Current Affairs
                </Link>

                <Link href="/editorial" className="hover:text-white">
                  Editorial
                </Link>

                <Link href="/subscribe" className="hover:text-white">
                  Premium Membership
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-black">Company</h4>

              <div className="mt-4 grid gap-3 text-sm text-gray-400">
                <Link href="/about" className="hover:text-white">
                  About
                </Link>

                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>

                <Link href="/register" className="hover:text-white">
                  Create Account
                </Link>

                <Link href="/login" className="hover:text-white">
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