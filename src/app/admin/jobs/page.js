"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
  FaEdit,
  FaExternalLinkAlt,
  FaPlus,
  FaSave,
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
  "Other",
];

export default function JobsAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

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

    await loadJobs();
  }

  async function loadJobs() {
    setLoadingJobs(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoadingJobs(false);
      return;
    }

    setJobs(data || []);
    setLoadingJobs(false);
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

  function startEditing(job) {
    setEditingId(job.id);
    setTitle(job.title || "");
    setDescription(job.description || "");
    setCategory(job.category || "SSC");
    setOfficialLink(job.official_link || "");
    setPublishedAt(
      job.published_at
        ? new Date(job.published_at).toISOString().slice(0, 16)
        : ""
    );
    setIsPublished(Boolean(job.is_published));

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
        throw new Error("Please enter the exam or recruitment title.");
      }

      if (!description.trim()) {
        throw new Error("Please enter a one-line description.");
      }

      if (!officialLink.trim()) {
        throw new Error("Please enter the official link.");
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
        const result = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", editingId);

        error = result.error;
      } else {
        const result = await supabase
          .from("jobs")
          .insert([payload]);

        error = result.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        editingId
          ? "Job notification updated successfully."
          : isPublished
            ? "Job notification published successfully."
            : "Job notification saved as a draft."
      );

      setMessageType("success");
      resetForm();

      await loadJobs();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the job notification."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(job) {
    const confirmed = window.confirm(
      `Delete "${job.title}" permanently?`
    );

    if (!confirmed) return;

    setDeletingId(job.id);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setDeletingId(null);
      return;
    }

    if (editingId === job.id) {
      resetForm();
    }

    setMessage("Job notification deleted successfully.");
    setMessageType("success");
    setDeletingId(null);

    await loadJobs();
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
                Job Notifications CMS
              </h1>

              <p className="mt-2 max-w-2xl text-gray-300">
                Publish short government-exam notifications with one-line
                information and an official external link.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Administrator: {user?.email}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600">
              <FaBriefcase size={30} />
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
                    ? "Edit Notification"
                    : "Publish Job Notification"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Keep the description short and link only to an official
                  source.
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
                htmlFor="job-title"
                className="mb-2 block font-bold text-gray-800"
              >
                Exam or Recruitment Title
              </label>

              <input
                id="job-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="SSC CGL 2026 Notification"
                disabled={saving}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="job-description"
                className="mb-2 block font-bold text-gray-800"
              >
                One-Line Information
              </label>

              <input
                id="job-description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Online applications are open for SSC CGL 2026."
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
                  htmlFor="job-category"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Category
                </label>

                <select
                  id="job-category"
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
                  htmlFor="published-at"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Publish Date and Time
                </label>

                <input
                  id="published-at"
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
                htmlFor="official-link"
                className="mb-2 block font-bold text-gray-800"
              >
                Official Link
              </label>

              <input
                id="official-link"
                type="url"
                value={officialLink}
                onChange={(event) => setOfficialLink(event.target.value)}
                placeholder="https://official-website.gov.in/notification"
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
                  Publish Notification
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
                  Saving notification...
                </>
              ) : editingId ? (
                <>
                  <FaSave />
                  Update Notification
                </>
              ) : (
                <>
                  <FaPlus />
                  Publish Notification
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
                "Use the official recruitment or examination title.",
                "Write only one short line about the notification.",
                "Verify that the link belongs to an official source.",
                "Avoid copying the complete notification.",
                "Open the link once after publishing.",
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
                Job Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage published notifications and drafts.
              </p>
            </div>

            <button
              type="button"
              onClick={loadJobs}
              disabled={loadingJobs}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              {loadingJobs ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loadingJobs ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

              <p className="mt-4 text-gray-500">
                Loading notifications...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
              <FaBriefcase size={38} className="mx-auto text-gray-400" />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No job notification published yet
              </h3>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5 hover:border-red-200 hover:bg-red-50/30 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        {job.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          job.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {job.is_published ? "Published" : "Draft"}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatDate(job.published_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-black text-gray-900">
                      {job.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={job.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 font-bold text-white hover:bg-black"
                    >
                      Open Link
                      <FaExternalLinkAlt size={12} />
                    </a>

                    <button
                      type="button"
                      onClick={() => startEditing(job)}
                      className="rounded-xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
                      aria-label={`Edit ${job.title}`}
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(job)}
                      disabled={deletingId === job.id}
                      className="rounded-xl bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:text-gray-400"
                      aria-label={`Delete ${job.title}`}
                    >
                      {deletingId === job.id ? (
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