"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      console.log("Login data:", data);
      console.log("Login error:", error);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data?.session || !data?.user) {
        setMessage("Login failed because no session was created.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage("Login successful.");

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

      const loggedInEmail = data.user.email?.trim().toLowerCase();

      if (adminEmail && loggedInEmail === adminEmail) {
        window.location.href = "/admin";
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while logging in."
      );

      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-gray-950 px-8 py-8 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">
            The Aspire Nation
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Login
          </h1>

          <p className="mt-2 text-sm text-gray-300">
            Access your account and premium content.
          </p>
        </div>

        <div className="p-7 sm:p-8">
          {message && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                success
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700"
              >
                Password
              </label>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-gray-900 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 hover:text-red-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-5 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-red-600 hover:text-red-700"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}