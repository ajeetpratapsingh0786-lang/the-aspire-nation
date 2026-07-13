"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaRedo,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

export default function PublicQuizPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("daily_quiz")
      .select(
        `
          id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          category,
          difficulty,
          published_at
        `
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message || "Unable to load the quiz.");
      setLoading(false);
      return;
    }

    setQuestions(data || []);
    setLoading(false);
  }

  function selectAnswer(questionId, option) {
    if (submitted) return;

    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  }

  function handleSubmit() {
    if (questions.length === 0) return;

    const unanswered = questions.filter(
      (question) => !answers[question.id]
    );

    if (unanswered.length > 0) {
      const confirmed = window.confirm(
        `You have not answered ${unanswered.length} question(s). Submit anyway?`
      );

      if (!confirmed) return;
    }

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function restartQuiz() {
    setAnswers({});
    setSubmitted(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getOptionText(question, option) {
    const options = {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    };

    return options[option] || "";
  }

  function formatDate(value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return answers[question.id] === question.correct_answer
        ? total + 1
        : total;
    }, 0);
  }, [answers, questions]);

  const answeredCount = useMemo(
    () =>
      questions.filter((question) => Boolean(answers[question.id]))
        .length,
    [answers, questions]
  );

  const percentage =
    questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  function getPerformanceMessage() {
    if (percentage >= 80) {
      return "Excellent performance. Your preparation is strong.";
    }

    if (percentage >= 60) {
      return "Good effort. Review the explanations and keep practising.";
    }

    if (percentage >= 40) {
      return "Fair attempt. Revise the topics and try again.";
    }

    return "Keep practising. Read the explanations carefully and retry.";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-600">
            Loading today&apos;s quiz...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-2xl text-red-600" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-gray-900">
            Unable to Load Quiz
          </h1>

          <p className="mt-3 text-gray-600">{errorMessage}</p>

          <button
            type="button"
            onClick={loadQuestions}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            <FaRedo />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-950 px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-red-400 hover:text-red-300"
          >
            <FaArrowLeft />
            Back to Home
          </Link>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-red-400">
                The Aspire Nation
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                Daily Quiz
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-300">
                Test your preparation with exam-focused multiple-choice
                questions and detailed explanations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                <p className="text-2xl font-black">
                  {questions.length}
                </p>

                <p className="text-xs text-gray-300">
                  Questions
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                <p className="text-2xl font-black">
                  {answeredCount}
                </p>

                <p className="text-xs text-gray-300">
                  Answered
                </p>
              </div>

              <div className="col-span-2 rounded-2xl bg-red-600 px-5 py-4 text-center sm:col-span-1">
                <p className="text-2xl font-black">
                  {submitted ? score : "—"}
                </p>

                <p className="text-xs text-red-100">
                  Score
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {questions.length === 0 ? (
          <section className="rounded-3xl bg-white px-6 py-16 text-center shadow">
            <FaQuestionCircle
              size={48}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-black text-gray-900">
              No Quiz Published Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Today&apos;s quiz will appear here after publication.
            </p>
          </section>
        ) : (
          <>
            {submitted && (
              <section className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="grid md:grid-cols-3">
                  <div className="flex items-center justify-center bg-red-700 p-8 text-white">
                    <div className="text-center">
                      <FaTrophy className="mx-auto text-5xl" />

                      <p className="mt-4 text-5xl font-black">
                        {score}/{questions.length}
                      </p>

                      <p className="mt-2 font-bold text-red-100">
                        Final Score
                      </p>
                    </div>
                  </div>

                  <div className="p-7 md:col-span-2 sm:p-10">
                    <p className="text-sm font-black uppercase tracking-widest text-red-700">
                      Quiz Result
                    </p>

                    <h2 className="mt-3 text-3xl font-black text-gray-950">
                      {percentage}% Accuracy
                    </h2>

                    <p className="mt-4 text-lg leading-8 text-gray-600">
                      {getPerformanceMessage()}
                    </p>

                    <div className="mt-6 h-4 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-red-600 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={restartQuiz}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-black text-white hover:bg-black"
                      >
                        <FaRedo />
                        Attempt Again
                      </button>

                      <Link
                        href="/current-affairs"
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-700"
                      >
                        Review Current Affairs
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-6">
              {questions.map((question, index) => {
                const selectedAnswer = answers[question.id];
                const isCorrect =
                  selectedAnswer === question.correct_answer;

                return (
                  <article
                    key={question.id}
                    className="rounded-3xl bg-white p-6 shadow sm:p-8"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 font-black text-red-700">
                          {index + 1}
                        </div>

                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              {question.category}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                question.difficulty === "Hard"
                                  ? "bg-red-100 text-red-700"
                                  : question.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {question.difficulty}
                            </span>
                          </div>

                          <h2 className="mt-4 text-xl font-black leading-8 text-gray-950 sm:text-2xl">
                            {question.question}
                          </h2>

                          <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <FaClock />
                            {formatDate(question.published_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3 md:grid-cols-2">
                      {[
                        ["A", question.option_a],
                        ["B", question.option_b],
                        ["C", question.option_c],
                        ["D", question.option_d],
                      ].map(([letter, optionText]) => {
                        const isSelected =
                          selectedAnswer === letter;

                        const isCorrectOption =
                          question.correct_answer === letter;

                        let optionClasses =
                          "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50";

                        if (submitted) {
                          if (isCorrectOption) {
                            optionClasses =
                              "border-green-300 bg-green-50 text-green-800";
                          } else if (isSelected && !isCorrectOption) {
                            optionClasses =
                              "border-red-300 bg-red-50 text-red-800";
                          } else {
                            optionClasses =
                              "border-gray-200 bg-gray-50 text-gray-500";
                          }
                        } else if (isSelected) {
                          optionClasses =
                            "border-red-600 bg-red-50 text-red-800 ring-2 ring-red-100";
                        }

                        return (
                          <button
                            key={letter}
                            type="button"
                            onClick={() =>
                              selectAnswer(question.id, letter)
                            }
                            disabled={submitted}
                            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${optionClasses}`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black ${
                                submitted && isCorrectOption
                                  ? "bg-green-600 text-white"
                                  : submitted &&
                                      isSelected &&
                                      !isCorrectOption
                                    ? "bg-red-600 text-white"
                                    : isSelected
                                      ? "bg-red-600 text-white"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {letter}
                            </span>

                            <span className="pt-1 font-semibold leading-6">
                              {optionText}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div
                        className={`mt-7 rounded-2xl border p-5 ${
                          isCorrect
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <FaCheckCircle className="mt-1 shrink-0 text-2xl text-green-600" />
                          ) : (
                            <FaTimesCircle className="mt-1 shrink-0 text-2xl text-red-600" />
                          )}

                          <div>
                            <h3
                              className={`font-black ${
                                isCorrect
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              {isCorrect
                                ? "Correct Answer"
                                : "Incorrect Answer"}
                            </h3>

                            <p className="mt-2 font-bold text-gray-900">
                              Correct option:{" "}
                              {question.correct_answer}.{" "}
                              {getOptionText(
                                question,
                                question.correct_answer
                              )}
                            </p>

                            <p className="mt-3 leading-7 text-gray-700">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            {!submitted && (
              <section className="sticky bottom-4 mt-8 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-gray-950">
                      {answeredCount} of {questions.length} questions
                      answered
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Submit when you are ready to check your score.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-xl bg-red-600 px-7 py-3.5 font-black text-white hover:bg-red-700"
                  >
                    Submit Quiz
                  </button>
                </div>
              </section>
            )}

            {submitted && (
              <section className="mt-8 rounded-3xl bg-gray-950 p-7 text-white shadow-xl sm:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <FaCrown className="text-3xl text-yellow-400" />

                    <h2 className="mt-4 text-3xl font-black">
                      Continue Your Daily Preparation
                    </h2>

                    <p className="mt-3 max-w-2xl leading-7 text-gray-300">
                      Read today&apos;s e-paper, review current affairs and
                      track your complete study routine from your
                      dashboard.
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-red-600 px-7 py-3.5 font-black text-white hover:bg-red-700"
                  >
                    Open My Dashboard
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}