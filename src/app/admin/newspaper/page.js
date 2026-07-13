"use client";

import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaEdit,
  FaExternalLinkAlt,
  FaFilePdf,
  FaImage,
  FaNewspaper,
  FaSave,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

function cleanFileName(fileName) {
  return fileName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

function extractStoragePath(publicUrl, bucketName) {
  if (!publicUrl) return "";

  const publicMarker =
    `/storage/v1/object/public/${bucketName}/`;

  const signedMarker =
    `/storage/v1/object/sign/${bucketName}/`;

  if (publicUrl.includes(publicMarker)) {
    return decodeURIComponent(
      publicUrl.split(publicMarker)[1].split("?")[0]
    );
  }

  if (publicUrl.includes(signedMarker)) {
    return decodeURIComponent(
      publicUrl.split(signedMarker)[1].split("?")[0]
    );
  }

  return "";
}

export default function NewspaperAdminPage() {
  const [newspapers, setNewspapers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [editionDate, setEditionDate] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPublished, setIsPublished] = useState(true);

  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [existingPdfPath, setExistingPdfPath] = useState("");
  const [existingPreviewUrl, setExistingPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadNewspapers();
  }, []);

  async function loadNewspapers() {
    setLoadingList(true);

    const { data, error } = await supabase
      .from("newspapers")
      .select("*")
      .order("edition_date", {
        ascending: false,
      });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoadingList(false);
      return;
    }

    setNewspapers(data || []);
    setLoadingList(false);
  }

  async function uploadPdf(file) {
    const safeName = cleanFileName(file.name);

    const storagePath =
      `pdf/${Date.now()}-${safeName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("newspapers")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: "application/pdf",
          upsert: false,
        });

    if (uploadError) {
      throw new Error(
        `PDF upload failed: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("newspapers")
        .getPublicUrl(storagePath);

    return {
      pdfUrl: publicUrlData.publicUrl,
      pdfPath: storagePath,
    };
  }

  async function uploadPreview(file) {
    const safeName = cleanFileName(file.name);

    const storagePath =
      `previews/${Date.now()}-${safeName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("previews")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      throw new Error(
        `Preview upload failed: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("previews")
        .getPublicUrl(storagePath);

    return {
      previewUrl: publicUrlData.publicUrl,
      previewPath: storagePath,
    };
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setEditionDate("");
    setPdfFile(null);
    setPreviewFile(null);
    setIsPublished(true);

    setExistingPdfUrl("");
    setExistingPdfPath("");
    setExistingPreviewUrl("");

    const pdfInput =
      document.getElementById("newspaper-pdf");

    const previewInput =
      document.getElementById("newspaper-preview");

    if (pdfInput) pdfInput.value = "";
    if (previewInput) previewInput.value = "";
  }

  function startEditing(paper) {
    setEditingId(paper.id);
    setTitle(paper.title || "");
    setEditionDate(paper.edition_date || "");
    setIsPublished(Boolean(paper.is_published));

    setExistingPdfUrl(paper.pdf_url || "");

    setExistingPdfPath(
      paper.pdf_path ||
        extractStoragePath(
          paper.pdf_url,
          "newspapers"
        )
    );

    setExistingPreviewUrl(
      paper.preview_url || ""
    );

    setPdfFile(null);
    setPreviewFile(null);

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
        throw new Error(
          "Please enter the newspaper title."
        );
      }

      if (!editionDate) {
        throw new Error(
          "Please select the edition date."
        );
      }

      if (!editingId && !pdfFile) {
        throw new Error(
          "Please upload the complete newspaper PDF."
        );
      }

      if (!editingId && !previewFile) {
        throw new Error(
          "Please upload the Page 1 preview image."
        );
      }

      let pdfUrl = existingPdfUrl;
      let pdfPath = existingPdfPath;
      let previewUrl = existingPreviewUrl;

      if (pdfFile) {
        const uploadedPdf =
          await uploadPdf(pdfFile);

        pdfUrl = uploadedPdf.pdfUrl;
        pdfPath = uploadedPdf.pdfPath;
      }

      if (previewFile) {
        const uploadedPreview =
          await uploadPreview(previewFile);

        previewUrl =
          uploadedPreview.previewUrl;
      }

      if (!pdfPath && pdfUrl) {
        pdfPath = extractStoragePath(
          pdfUrl,
          "newspapers"
        );
      }

      if (!pdfPath) {
        throw new Error(
          "The PDF was uploaded, but its secure storage path could not be determined."
        );
      }

      const payload = {
        title: title.trim(),
        edition_date: editionDate,
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
        preview_url: previewUrl,
        is_published: isPublished,
      };

      let databaseError;

      if (editingId) {
        const response = await supabase
          .from("newspapers")
          .update(payload)
          .eq("id", editingId);

        databaseError = response.error;
      } else {
        const response = await supabase
          .from("newspapers")
          .insert([payload]);

        databaseError = response.error;
      }

      if (databaseError) {
        throw new Error(
          databaseError.message
        );
      }

      setMessage(
        editingId
          ? "Newspaper updated successfully."
          : "Newspaper uploaded successfully."
      );

      setMessageType("success");

      resetForm();
      await loadNewspapers();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the newspaper."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(paper) {
    const confirmed = window.confirm(
      `Delete "${paper.title}" permanently?`
    );

    if (!confirmed) return;

    setDeletingId(paper.id);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("newspapers")
      .delete()
      .eq("id", paper.id);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setDeletingId(null);
      return;
    }

    setMessage(
      "Newspaper record deleted successfully."
    );

    setMessageType("success");
    setDeletingId(null);

    if (editingId === paper.id) {
      resetForm();
    }

    await loadNewspapers();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl bg-gray-950 p-7 text-white shadow-xl sm:p-9">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-red-400">
                The Aspire Nation CMS
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Newspaper Management
              </h1>

              <p className="mt-3 max-w-2xl text-gray-300">
                Upload the complete PDF and Page 1
                preview. The secure storage path is now
                saved automatically.
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

        <section className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl bg-white p-6 shadow lg:col-span-2 sm:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  {editingId
                    ? "Edit Newspaper"
                    : "Publish New Edition"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  New PDFs will be stored in the
                  `pdf` folder automatically.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-4 py-2 font-bold"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <div>
              <label className="mb-2 block font-bold">
                Edition Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="The Aspire Nation - Daily Edition"
                disabled={saving}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">
                Edition Date
              </label>

              <input
                type="date"
                value={editionDate}
                onChange={(event) =>
                  setEditionDate(event.target.value)
                }
                disabled={saving}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">
                Complete Newspaper PDF
              </label>

              <div className="rounded-2xl border-2 border-dashed bg-gray-50 p-7 text-center">
                <FaFilePdf
                  size={42}
                  className="mx-auto text-red-600"
                />

                <input
                  id="newspaper-pdf"
                  type="file"
                  accept="application/pdf"
                  disabled={saving}
                  onChange={(event) =>
                    setPdfFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  className="mt-4"
                />

                {editingId &&
                  existingPdfPath && (
                    <p className="mt-3 break-all text-sm text-green-700">
                      Current secure path:{" "}
                      {existingPdfPath}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-bold">
                Page 1 Preview Image
              </label>

              <div className="rounded-2xl border-2 border-dashed bg-gray-50 p-7 text-center">
                <FaImage
                  size={42}
                  className="mx-auto text-red-600"
                />

                <input
                  id="newspaper-preview"
                  type="file"
                  accept="image/*"
                  disabled={saving}
                  onChange={(event) =>
                    setPreviewFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  className="mt-4"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(
                    event.target.checked
                  )
                }
                disabled={saving}
                className="h-5 w-5 accent-red-600"
              />

              <div>
                <p className="font-bold">
                  Publish immediately
                </p>

                <p className="text-sm text-gray-500">
                  Turn off to save it as a draft.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-black text-white hover:bg-red-700 disabled:bg-gray-400"
            >
              {saving ? (
                "Saving newspaper..."
              ) : editingId ? (
                <>
                  <FaSave />
                  Update Newspaper
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload and Publish
                </>
              )}
            </button>
          </form>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow sm:p-8">
            <h2 className="text-xl font-black">
              Secure Upload Checklist
            </h2>

            <div className="mt-6 space-y-4">
              {[
                "Upload the complete PDF.",
                "Upload Page 1 as an image.",
                "Check the edition date.",
                "The PDF path is stored automatically.",
                "Premium readers receive a temporary signed URL.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3"
                >
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
          <h2 className="text-2xl font-black">
            Uploaded Editions
          </h2>

          {loadingList ? (
            <p className="py-10 text-center text-gray-500">
              Loading editions...
            </p>
          ) : newspapers.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              No newspaper uploaded yet.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-3 py-4">
                      Title
                    </th>
                    <th className="px-3 py-4">
                      Date
                    </th>
                    <th className="px-3 py-4">
                      Secure Path
                    </th>
                    <th className="px-3 py-4">
                      Status
                    </th>
                    <th className="px-3 py-4">
                      Files
                    </th>
                    <th className="px-3 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {newspapers.map((paper) => {
                    const securePath =
                      paper.pdf_path ||
                      extractStoragePath(
                        paper.pdf_url,
                        "newspapers"
                      );

                    return (
                      <tr
                        key={paper.id}
                        className="border-b"
                      >
                        <td className="px-3 py-5 font-bold">
                          {paper.title}
                        </td>

                        <td className="px-3 py-5">
                          {paper.edition_date}
                        </td>

                        <td className="max-w-xs break-all px-3 py-5 text-sm">
                          {securePath || (
                            <span className="font-bold text-red-600">
                              Missing
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                              paper.is_published
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {paper.is_published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        <td className="px-3 py-5">
                          <div className="flex gap-3">
                            {paper.preview_url && (
                              <a
                                href={
                                  paper.preview_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-700"
                              >
                                Preview
                              </a>
                            )}

                            {paper.pdf_url && (
                              <a
                                href={paper.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-gray-700"
                              >
                                PDF
                                <FaExternalLinkAlt
                                  size={11}
                                />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-5">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startEditing(paper)
                              }
                              className="rounded-lg bg-blue-50 p-3 text-blue-600"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(paper)
                              }
                              disabled={
                                deletingId === paper.id
                              }
                              className="rounded-lg bg-red-50 p-3 text-red-600"
                            >
                              {deletingId ===
                              paper.id ? (
                                "..."
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}