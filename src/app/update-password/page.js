"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(
    "Checking your password recovery link..."
  );
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setSessionReady(true);
        setMessage("");
      } else {
        setMessage(
          "This password recovery link is invalid or has expired. Please request a new reset email."
        );
      }
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || session) {
        setSessionReady(true);
        setMessage("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword(event) {
    event.preventDefault();
    setMessage("");

    if (!sessionReady) {
      setMessage(
        "No valid recovery session was found. Please request a new password reset email."
      );
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setMessage("Password updated successfully. Redirecting to login...");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error?.message ||
          "The password could not be updated. Please request a new reset link."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-slate-950 px-8 py-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            The Aspire Nation
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Create New Password
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Enter a secure new password for your account.
          </p>
        </div>

        <form
          onSubmit={handleUpdatePassword}
          className="space-y-5 p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              disabled={!sessionReady || loading}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-slate-700 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Enter the password again"
              autoComplete="new-password"
              disabled={!sessionReady || loading}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-slate-700 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={!sessionReady || loading}
            className="w-full rounded-xl bg-red-700 px-5 py-3.5 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

          {message && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}