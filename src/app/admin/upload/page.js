"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaFilePdf,
  FaImage,
  FaNewspaper,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";
import {
  getNewspapers,
  createNewspaper,
  deleteNewspaper,
} from "@/lib/newspaper";

const MAX_PDF_SIZE = 25 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function NewspaperAdminPage() {
  const router = useRouter();

  const pdfInputRef = useRef(null);
  const previewInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [title, setTitle] = useState("");
  const [editionDate, setEditionDate] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPublished, setIsPublished] = useState(true);

  const [newspapers, setNewspapers] = useState([]);
  const [loadingEditions, setLoadingEditions] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadNewspapers = useCallback(async () => {
    setLoadingEditions(true);

    const { data, error } = await getNewspapers();

    if (error) {
      setMessage(error.message || "Unable to load newspaper editions.");
      setMessageType("error");
      setLoadingEditions(false);
      return;
    }

    setNewspapers(data || []);
    setLoadingEditions(false);
  }, []);

  useEffect(() => {
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

      await loadNewspapers();
    }

    initialisePage();
  }, [loadNewspapers, router]);

  function cleanFileName(fileName) {
    return fileName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "");
  }

  function createStoragePath(file, folder) {
    const safeName = cleanFileName(file.name);

    const uniqueId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `${folder}/${editionDate}/${uniqueId}-${safeName}`;
  }

  async function uploadFile(bucket, folder, file, makePublic = false) {
    const filePath = createStoragePath(file, folder);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Unable to upload ${file.name}: ${uploadError.message}`
      );
    }

    let publicUrl = null;

    if (makePublic) {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      publicUrl = data?.publicUrl || null;
    }

    return {
      filePath,
      publicUrl,
    };
  }

  async function removeUploadedFile(bucket, filePath) {
    if (!filePath) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error(`Unable to remove ${filePath}:`, error.message);
    }
  }

  function validateFiles() {
    if (!title.trim()) {
      throw new Error("Please enter the edition title.");
    }

    if (!editionDate) {
      throw new Error("Please select the edition date.");
    }

    if (!pdfFile) {
      throw new Error("Please select the complete newspaper PDF.");
    }

    if (!previewFile) {
      throw new Error("Please select the Page 1 preview image.");
    }

    if (pdfFile.type !== "application/pdf") {
      throw new Error("The newspaper file must be a PDF.");
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      throw new Error("The PDF must be smaller than 25 MB.");
    }

    if (!previewFile.type.startsWith("image/")) {
      throw new Error("The preview file must be an image.");
    }

    if (previewFile.size > MAX_IMAGE_SIZE) {
      throw new Error("The preview image must be smaller than 5 MB.");
    }
  }

  function resetForm() {
    setTitle("");
    setEditionDate("");
    setPdfFile(null);
    setPreviewFile(null);
    setIsPublished(true);

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }

    if (previewInputRef.current) {
      previewInputRef.current.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setUploading(true);
    setMessage("");
    setMessageType("");

    let uploadedPdfPath = "";
    let uploadedPreviewPath = "";

    try {
      validateFiles();

      const existingEdition = newspapers.some(
        (paper) => paper.edition_date === editionDate
      );

      if (existingEdition) {
        const continueUpload = window.confirm(
          "An edition already exists for this date. Do you still want to upload another edition?"
        );

        if (!continueUpload) {
          return;
        }
      }

      const pdfUpload = await uploadFile(
        "newspapers",
        "pdf",
        pdfFile,
        false
      );

      uploadedPdfPath = pdfUpload.filePath;

      const previewUpload = await uploadFile(
        "previews",
        "page-1",
        previewFile,
        true
      );

      uploadedPreviewPath = previewUpload.filePath;

      const { error } = await createNewspaper({
        title: title.trim(),
        edition_date: editionDate,
        pdf_path: pdfUpload.filePath,
        pdf_url: null,
        preview_url: previewUpload.publicUrl,
        is_published: isPublished,
      });

      if (error) {
        throw new Error(error.message);
      }

      resetForm();

      setMessage(
        isPublished
          ? "Newspaper uploaded and published successfully."
          : "Newspaper uploaded and saved as a draft."
      );

      setMessageType("success");

      await loadNewspapers();
    } catch (error) {
      await removeUploadedFile("newspapers", uploadedPdfPath);
      await removeUploadedFile("previews", uploadedPreviewPath);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the newspaper."
      );

      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(paper) {
    const confirmed = window.confirm(
      `Delete "${paper.title}" from the newspaper list?`
    );

    if (!confirmed) return;

    setDeletingId(paper.id);
    setMessage("");
    setMessageType("");

    try {
      const { error } = await deleteNewspaper(paper.id);

      if (error) {
        throw new Error(error.message);
      }

      if (paper.pdf_path) {
        await removeUploadedFile("newspapers", paper.pdf_path);
      }

      setMessage("Newspaper deleted successfully.");
      setMessageType("success");

      await loadNewspapers();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete the newspaper."
      );

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date) {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatFileSize(size) {
    if (!size) return "";

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300"
              >
                <FaArrowLeft />
                Back to Admin Dashboard
              </Link>

              <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                Newspaper Management
              </h1>

              <p className="mt-2 text-gray-300">
                Upload the private PDF and public Page 1 preview.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Logged in as: {user?.email}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600">
              <FaNewspaper size={30} />
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

        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl bg-white p-6 shadow lg:col-span-2 sm:p-8"
          >
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Publish New Edition
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The complete PDF will remain private. Only the Page 1 preview
                will be public.
              </p>
            </div>

            <div>
              <label
                htmlFor="edition-title"
                className="mb-2 block font-bold text-gray-800"
              >
                Edition Title
              </label>

              <input
                id="edition-title"
                type="text"
                placeholder="The Aspire Nation – Daily Edition"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={uploading}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="edition-date"
                className="mb-2 block font-bold text-gray-800"
              >
                Edition Date
              </label>

              <input
                id="edition-date"
                type="date"
                value={editionDate}
                onChange={(event) => setEditionDate(event.target.value)}
                disabled={uploading}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="newspaper-pdf"
                className="mb-2 block font-bold text-gray-800"
              >
                Complete Newspaper PDF
              </label>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-7 text-center hover:border-red-300 hover:bg-red-50">
                <FaFilePdf size={42} className="mx-auto text-red-600" />

                <p className="mt-3 font-bold text-gray-900">
                  Select the complete 8-page PDF
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Private file · PDF only · Maximum 25 MB
                </p>

                <input
                  ref={pdfInputRef}
                  id="newspaper-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={uploading}
                  onChange={(event) =>
                    setPdfFile(event.target.files?.[0] || null)
                  }
                  className="mt-4 block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-red-700"
                />

                {pdfFile && (
                  <div className="mt-4 rounded-xl bg-white px-4 py-3 text-left shadow-sm">
                    <p className="break-all text-sm font-bold text-gray-800">
                      {pdfFile.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatFileSize(pdfFile.size)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="preview-image"
                className="mb-2 block font-bold text-gray-800"
              >
                Page 1 Preview Image
              </label>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-7 text-center hover:border-red-300 hover:bg-red-50">
                <FaImage size={42} className="mx-auto text-red-600" />

                <p className="mt-3 font-bold text-gray-900">
                  Select the Page 1 image
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Public preview · JPG, PNG or WebP · Maximum 5 MB
                </p>

                <input
                  ref={previewInputRef}
                  id="preview-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(event) =>
                    setPreviewFile(event.target.files?.[0] || null)
                  }
                  className="mt-4 block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-red-700"
                />

                {previewFile && (
                  <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
                    <img
                      src={URL.createObjectURL(previewFile)}
                      alt="Selected Page 1 preview"
                      className="mx-auto max-h-72 rounded-lg object-contain"
                    />

                    <p className="mt-3 break-all text-sm font-bold text-gray-800">
                      {previewFile.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatFileSize(previewFile.size)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(event.target.checked)
                }
                disabled={uploading}
                className="h-5 w-5 accent-red-600"
              />

              <div>
                <p className="font-bold text-gray-900">
                  Publish immediately
                </p>

                <p className="text-sm text-gray-500">
                  Turn this off to save the edition as a draft.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {uploading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Uploading and saving...
                </>
              ) : (
                <>
                  <FaUpload />
                  {isPublished ? "Upload & Publish" : "Upload as Draft"}
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
                "Use the final proofread 8-page PDF.",
                "Upload a clear Page 1 preview image.",
                "Check the title and edition date.",
                "The PDF bucket must remain private.",
                "The previews bucket must remain public.",
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
        </div>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Uploaded Editions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {newspapers.length} edition
                {newspapers.length === 1 ? "" : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={loadNewspapers}
              disabled={loadingEditions}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              {loadingEditions ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loadingEditions ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

              <p className="mt-4 text-gray-500">
                Loading newspaper editions...
              </p>
            </div>
          ) : newspapers.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
              <FaNewspaper size={38} className="mx-auto text-gray-400" />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No newspaper uploaded yet
              </h3>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-3 py-4">Title</th>
                    <th className="px-3 py-4">Edition Date</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Preview</th>
                    <th className="px-3 py-4">PDF Security</th>
                    <th className="px-3 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {newspapers.map((paper) => (
                    <tr
                      key={paper.id}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="px-3 py-5 font-bold text-gray-900">
                        {paper.title}
                      </td>

                      <td className="px-3 py-5 text-gray-600">
                        {formatDate(paper.edition_date)}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                            paper.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {paper.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        {paper.preview_url ? (
                          <a
                            href={paper.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-bold text-red-600 hover:text-red-700"
                          >
                            View
                            <FaExternalLinkAlt size={12} />
                          </a>
                        ) : (
                          <span className="text-gray-400">Unavailable</span>
                        )}
                      </td>

                      <td className="px-3 py-5">
                        {paper.pdf_path ? (
                          <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-700">
                            Private
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-bold text-yellow-700">
                            Legacy URL
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(paper)}
                          disabled={deletingId === paper.id}
                          className="rounded-lg bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:text-gray-400"
                        >
                          {deletingId === paper.id ? (
                            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
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