"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import {
  FaBookOpen,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaExclamationTriangle,
  FaHome,
  FaNewspaper,
  FaPenNib,
  FaQuestionCircle,
  FaRupeeSign,
  FaSignOutAlt,
  FaTrophy,
  FaUpload,
  FaUsers,
} from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [stats, setStats] = useState({
    newspapers: 0,
    currentAffairs: 0,
    jobs: 0,
    results: 0,
    editorials: 0,
    quiz: 0,
    activePremiumUsers: 0,
    monthlyRevenue: 0,
  });

  const [todayStatus, setTodayStatus] = useState({
    newspaper: false,
    currentAffairs: 0,
    jobs: 0,
    results: 0,
    editorials: 0,
    quiz: 0,
  });

  const [dataError, setDataError] = useState("");

  useEffect(() => {
    initialiseDashboard();
  }, []);

  async function initialiseDashboard() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);

      await loadDashboardData();
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setDataError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }

  function getTodayRange() {
    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      date: start.toISOString().slice(0, 10),
    };
  }

  async function loadDashboardData() {
    setDataError("");

    const { start, end, date } = getTodayRange();

    const [
      newspapersResponse,
      currentAffairsResponse,
      jobsResponse,
      resultsResponse,
      editorialsResponse,
      quizResponse,
      premiumUsersResponse,
      paymentsResponse,
      todayNewspaperResponse,
      todayCurrentAffairsResponse,
      todayJobsResponse,
      todayResultsResponse,
      todayEditorialsResponse,
      todayQuizResponse,
    ] = await Promise.all([
      supabase
        .from("newspapers")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("current_affairs")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("results")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("editorials")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("daily_quiz")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("user_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gte("expiry_date", new Date().toISOString()),

      supabase
        .from("payments")
        .select("amount, created_at")
        .gte("created_at", new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()),

      supabase
        .from("newspapers")
        .select("id")
        .eq("edition_date", date)
        .eq("is_published", true)
        .limit(1),

      supabase
        .from("current_affairs")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", start)
        .lt("published_at", end),

      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", start)
        .lt("published_at", end),

      supabase
        .from("results")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", start)
        .lt("published_at", end),

      supabase
        .from("editorials")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", start)
        .lt("published_at", end),

      supabase
        .from("daily_quiz")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", start)
        .lt("published_at", end),
    ]);

    const responses = [
      newspapersResponse,
      currentAffairsResponse,
      jobsResponse,
      resultsResponse,
      editorialsResponse,
      quizResponse,
      premiumUsersResponse,
      paymentsResponse,
    ];

    const firstError = responses.find((response) => response.error)?.error;

    if (firstError) {
      console.error("Dashboard data error:", firstError.message);
      setDataError(
        "Some dashboard information could not be loaded. Check your Supabase tables and policies."
      );
    }

    const monthlyRevenue = (paymentsResponse.data || []).reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    setStats({
      newspapers: newspapersResponse.count || 0,
      currentAffairs: currentAffairsResponse.count || 0,
      jobs: jobsResponse.count || 0,
      results: resultsResponse.count || 0,
      editorials: editorialsResponse.count || 0,
      quiz: quizResponse.count || 0,
      activePremiumUsers: premiumUsersResponse.count || 0,
      monthlyRevenue,
    });

    setTodayStatus({
      newspaper: Boolean(todayNewspaperResponse.data?.length),
      currentAffairs: todayCurrentAffairsResponse.count || 0,
      jobs: todayJobsResponse.count || 0,
      results: todayResultsResponse.count || 0,
      editorials: todayEditorialsResponse.count || 0,
      quiz: todayQuizResponse.count || 0,
    });
  }

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  const quickActions = [
    {
      title: "Publish Newspaper",
      description: "Upload today’s complete e-paper and preview.",
      href: "/admin/upload",
      icon: FaNewspaper,
      primary: true,
    },
    {
      title: "Current Affairs",
      description: "Publish today’s exam-focused articles.",
      href: "/admin/current-affairs",
      icon: FaBookOpen,
    },
    {
      title: "Job Notifications",
      description: "Add official government recruitment links.",
      href: "/admin/jobs",
      icon: FaBriefcase,
    },
    {
      title: "Results",
      description: "Publish latest examination result links.",
      href: "/admin/results",
      icon: FaTrophy,
    },
    {
      title: "Editorial",
      description: "Add public summaries and premium analysis.",
      href: "/admin/editorial",
      icon: FaPenNib,
    },
    {
      title: "Daily Quiz",
      description: "Create and publish today’s quiz questions.",
      href: "/admin/quiz",
      icon: FaQuestionCircle,
    },
  ];

  const contentCards = [
    {
      title: "Newspapers",
      value: stats.newspapers,
      icon: FaNewspaper,
      href: "/admin/upload",
    },
    {
      title: "Current Affairs",
      value: stats.currentAffairs,
      icon: FaBookOpen,
      href: "/admin/current-affairs",
    },
    {
      title: "Job Updates",
      value: stats.jobs,
      icon: FaBriefcase,
      href: "/admin/jobs",
    },
    {
      title: "Results",
      value: stats.results,
      icon: FaTrophy,
      href: "/admin/results",
    },
    {
      title: "Editorials",
      value: stats.editorials,
      icon: FaPenNib,
      href: "/admin/editorial",
    },
    {
      title: "Quiz Questions",
      value: stats.quiz,
      icon: FaQuestionCircle,
      href: "/admin/quiz",
    },
  ];

  const dailyChecklist = [
    {
      title: "Today’s Newspaper",
      completed: todayStatus.newspaper,
      value: todayStatus.newspaper ? "Published" : "Not Published",
      href: "/admin/upload",
    },
    {
      title: "Current Affairs",
      completed: todayStatus.currentAffairs > 0,
      value: `${todayStatus.currentAffairs} Published`,
      href: "/admin/current-affairs",
    },
    {
      title: "Job Notifications",
      completed: todayStatus.jobs > 0,
      value: `${todayStatus.jobs} Published`,
      href: "/admin/jobs",
    },
    {
      title: "Result Updates",
      completed: todayStatus.results > 0,
      value: `${todayStatus.results} Published`,
      href: "/admin/results",
    },
    {
      title: "Editorial",
      completed: todayStatus.editorials > 0,
      value: `${todayStatus.editorials} Published`,
      href: "/admin/editorial",
    },
    {
      title: "Daily Quiz",
      completed: todayStatus.quiz > 0,
      value: `${todayStatus.quiz} Questions`,
      href: "/admin/quiz",
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-600">
            Loading CMS control room...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-xl">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-red-400">
                The Aspire Nation CMS
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Daily Publishing Control Room
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-gray-300">
                Review today&apos;s publishing status, add content and manage
                your complete aspirant platform from one place.
              </p>

              <p className="mt-4 text-sm font-semibold text-gray-400">
                Logged in as: {user?.email}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
                >
                  <FaHome />
                  View Website
                </Link>

                <Link
                  href="/admin/upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                >
                  <FaUpload />
                  Publish Newspaper
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-gray-950 transition hover:bg-gray-100 disabled:bg-gray-400"
                >
                  <FaSignOutAlt />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <FaClock className="text-2xl text-red-400" />

                <div>
                  <p className="text-sm font-bold text-gray-400">
                    Daily Goal
                  </p>

                  <p className="text-xl font-black">
                    Ready Before 06:00 AM
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-sm leading-6 text-gray-300">
                  Complete the newspaper, current affairs, editorial and quiz
                  before the morning publication deadline.
                </p>
              </div>
            </div>
          </div>
        </header>

        {dataError && (
          <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800">
            <FaExclamationTriangle className="mt-1 shrink-0" />
            <p className="font-semibold">{dataError}</p>
          </div>
        )}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Active Premium Users
                </p>

                <p className="mt-2 text-3xl font-black text-gray-950">
                  {stats.activePremiumUsers}
                </p>
              </div>

              <div className="rounded-2xl bg-red-100 p-4">
                <FaCrown className="text-2xl text-red-700" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Monthly Revenue
                </p>

                <p className="mt-2 text-3xl font-black text-gray-950">
                  ₹{stats.monthlyRevenue.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-2xl bg-green-100 p-4">
                <FaRupeeSign className="text-2xl text-green-700" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Content Modules
                </p>

                <p className="mt-2 text-3xl font-black text-gray-950">
                  6
                </p>
              </div>

              <div className="rounded-2xl bg-blue-100 p-4">
                <FaChartLine className="text-2xl text-blue-700" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Publishing Deadline
                </p>

                <p className="mt-2 text-3xl font-black text-gray-950">
                  06:00
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-100 p-4">
                <FaClock className="text-2xl text-yellow-700" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow xl:col-span-2 sm:p-8">
            <div>
              <h2 className="text-2xl font-black text-gray-950">
                Today&apos;s Publishing Checklist
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                See what has been published today and what still needs attention.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {dailyChecklist.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
                    item.completed
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-gray-950">
                        {item.title}
                      </h3>

                      <p
                        className={`mt-2 text-sm font-bold ${
                          item.completed
                            ? "text-green-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>

                    {item.completed ? (
                      <FaCheckCircle className="text-2xl text-green-600" />
                    ) : (
                      <FaExclamationTriangle className="text-2xl text-yellow-600" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl bg-gray-950 p-6 text-white shadow sm:p-8">
            <h2 className="text-2xl font-black">
              Morning Workflow
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Recommended publishing order for the daily 06:00 AM release.
            </p>

            <div className="mt-6 space-y-4">
              {[
                "Upload final newspaper PDF",
                "Publish current affairs",
                "Publish today’s editorial",
                "Add important jobs and results",
                "Publish daily quiz",
                "Verify public pages",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-black">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm font-semibold text-gray-200">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div>
            <h2 className="text-2xl font-black text-gray-950">
              Quick Publish
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Open any publishing module directly.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                    item.primary
                      ? "border-red-700 bg-red-700 text-white"
                      : "border-gray-200 bg-white text-gray-950 hover:border-red-200"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      item.primary
                        ? "bg-white/15"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <Icon className="text-2xl" />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {item.title}
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-6 ${
                      item.primary ? "text-red-100" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div>
            <h2 className="text-2xl font-black text-gray-950">
              Content Library
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Total content stored across all CMS modules.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentCards.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 p-5 transition hover:border-red-200 hover:bg-red-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-red-100 p-3">
                      <Icon className="text-xl text-red-700" />
                    </div>

                    <div>
                      <p className="font-black text-gray-950">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Manage content
                      </p>
                    </div>
                  </div>

                  <p className="text-2xl font-black text-red-700">
                    {item.value}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}