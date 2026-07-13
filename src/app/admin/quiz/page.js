"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaPlus,
  FaQuestionCircle,
  FaSave,
  FaTrash,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

const categories = [
  "Current Affairs",
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Science",
  "Environment",
  "General Knowledge",
  "Government Schemes",
  "International Affairs",
  "Sports",
  "Miscellaneous",
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function QuizAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [category, setCategory] = useState("Current Affairs");
  const [difficulty, setDifficulty] = useState("Easy");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    initialisePage();
  }, []);

  async function initialisePage() {
    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setCheckingUser(false);

      await loadQuestions();
    } catch (error) {
      console.error("Quiz page loading error:", error);
      router.replace("/login");
    }
  }

  async function loadQuestions() {
    setLoadingQuestions(true);

    const { data, error } = await supabase
      .from("daily_quiz")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoadingQuestions(false);
      return;
    }

    setQuestions(data || []);
    setLoadingQuestions(false);
  }

  function resetForm() {
    setEditingId(null);
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setExplanation("");
    setCategory("Current Affairs");
    setDifficulty("Easy");
    setPublishedAt("");
    setIsPublished(true);
    setPreviewOpen(false);
  }

  function startEditing(item) {
    setEditingId(item.id);
    setQuestion(item.question || "");
    setOptionA(item.option_a || "");
    setOptionB(item.option_b || "");
    setOptionC(item.option_c || "");
    setOptionD(item.option_d || "");
    setCorrectAnswer(item.correct_answer || "A");
    setExplanation(item.explanation || "");
    setCategory(item.category || "Current Affairs");
    setDifficulty(item.difficulty || "Easy");
    setPublishedAt(
      item.published_at
        ? new Date(item.published_at).toISOString().slice(0, 16)
        : ""
    );
    setIsPublished(Boolean(item.is_published));
    setPreviewOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getCorrectOptionText() {
    const options = {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD,
    };

    return options[correctAnswer] || "";
  }

  function validateForm() {
    if (!question.trim()) {
      throw new Error("Please enter the question.");
    }

    if (!optionA.trim()) {
      throw new Error("Please enter Option A.");
    }

    if (!optionB.trim()) {
      throw new Error("Please enter Option B.");
    }

    if (!optionC.trim()) {
      throw new Error("Please enter Option C.");
    }

    if (!optionD.trim()) {
      throw new Error("Please enter Option D.");
    }

    if (!["A", "B", "C", "D"].includes(correctAnswer)) {
      throw new Error("Please select the correct answer.");
    }

    if (!explanation.trim()) {
      throw new Error("Please enter the answer explanation.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      validateForm();

      const payload = {
        question: question.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_answer: correctAnswer,
        explanation: explanation.trim(),
        category,
        difficulty,
        is_published: isPublished,
        published_at: publishedAt
          ? new Date(publishedAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingId) {
        const response = await supabase
          .from("daily_quiz")
          .update(payload)
          .eq("id", editingId);

        error = response.error;
      } else {
        const response = await supabase
          .from("daily_quiz")
          .insert([payload]);

        error = response.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        editingId
          ? "Quiz question updated successfully."
          : isPublished
            ? "Quiz question published successfully."
            : "Quiz question saved as a draft."
      );

      setMessageType("success");

      resetForm();
      await loadQuestions();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the quiz question."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete this question permanently?\n\n${item.question}`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("daily_quiz")
      .delete()
      .eq("id", item.id);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setDeletingId(null);
      return;
    }

    if (editingId === item.id) {
      resetForm();
    }

    setMessage("Quiz question deleted successfully.");
    setMessageType("success");
    setDeletingId(null);

    await loadQuestions();
  }

  function formatDate(value) {
    if (!value) return "Not published";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const publishedCount = useMemo(
    () => questions.filter((item) => item.is_published).length,
    [questions]
  );

  const draftCount = useMemo(
    () => questions.filter((item) => !item.is_published).length,
    [questions]
  );

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-600">
            Checking administrator access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl bg-gray-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300"
              >
                <FaArrowLeft />
                Back to Admin Dashboard
              </Link>

              <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                Daily Quiz CMS
              </h1>

              <p className="mt-2 max-w-2xl text-gray-300">
                Create, edit and publish exam-focused MCQs for daily aspirant
                practice.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Administrator: {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-4 text-center">
                <p className="text-2xl font-black">
                  {questions.length}
                </p>

                <p className="text-xs text-gray-300">
                  Total
                </p>
              </div>

              <div className="rounded-2xl bg-green-600 px-4 py-4 text-center">
                <p className="text-2xl font-black">
                  {publishedCount}
                </p>

                <p className="text-xs text-green-100">
                  Published
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-600 px-4 py-4 text-center">
                <p className="text-2xl font-black">
                  {draftCount}
                </p>

                <p className="text-xs text-yellow-100">
                  Drafts
                </p>
              </div>
            </div>
          </div>
        </header>

        {message && (
          <div
            className={`rounded-2xl border px-5 py-4 font-semibold ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl bg-white p-6 shadow lg:col-span-2 sm:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {editingId
                    ? "Edit Quiz Question"
                    : "Add New Quiz Question"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter four options and select one correct answer.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="quiz-question"
                className="mb-2 block font-bold text-gray-800"
              >
                Question
              </label>

              <textarea
                id="quiz-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                placeholder="Enter the quiz question..."
                disabled={saving}
                required
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="option-a"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Option A
                </label>

                <input
                  id="option-a"
                  type="text"
                  value={optionA}
                  onChange={(event) => setOptionA(event.target.value)}
                  placeholder="Enter Option A"
                  disabled={saving}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="option-b"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Option B
                </label>

                <input
                  id="option-b"
                  type="text"
                  value={optionB}
                  onChange={(event) => setOptionB(event.target.value)}
                  placeholder="Enter Option B"
                  disabled={saving}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="option-c"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Option C
                </label>

                <input
                  id="option-c"
                  type="text"
                  value={optionC}
                  onChange={(event) => setOptionC(event.target.value)}
                  placeholder="Enter Option C"
                  disabled={saving}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="option-d"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Option D
                </label>

                <input
                  id="option-d"
                  type="text"
                  value={optionD}
                  onChange={(event) => setOptionD(event.target.value)}
                  placeholder="Enter Option D"
                  disabled={saving}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="correct-answer"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Correct Answer
                </label>

                <select
                  id="correct-answer"
                  value={correctAnswer}
                  onChange={(event) => setCorrectAnswer(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="quiz-category"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Category
                </label>

                <select
                  id="quiz-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="quiz-difficulty"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Difficulty
                </label>

                <select
                  id="quiz-difficulty"
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                >
                  {difficulties.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="quiz-explanation"
                className="mb-2 block font-bold text-gray-800"
              >
                Answer Explanation
              </label>

              <textarea
                id="quiz-explanation"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                rows={5}
                placeholder="Explain why the selected answer is correct..."
                disabled={saving}
                required
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="quiz-published-at"
                className="mb-2 block font-bold text-gray-800"
              >
                Publish Date and Time
              </label>

              <input
                id="quiz-published-at"
                type="datetime-local"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
                disabled={saving}
                className="h-5 w-5 accent-red-600"
              />

              <div>
                <p className="font-bold text-gray-900">
                  Publish Question
                </p>

                <p className="text-sm text-gray-500">
                  Turn this off to save the question as a draft.
                </p>
              </div>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving question...
                  </>
                ) : editingId ? (
                  <>
                    <FaSave />
                    Update Question
                  </>
                ) : (
                  <>
                    <FaPlus />
                    {isPublished
                      ? "Publish Question"
                      : "Save as Draft"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    validateForm();
                    setPreviewOpen(true);
                  } catch (error) {
                    setMessage(error.message);
                    setMessageType("error");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3.5 font-black text-gray-800 hover:bg-gray-50"
              >
                <FaEye />
                Preview
              </button>
            </div>
          </form>

          <aside className="h-fit space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow sm:p-8">
              <h2 className="text-xl font-black text-gray-900">
                Quiz Rules
              </h2>

              <div className="mt-6 space-y-5">
                {[
                  "Add exactly four clear answer options.",
                  "Select only one correct answer.",
                  "Keep the explanation simple and factual.",
                  "Avoid ambiguous or opinion-based questions.",
                  "Focus on competitive exam relevance.",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <FaCheckCircle className="mt-1 shrink-0 text-green-600" />

                    <p className="text-sm leading-6 text-gray-600">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {previewOpen && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-gray-900">
                    Question Preview
                  </h2>

                  <button
                    type="button"
                    onClick={() => setPreviewOpen(false)}
                    className="text-sm font-bold text-red-700"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      {category}
                    </span>

                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700">
                      {difficulty}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-gray-900">
                    {question}
                  </h3>

                  <div className="mt-4 space-y-3">
                    {[
                      ["A", optionA],
                      ["B", optionB],
                      ["C", optionC],
                      ["D", optionD],
                    ].map(([letter, option]) => (
                      <div
                        key={letter}
                        className={`rounded-xl border px-4 py-3 ${
                          correctAnswer === letter
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <span className="font-black">{letter}.</span>{" "}
                        {option}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-white p-4">
                    <p className="font-black text-green-700">
                      Correct Answer: {correctAnswer}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {getCorrectOptionText()}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Question Library
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage published questions and drafts.
              </p>
            </div>

            <button
              type="button"
              onClick={loadQuestions}
              disabled={loadingQuestions}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              {loadingQuestions ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loadingQuestions ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

              <p className="mt-4 text-gray-500">
                Loading quiz questions...
              </p>
            </div>
          ) : questions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
              <FaQuestionCircle
                size={42}
                className="mx-auto text-gray-400"
              />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No quiz question published yet
              </h3>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-3 py-4">Question</th>
                    <th className="px-3 py-4">Category</th>
                    <th className="px-3 py-4">Difficulty</th>
                    <th className="px-3 py-4">Answer</th>
                    <th className="px-3 py-4">Date</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {questions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="max-w-md px-3 py-5">
                        <p className="line-clamp-2 font-bold text-gray-900">
                          {item.question}
                        </p>
                      </td>

                      <td className="px-3 py-5 text-gray-600">
                        {item.category}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            item.difficulty === "Hard"
                              ? "bg-red-100 text-red-700"
                              : item.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>

                      <td className="px-3 py-5 font-black text-gray-900">
                        {item.correct_answer}
                      </td>

                      <td className="px-3 py-5 text-gray-600">
                        {formatDate(item.published_at)}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            item.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {item.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="rounded-lg bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
                            aria-label={`Edit ${item.question}`}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="rounded-lg bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:text-gray-400"
                            aria-label={`Delete ${item.question}`}
                          >
                            {deletingId === item.id ? (
                              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}