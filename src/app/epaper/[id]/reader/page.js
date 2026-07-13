"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

export default function NewspaperReaderPage() {
  const params = useParams();
  const router = useRouter();

  const paperId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [signedUrl, setSignedUrl] =
    useState("");

  const [paperTitle, setPaperTitle] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function openSecureReader() {
      if (!paperId) {
        setErrorMessage(
          "Invalid newspaper address."
        );

        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (
          sessionError ||
          !session?.access_token
        ) {
          router.replace(
            `/login?redirect=/epaper/${paperId}/reader`
          );

          return;
        }

        const response = await fetch(
          "/api/epaper/signed-url",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              paperId,
            }),
            cache: "no-store",
          }
        );

        const responseText =
          await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The secure-reader API returned an invalid response."
          );
        }

        if (!response.ok) {
          if (response.status === 401) {
            router.replace(
              `/login?redirect=/epaper/${paperId}/reader`
            );

            return;
          }

          if (response.status === 403) {
            router.replace("/subscribe");
            return;
          }

          throw new Error(
            result?.error ||
              "Unable to open newspaper."
          );
        }

        if (!result?.signedUrl) {
          throw new Error(
            "The secure PDF link was not returned."
          );
        }

        setSignedUrl(result.signedUrl);

        setPaperTitle(
          result.paper?.title ||
            "The Aspire Nation"
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to open newspaper."
        );
      } finally {
        setLoading(false);
      }
    }

    openSecureReader();
  }, [paperId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-300">
            Opening secure newspaper...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !signedUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-3xl bg-white p-9 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>

          <h1 className="mt-7 text-3xl font-black">
            Unable to Open Newspaper
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            {errorMessage}
          </p>

          <Link
            href="/epaper"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 font-black text-white"
          >
            <FaArrowLeft />
            Return to E-Paper
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gray-950 text-white"
      onContextMenu={(event) =>
        event.preventDefault()
      }
    >
      <header className="flex flex-col gap-3 border-b border-gray-800 bg-gray-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black">
            {paperTitle}
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Secure Premium Reader
          </p>
        </div>

        <Link
          href={`/epaper/${paperId}`}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-bold"
        >
          <FaArrowLeft />
          Back
        </Link>
      </header>

      <div className="h-[calc(100vh-88px)]">
        <iframe
          src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={paperTitle}
          className="h-full w-full bg-white"
          allow="fullscreen"
        />
      </div>
    </main>
  );
}