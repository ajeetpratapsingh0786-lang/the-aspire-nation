"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaExternalLinkAlt,
  FaPlus,
  FaSave,
  FaTrophy,
  FaTrash,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

const categories = [
  "UPSC",
  "SSC",
  "Banking",
  "Railway",
  "Defence",
  "Police",
  "State Jobs",
  "Teaching",
  "University",
  "Board Exam",
  "Other",
];

export default function ResultsAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SSC");
  const [officialLink, setOfficialLink] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    initialisePage();
  }, []);

  async function initialisePage() {
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

    await loadResults();
  }

  async function loadResults() {
    setLoadingResults(true);

    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoadingResults(false);
      return;
    }

    setResults(data || []);
    setLoadingResults(false);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("SSC");
    setOfficialLink("");
    setPublishedAt("");
    setIsPublished(true);
  }

  function startEditing(resultItem) {
    setEditingId(resultItem.id);
    setTitle(resultItem.title || "");
    setDescription(resultItem.description || "");
    setCategory(resultItem.category || "SSC");
    setOfficialLink(resultItem.official_link || "");
    setPublishedAt(
      resultItem.published_at
        ? new Date(resultItem.published_at).toISOString().slice(0, 16)
        : ""
    );
    setIsPublished(Boolean(resultItem.is_published));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      if (!title.trim()) {
        throw new Error("Please enter the result title.");
      }

      if (!description.trim()) {
        throw new Error("Please enter a one-line result description.");
      }

      if (!officialLink.trim()) {
        throw new Error("Please enter the official result link.");
      }

      try {
        new URL(officialLink.trim());
      } catch {
        throw new Error(
          "Please enter a valid link beginning with http:// or https://"
        );
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        official_link: officialLink.trim(),
        is_published: isPublished,
        published_at: publishedAt
          ? new Date(publishedAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingId) {
        const response = await supabase
          .from("results")
          .update(payload)
          .eq("id", editingId);

        error = response.error;
      } else {
        const response = await supabase
          .from("results")
          .insert([payload]);

        error = response.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        editingId
          ? "Result notification updated successfully."
          : isPublished
            ? "Result notification published successfully."
            : "Result notification saved as a draft."
      );

      setMessageType("success");
      resetForm();

      await loadResults();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the result notification."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(resultItem) {
    const confirmed = window.confirm(
      `Delete "${resultItem.title}" permanently?`
    );

    if (!confirmed) return;

    setDeletingId(resultItem.id);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("results")
      .delete()
      .eq("id", resultItem.id);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setDeletingId(null);
      return;
    }

    if (editingId === resultItem.id) {
      resetForm();
    }

    setMessage("Result notification deleted successfully.");
    setMessageType("success");
    setDeletingId(null);

    await loadResults();
  }

  function formatDate(value) {
    if (!value) return "Not published";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300"
              >
                <FaArrowLeft />
                Back to Admin Dashboard
              </Link>

              <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                Results Notifications CMS
              </h1>

              <p className="mt-2 max-w-2xl text-gray-300">
                Publish short exam-result notifications with an official result
                link.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Administrator: {user?.email}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600">
              <FaTrophy size={30} />
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
                    ? "Edit Result Notification"
                    : "Publish Result Notification"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add one short line and the official result link.
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
                htmlFor="result-title"
                className="mb-2 block font-bold text-gray-800"
              >
                Result Title
              </label>

              <input
                id="result-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="SSC CHSL Tier 1 Result 2026 Declared"
                disabled={saving}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="result-description"
                className="mb-2 block font-bold text-gray-800"
              >
                One-Line Information
              </label>

              <input
                id="result-description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Candidates can check their result on the official SSC website."
                disabled={saving}
                required
                maxLength={220}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />

              <p className="mt-2 text-sm text-gray-500">
                {description.length}/220 characters
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="result-category"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Category
                </label>

                <select
                  id="result-category"
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
                  htmlFor="result-published-at"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Publish Date and Time
                </label>

                <input
                  id="result-published-at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="result-link"
                className="mb-2 block font-bold text-gray-800"
              >
                Official Result Link
              </label>

              <input
                id="result-link"
                type="url"
                value={officialLink}
                onChange={(event) => setOfficialLink(event.target.value)}
                placeholder="https://official-website.gov.in/result"
                disabled={saving}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(event.target.checked)
                }
                disabled={saving}
                className="h-5 w-5 accent-red-600"
              />

              <div>
                <p className="font-bold text-gray-900">
                  Publish Result Notification
                </p>

                <p className="text-sm text-gray-500">
                  Turn this off to save it as a draft.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving result...
                </>
              ) : editingId ? (
                <>
                  <FaSave />
                  Update Result
                </>
              ) : (
                <>
                  <FaPlus />
                  Publish Result
                </>
              )}
            </button>
          </form>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow sm:p-8">
            <h2 className="text-xl font-black text-gray-900">
              Publishing Checklist
            </h2>

            <div className="mt-6 space-y-5">
              {[
                "Confirm that the result has officially been declared.",
                "Write the complete exam or recruitment name.",
                "Use only a short one-line description.",
                "Add the official result or organisation link.",
                "Open and verify the result link after publishing.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <FaCheckCircle className="mt-1 shrink-0 text-green-600" />

                  <p className="text-sm leading-6 text-gray-600">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Result Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage result notifications and saved drafts.
              </p>
            </div>

            <button
              type="button"
              onClick={loadResults}
              disabled={loadingResults}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              {loadingResults ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loadingResults ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

              <p className="mt-4 text-gray-500">
                Loading result notifications...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
              <FaTrophy size={38} className="mx-auto text-gray-400" />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No result notification published yet
              </h3>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {results.map((resultItem) => (
                <div
                  key={resultItem.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50/30 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        {resultItem.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          resultItem.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {resultItem.is_published ? "Published" : "Draft"}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatDate(resultItem.published_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-black text-gray-900">
                      {resultItem.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {resultItem.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={resultItem.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 font-bold text-white hover:bg-black"
                    >
                      Open Result
                      <FaExternalLinkAlt size={12} />
                    </a>

                    <button
                      type="button"
                      onClick={() => startEditing(resultItem)}
                      className="rounded-xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
                      aria-label={`Edit ${resultItem.title}`}
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(resultItem)}
                      disabled={deletingId === resultItem.id}
                      className="rounded-xl bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:text-gray-400"
                      aria-label={`Delete ${resultItem.title}`}
                    >
                      {deletingId === resultItem.id ? (
                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}