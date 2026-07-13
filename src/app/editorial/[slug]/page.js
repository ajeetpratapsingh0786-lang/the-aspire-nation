"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCrown,
  FaExclamationTriangle,
  FaLock,
  FaPenNib,
  FaStar,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

export default function EditorialDetailPage() {
  const params = useParams();

  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const [editorial, setEditorial] =
    useState(null);

  const [isPremium, setIsPremium] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadEditorial() {
      if (!slug) {
        setErrorMessage(
          "Invalid editorial address."
        );
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const headers = {
          "Content-Type": "application/json",
        };

        if (session?.access_token) {
          headers.Authorization =
            `Bearer ${session.access_token}`;
        }

        const response = await fetch(
          "/api/editorial/premium",
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              slug,
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
            "The editorial service returned an invalid response."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Unable to load editorial."
          );
        }

        setEditorial(result.editorial);
        setIsPremium(
          Boolean(result.premium)
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load editorial."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEditorial();
  }, [slug]);

  function formatDate(value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />

          <p className="mt-4 font-semibold text-gray-600">
            Opening editorial...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !editorial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-3xl bg-white p-9 text-center shadow-xl">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-600" />

          <h1 className="mt-6 text-3xl font-black">
            Unable to Open Editorial
          </h1>

          <p className="mt-4 text-gray-600">
            {errorMessage}
          </p>

          <Link
            href="/editorial"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white"
          >
            <FaArrowLeft />
            Return to Editorials
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <article>
        <header className="bg-gray-950 px-4 py-12 text-white sm:px-6">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/editorial"
              className="inline-flex items-center gap-2 font-bold text-red-400 hover:text-red-300"
            >
              <FaArrowLeft />
              All Editorials
            </Link>

            <div className="mt-8 flex flex-wrap gap-3">
              {editorial.is_featured && (
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-black text-gray-950">
                  <FaStar />
                  Featured
                </span>
              )}

              <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-black">
                {editorial.category}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold">
                <FaCalendarAlt />
                {formatDate(
                  editorial.published_at
                )}
              </span>
            </div>

            <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">
              {editorial.title}
            </h1>

            <p className="mt-6 text-xl leading-9 text-gray-300">
              {editorial.summary}
            </p>
          </div>
        </header>

        {editorial.image_url && (
          <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
            <img
              src={editorial.image_url}
              alt={editorial.title}
              className="max-h-[520px] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        )}

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          {isPremium && editorial.content ? (
            <section className="rounded-3xl bg-white p-7 shadow sm:p-10">
              <div className="mb-7 flex items-center gap-3 border-b border-gray-200 pb-6">
                <div className="rounded-xl bg-red-100 p-3">
                  <FaPenNib className="text-xl text-red-700" />
                </div>

                <div>
                  <p className="font-black text-gray-950">
                    Complete Premium Analysis
                  </p>

                  <p className="text-sm text-gray-500">
                    Available with your active membership
                  </p>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-lg leading-9 text-gray-800">
                {editorial.content}
              </div>

              {Array.isArray(editorial.tags) &&
                editorial.tags.length > 0 && (
                  <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-200 pt-6">
                    {editorial.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
            </section>
          ) : (
            <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="p-7 sm:p-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <FaLock className="text-3xl text-red-700" />
                </div>

                <div className="mx-auto mt-6 max-w-2xl text-center">
                  <p className="font-black uppercase tracking-widest text-red-700">
                    Premium Editorial
                  </p>

                  <h2 className="mt-3 text-3xl font-black text-gray-950">
                    Unlock the Complete Analysis
                  </h2>

                  <p className="mt-4 text-lg leading-8 text-gray-600">
                    Subscribe to access the full editorial,
                    arguments, examination relevance and
                    complete premium archive.
                  </p>

                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/subscribe"
                      className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-7 py-3.5 font-black text-white hover:bg-red-800"
                    >
                      <FaCrown />
                      Become Premium
                    </Link>

                    <Link
                      href="/login"
                      className="rounded-xl border border-gray-300 px-7 py-3.5 font-black text-gray-800 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}