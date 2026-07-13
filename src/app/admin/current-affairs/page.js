"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaEdit,
  FaNewspaper,
  FaPlus,
  FaSave,
  FaStar,
  FaTrash,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

const categories = [
  "National",
  "International",
  "Economy",
  "Science & Technology",
  "Environment",
  "Sports",
  "Appointments",
  "Awards",
  "Government Schemes",
  "Defence",
  "Reports & Indexes",
  "Miscellaneous",
];

export default function CurrentAffairsAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("National");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

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
    await loadArticles();
  }

  async function loadArticles() {
    setLoadingArticles(true);

    const { data, error } = await supabase
      .from("current_affairs")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoadingArticles(false);
      return;
    }

    setArticles(data || []);
    setLoadingArticles(false);
  }

  function createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setContent("");
    setCategory("National");
    setTags("");
    setImageUrl("");
    setPublishedAt("");
    setIsFeatured(false);
    setIsPublished(true);
  }

  function startEditing(article) {
    setEditingId(article.id);
    setTitle(article.title || "");
    setSlug(article.slug || "");
    setSummary(article.summary || "");
    setContent(article.content || "");
    setCategory(article.category || "National");
    setTags(Array.isArray(article.tags) ? article.tags.join(", ") : "");
    setImageUrl(article.image_url || "");
    setPublishedAt(
      article.published_at
        ? new Date(article.published_at).toISOString().slice(0, 16)
        : ""
    );
    setIsFeatured(Boolean(article.is_featured));
    setIsPublished(Boolean(article.is_published));

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
        throw new Error("Please enter the article title.");
      }

      if (!summary.trim()) {
        throw new Error("Please enter the public summary.");
      }

      if (!content.trim()) {
        throw new Error("Please enter the complete premium article.");
      }

      const finalSlug = slug.trim() || createSlug(title);

      if (!finalSlug) {
        throw new Error("Unable to create the article slug.");
      }

      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        summary: summary.trim(),
        content: content.trim(),
        category,
        tags: tagList,
        image_url: imageUrl.trim() || null,
        is_featured: isFeatured,
        is_published: isPublished,
        published_at: publishedAt
          ? new Date(publishedAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingId) {
        const result = await supabase
          .from("current_affairs")
          .update(payload)
          .eq("id", editingId);

        error = result.error;
      } else {
        const result = await supabase
          .from("current_affairs")
          .insert([payload]);

        error = result.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        editingId
          ? "Current affairs article updated successfully."
          : "Current affairs article published successfully."
      );
      setMessageType("success");

      resetForm();
      await loadArticles();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the article."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Delete "${article.title}" permanently?`
    );

    if (!confirmed) return;

    setDeletingId(article.id);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("current_affairs")
      .delete()
      .eq("id", article.id);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setDeletingId(null);
      return;
    }

    setMessage("Current affairs article deleted successfully.");
    setMessageType("success");
    setDeletingId(null);

    if (editingId === article.id) {
      resetForm();
    }

    await loadArticles();
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
    () => articles.filter((article) => article.is_published).length,
    [articles]
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
                Current Affairs CMS
              </h1>

              <p className="mt-2 max-w-2xl text-gray-300">
                Publish public headlines and summaries while keeping the full
                article available only to premium subscribers.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Administrator: {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                <p className="text-2xl font-black">{articles.length}</p>
                <p className="text-xs text-gray-300">Total Articles</p>
              </div>

              <div className="rounded-2xl bg-red-600 px-5 py-4 text-center">
                <p className="text-2xl font-black">{publishedCount}</p>
                <p className="text-xs text-red-100">Published</p>
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
                  {editingId ? "Edit Article" : "Publish New Article"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Headline and summary are public. Full content is premium.
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
                htmlFor="title"
                className="mb-2 block font-bold text-gray-800"
              >
                Headline
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);

                  if (!editingId) {
                    setSlug(createSlug(event.target.value));
                  }
                }}
                placeholder="Enter the current affairs headline"
                required
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block font-bold text-gray-800"
              >
                Article URL Slug
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(createSlug(event.target.value))}
                placeholder="article-url-slug"
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block font-bold text-gray-800"
                >
                  Category
                </label>

                <select
                  id="category"
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
                htmlFor="summary"
                className="mb-2 block font-bold text-gray-800"
              >
                Public Summary
              </label>

              <textarea
                id="summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Write a short summary that all users can read..."
                rows={4}
                required
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />

              <p className="mt-2 text-sm text-gray-500">
                This text will be visible to non-premium users.
              </p>
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block font-bold text-gray-800"
              >
                Full Premium Article
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the complete current affairs explanation..."
                rows={14}
                required
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />

              <p className="mt-2 text-sm text-gray-500">
                This complete content will only be returned to premium users.
              </p>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="mb-2 block font-bold text-gray-800"
              >
                Tags
              </label>

              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="UPSC, SSC, Economy, RBI"
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />

              <p className="mt-2 text-sm text-gray-500">
                Separate tags using commas.
              </p>
            </div>

            <div>
              <label
                htmlFor="image-url"
                className="mb-2 block font-bold text-gray-800"
              >
                Image URL
              </label>

              <input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) =>
                    setIsFeatured(event.target.checked)
                  }
                  disabled={saving}
                  className="h-5 w-5 accent-red-600"
                />

                <div>
                  <p className="font-bold text-gray-900">Featured Article</p>
                  <p className="text-sm text-gray-500">
                    Highlight it on the homepage.
                  </p>
                </div>
              </label>

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
                  <p className="font-bold text-gray-900">Publish Article</p>
                  <p className="text-sm text-gray-500">
                    Turn off to save it as a draft.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving article...
                </>
              ) : editingId ? (
                <>
                  <FaSave />
                  Update Article
                </>
              ) : (
                <>
                  <FaPlus />
                  Publish Article
                </>
              )}
            </button>
          </form>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow sm:p-8">
            <h2 className="text-xl font-black text-gray-900">
              Access Structure
            </h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-black text-green-800">Free Users</h3>
                <p className="mt-2 text-sm leading-6 text-green-700">
                  Headline, category, publish date, image and public summary.
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-black text-red-800">
                  Premium Subscribers
                </h3>
                <p className="mt-2 text-sm leading-6 text-red-700">
                  Complete explanation, exam relevance, facts and detailed
                  analysis.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Published Content
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage current affairs articles and drafts.
              </p>
            </div>

            <button
              type="button"
              onClick={loadArticles}
              disabled={loadingArticles}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              {loadingArticles ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loadingArticles ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

              <p className="mt-4 text-gray-500">
                Loading current affairs...
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
              <FaNewspaper size={38} className="mx-auto text-gray-400" />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No article published yet
              </h3>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-3 py-4">Headline</th>
                    <th className="px-3 py-4">Category</th>
                    <th className="px-3 py-4">Date</th>
                    <th className="px-3 py-4">Featured</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="max-w-md px-3 py-5">
                        <p className="font-bold text-gray-900">
                          {article.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {article.summary}
                        </p>
                      </td>

                      <td className="px-3 py-5 text-gray-600">
                        {article.category}
                      </td>

                      <td className="px-3 py-5 text-gray-600">
                        {formatDate(article.published_at)}
                      </td>

                      <td className="px-3 py-5">
                        {article.is_featured ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-bold text-yellow-700">
                            <FaStar />
                            Featured
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                            article.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {article.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(article)}
                            className="rounded-lg bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
                            aria-label={`Edit ${article.title}`}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(article)}
                            disabled={deletingId === article.id}
                            className="rounded-lg bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:text-gray-400"
                            aria-label={`Delete ${article.title}`}
                          >
                            {deletingId === article.id ? (
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