"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FaArrowRight,
  FaBookOpen,
  FaBriefcase,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaNewspaper,
  FaPenNib,
  FaQuestionCircle,
  FaRedo,
  FaSignOutAlt,
  FaTrophy,
  FaUserCircle,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

const preparationTasks = [
  {
    id: "newspaper",
    title: "Read Today’s Newspaper",
    description: "Complete today’s exam-focused e-paper.",
    duration: 20,
    href: "/epaper",
    icon: FaNewspaper,
  },
  {
    id: "current-affairs",
    title: "Review Current Affairs",
    description: "Read today’s important headlines and analysis.",
    duration: 15,
    href: "/current-affairs",
    icon: FaBookOpen,
  },
  {
    id: "editorial",
    title: "Read Today’s Editorial",
    description: "Improve analysis, mains and interview preparation.",
    duration: 10,
    href: "/editorial",
    icon: FaPenNib,
  },
  {
    id: "quiz",
    title: "Attempt Daily Quiz",
    description: "Test and revise today’s important topics.",
    duration: 10,
    href: "/quiz",
    icon: FaQuestionCircle,
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [latestNewspaper, setLatestNewspaper] = useState(null);

  const [todayContent, setTodayContent] = useState({
    currentAffairs: 0,
    editorials: 0,
    quiz: 0,
    jobs: 0,
    results: 0,
  });

  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");

  function getTodayKey() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      const now = new Date();

      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      ).toISOString();

      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
      ).toISOString();

      const todayDate = getTodayKey();

      const [
        subscriptionResponse,
        newspaperResponse,
        currentAffairsResponse,
        editorialResponse,
        quizResponse,
        jobsResponse,
        resultsResponse,
      ] = await Promise.all([
        supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("status", "active")
          .gte("expiry_date", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

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
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_published", true)
          .gte("published_at", startOfDay)
          .lt("published_at", endOfDay),

        supabase
          .from("editorials")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_published", true)
          .gte("published_at", startOfDay)
          .lt("published_at", endOfDay),

        supabase
          .from("daily_quiz")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_published", true)
          .gte("published_at", startOfDay)
          .lt("published_at", endOfDay),

        supabase
          .from("jobs")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_published", true)
          .gte("published_at", startOfDay)
          .lt("published_at", endOfDay),

        supabase
          .from("results")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_published", true)
          .gte("published_at", startOfDay)
          .lt("published_at", endOfDay),
      ]);

      if (subscriptionResponse.error) {
        console.error(
          "Subscription error:",
          subscriptionResponse.error.message
        );
      }

      setSubscription(subscriptionResponse.data || null);
      setLatestNewspaper(newspaperResponse.data || null);

      setTodayContent({
        currentAffairs: currentAffairsResponse.count || 0,
        editorials: editorialResponse.count || 0,
        quiz: quizResponse.count || 0,
        jobs: jobsResponse.count || 0,
        results: resultsResponse.count || 0,
      });

      const storageKey = `aspire-preparation-${currentUser.id}-${todayDate}`;

      try {
        const storedProgress = window.localStorage.getItem(storageKey);

        if (storedProgress) {
          const parsedProgress = JSON.parse(storedProgress);

          if (Array.isArray(parsedProgress)) {
            setCompletedTasks(parsedProgress);
          }
        }
      } catch (error) {
        console.error("Progress loading error:", error);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setMessage("Unable to load your dashboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function saveProgress(nextCompletedTasks) {
    setCompletedTasks(nextCompletedTasks);

    if (!user) return;

    const storageKey = `aspire-preparation-${user.id}-${getTodayKey()}`;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(nextCompletedTasks)
      );
    } catch (error) {
      console.error("Progress saving error:", error);
    }
  }

  function toggleTask(taskId) {
    const alreadyCompleted = completedTasks.includes(taskId);

    const nextCompletedTasks = alreadyCompleted
      ? completedTasks.filter((id) => id !== taskId)
      : [...completedTasks, taskId];

    saveProgress(nextCompletedTasks);
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Reset today’s preparation progress?"
    );

    if (!confirmed) return;

    saveProgress([]);
  }

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  function formatDate(value) {
    if (!value) return "";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const totalPreparationTime = useMemo(
    () =>
      preparationTasks.reduce(
        (total, task) => total + task.duration,
        0
      ),
    []
  );

  const completedTime = useMemo(
    () =>
      preparationTasks
        .filter((task) => completedTasks.includes(task.id))
        .reduce((total, task) => total + task.duration, 0),
    [completedTasks]
  );

  const progressPercentage = Math.round(
    (completedTasks.length / preparationTasks.length) * 100
  );

  const allTasksCompleted =
    completedTasks.length === preparationTasks.length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-600">
            Preparing your daily dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}

        <header className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-xl">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">
                The Aspire Nation
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Today&apos;s Preparation
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-gray-300">
                Complete your newspaper, current affairs, editorial and
                quiz in one focused daily routine.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <FaUserCircle className="text-2xl text-gray-400" />

                <div>
                  <p className="font-bold text-white">
                    {user?.email}
                  </p>

                  <p className="text-sm text-gray-400">
                    {subscription
                      ? "Premium Member"
                      : "Free Member"}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/20"
                >
                  Visit Homepage
                </Link>

                {!subscription && (
                  <Link
                    href="/subscribe"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700"
                  >
                    <FaCrown />
                    Upgrade to Premium
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-gray-950 hover:bg-gray-100 disabled:bg-gray-400"
                >
                  <FaSignOutAlt />

                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Daily Study Target
              </p>

              <div className="mt-4 flex items-end gap-2">
                <p className="text-5xl font-black text-red-400">
                  {totalPreparationTime}
                </p>

                <p className="pb-1 text-lg font-bold text-gray-300">
                  Minutes
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                A focused daily routine designed to reduce searching and
                information overload.
              </p>
            </div>
          </div>
        </header>

        {message && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
            {message}
          </div>
        )}

        {/* Progress */}

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-red-700">
                Daily Progress
              </p>

              <h2 className="mt-2 text-3xl font-black text-gray-950">
                {progressPercentage}% Completed
              </h2>

              <p className="mt-2 text-gray-500">
                {completedTime} of {totalPreparationTime} planned minutes
                completed.
              </p>
            </div>

            <button
              type="button"
              onClick={resetProgress}
              disabled={completedTasks.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <FaRedo />
              Reset Progress
            </button>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-red-600 transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          {allTasksCompleted && (
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
              <FaCheckCircle className="mt-1 shrink-0 text-2xl text-green-600" />

              <div>
                <h3 className="font-black text-green-800">
                  Today&apos;s Preparation Completed
                </h3>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Excellent work. You completed your complete daily
                  preparation routine.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Preparation Tasks */}

        <section>
          <div>
            <h2 className="text-3xl font-black text-gray-950">
              Your Daily Study Plan
            </h2>

            <p className="mt-2 text-gray-500">
              Complete each activity and mark it as finished.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {preparationTasks.map((task, index) => {
              const Icon = task.icon;
              const completed = completedTasks.includes(task.id);

              return (
                <article
                  key={task.id}
                  className={`rounded-3xl border p-6 shadow transition ${
                    completed
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white hover:-translate-y-1 hover:shadow-xl"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        completed
                          ? "bg-green-600 text-white"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {completed ? (
                        <FaCheck size={22} />
                      ) : (
                        <Icon size={23} />
                      )}
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600">
                      {task.duration} min
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-black uppercase tracking-widest text-gray-400">
                    Step {index + 1}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-gray-950">
                    {task.title}
                  </h3>

                  <p className="mt-2 leading-7 text-gray-600">
                    {task.description}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={task.href}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-black text-white hover:bg-black"
                    >
                      Open Activity
                      <FaArrowRight />
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-black ${
                        completed
                          ? "border border-green-300 bg-white text-green-700 hover:bg-green-100"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {completed ? (
                        <>
                          <FaCheckCircle />
                          Completed
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Mark Complete
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Today's Content */}

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-red-700">
              Published Today
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-950">
              Today&apos;s Content Overview
            </h2>

            <p className="mt-2 text-gray-500">
              See what is available for your preparation today.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link
              href="/current-affairs"
              className="rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50"
            >
              <FaBookOpen className="text-2xl text-red-700" />

              <p className="mt-4 text-3xl font-black">
                {todayContent.currentAffairs}
              </p>

              <p className="mt-1 text-sm font-bold text-gray-500">
                Current Affairs
              </p>
            </Link>

            <Link
              href="/editorial"
              className="rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50"
            >
              <FaPenNib className="text-2xl text-red-700" />

              <p className="mt-4 text-3xl font-black">
                {todayContent.editorials}
              </p>

              <p className="mt-1 text-sm font-bold text-gray-500">
                Editorials
              </p>
            </Link>

            <Link
              href="/quiz"
              className="rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50"
            >
              <FaQuestionCircle className="text-2xl text-red-700" />

              <p className="mt-4 text-3xl font-black">
                {todayContent.quiz}
              </p>

              <p className="mt-1 text-sm font-bold text-gray-500">
                Quiz Questions
              </p>
            </Link>

            <Link
              href="/jobs"
              className="rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50"
            >
              <FaBriefcase className="text-2xl text-red-700" />

              <p className="mt-4 text-3xl font-black">
                {todayContent.jobs}
              </p>

              <p className="mt-1 text-sm font-bold text-gray-500">
                Job Updates
              </p>
            </Link>

            <Link
              href="/results"
              className="rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50"
            >
              <FaTrophy className="text-2xl text-red-700" />

              <p className="mt-4 text-3xl font-black">
                {todayContent.results}
              </p>

              <p className="mt-1 text-sm font-bold text-gray-500">
                Results
              </p>
            </Link>
          </div>
        </section>

        {/* Latest Newspaper */}

        <section className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-7 sm:p-10">
              <p className="text-sm font-black uppercase tracking-widest text-red-400">
                Latest E-Paper
              </p>

              {latestNewspaper ? (
                <>
                  <h2 className="mt-4 text-3xl font-black">
                    {latestNewspaper.title}
                  </h2>

                  <p className="mt-3 inline-flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt />
                    {formatDate(latestNewspaper.edition_date)}
                  </p>

                  <p className="mt-5 max-w-xl leading-7 text-gray-300">
                    Read Page 1 for free and unlock the complete secure
                    edition with premium membership.
                  </p>

                  <Link
                    href={`/epaper/${latestNewspaper.id}`}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-700"
                  >
                    Open Latest Edition
                    <FaArrowRight />
                  </Link>
                </>
              ) : (
                <p className="mt-5 text-gray-300">
                  No newspaper edition has been published yet.
                </p>
              )}
            </div>

            <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-red-800 to-red-950 p-6">
              {latestNewspaper?.preview_url ? (
                <img
                  src={latestNewspaper.preview_url}
                  alt={latestNewspaper.title}
                  className="max-h-[430px] w-full rounded-2xl object-contain shadow-2xl"
                />
              ) : (
                <FaNewspaper
                  size={90}
                  className="text-white/50"
                />
              )}
            </div>
          </div>
        </section>

        {/* Subscription */}

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-red-700">
                Membership
              </p>

              <h2 className="mt-2 text-3xl font-black text-gray-950">
                {subscription
                  ? "Your Premium Membership Is Active"
                  : "Unlock Complete Preparation"}
              </h2>

              {subscription ? (
                <p className="mt-3 text-gray-600">
                  Plan:{" "}
                  <span className="font-black">
                    {subscription.plan || "Premium"}
                  </span>
                  {" · "}
                  Valid until{" "}
                  <span className="font-black">
                    {new Date(
                      subscription.expiry_date
                    ).toLocaleDateString("en-IN")}
                  </span>
                </p>
              ) : (
                <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                  Get the complete e-paper, full current affairs,
                  editorials, quiz access and preparation archives.
                </p>
              )}
            </div>

            <Link
              href={subscription ? "/epaper" : "/subscribe"}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-700 px-7 py-3.5 font-black text-white hover:bg-red-800"
            >
              <FaCrown />

              {subscription
                ? "Use Premium Access"
                : "Become Premium"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}