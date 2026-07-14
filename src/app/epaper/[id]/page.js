"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaLock,
  FaNewspaper,
} from "react-icons/fa";

import PremiumGuard from "@/components/auth/PremiumGuard";
import { supabase } from "@/lib/supabaseClient";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();

  const paperId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [paper, setPaper] = useState(null);
  const [user, setUser] = useState(null);
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function openSecureReader() {
      if (!paperId) {
        setErrorMessage("Invalid newspaper edition.");
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user || !session?.access_token) {
          router.replace("/login");
          return;
        }

        setUser(session.user);

        const response = await fetch("/api/epaper/signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            paperId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }

          if (response.status === 403) {
            router.replace("/subscribe");
            return;
          }

          throw new Error(
            result?.error || "Unable to open the secure newspaper."
          );
        }

        if (!result?.signedUrl || !result?.paper) {
          throw new Error("The secure PDF link was not created.");
        }

        setSignedUrl(result.signedUrl);
        setPaper(result.paper);
      } catch (error) {
        console.error("Secure reader error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to open the newspaper."
        );
      } finally {
        setLoading(false);
      }
    }

    openSecureReader();
  }, [paperId, router]);

  useEffect(() => {
    function preventRestrictedActions(event) {
      const key = event.key.toLowerCase();

      if (
        (event.ctrlKey || event.metaKey) &&
        ["s", "p", "u"].includes(key)
      ) {
        event.preventDefault();
      }

      if (
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(key))
      ) {
        event.preventDefault();
      }
    }

    function preventContextMenu(event) {
      event.preventDefault();
    }

    function preventDrag(event) {
      event.preventDefault();
    }

    document.addEventListener("keydown", preventRestrictedActions);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("dragstart", preventDrag);

    return () => {
      document.removeEventListener("keydown", preventRestrictedActions);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, []);

  function formatDate(date) {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <PremiumGuard>
      {loading ? (
        <main className="flex min-h-screen items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-red-600" />

            <p className="mt-4 font-semibold text-gray-300">
              Creating secure newspaper access...
            </p>
          </div>
        </main>
      ) : errorMessage || !paper || !signedUrl ? (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <FaExclamationTriangle className="text-2xl text-red-600" />
            </div>

            <h1 className="mt-6 text-3xl font-black text-gray-900">
              Unable to Open Newspaper
            </h1>

            <p className="mt-3 text-gray-600">
              {errorMessage || "Secure newspaper access was not created."}
            </p>

            <Link
              href="/epaper"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <FaArrowLeft />
              Return to E-Paper
            </Link>
          </div>
        </main>
      ) : (
        <main
          className="min-h-screen select-none bg-gray-950 text-white"
          onContextMenu={(event) => event.preventDefault()}
        >
          <header className="border-b border-gray-800 bg-gray-900 px-4 py-4 shadow-lg sm:px-6">
            <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600">
                  <FaNewspaper size={22} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                    Secure Premium E-Paper
                  </p>

                  <h1 className="mt-1 text-lg font-black sm:text-xl">
                    {paper.title}
                  </h1>

                  <p className="mt-1 text-sm text-gray-400">
                    {formatDate(paper.edition_date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-green-700 bg-green-950/60 px-4 py-2 text-sm font-semibold text-green-300 md:flex">
                  <FaLock />
                  Temporary Secure Access
                </div>

                <Link
                  href="/epaper"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white transition hover:bg-red-700"
                >
                  <FaArrowLeft />
                  Back
                </Link>
              </div>
            </div>
          </header>

          <section className="relative h-[calc(100vh-104px)] overflow-hidden bg-gray-800">
            <iframe
              src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              title={paper.title}
              className="h-full w-full bg-white"
            />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 gap-24 opacity-[0.07] sm:grid-cols-3">
                {Array.from({ length: 18 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex -rotate-12 items-center justify-center whitespace-nowrap text-xs font-black uppercase tracking-widest text-gray-950 sm:text-sm"
                  >
                    {user?.email || "The Aspire Nation"}
                  </div>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-1/2 w-[92%] max-w-2xl -translate-x-1/2 rounded-xl border border-white/10 bg-gray-950/80 px-4 py-2 text-center text-xs text-gray-300 backdrop-blur">
              This secure edition is licensed to{" "}
              <span className="font-bold text-white">
                {user?.email || "the logged-in subscriber"}
              </span>
              . The temporary viewing link expires automatically.
            </div>
          </section>
        </main>
      )}
    </PremiumGuard>
  );
}