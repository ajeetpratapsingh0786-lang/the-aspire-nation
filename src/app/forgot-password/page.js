"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event) {
    event.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (error) {
        throw error;
      }

      setMessage(
        "Password reset email sent. Open the latest email and click its link."
      );
    } catch (error) {
      setMessage(error?.message || "Could not send the reset email.");
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
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            We will send a secure password recovery link to your email.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5 p-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-700 px-5 py-3.5 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {message && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}