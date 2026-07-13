"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function PremiumGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremium();
  }, []);

  async function checkPremium() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setIsPremium(false);
      return;
    }

    const { data } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expiry_date", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setIsPremium(true);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-red-600 animate-spin"></div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="max-w-xl bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="text-6xl mb-6">🔒</div>

          <h1 className="text-4xl font-black text-red-700">
            Premium Access Required
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            This content is available only for Aspire Nation Premium members.
          </p>

          <Link
            href="/subscribe"
            className="inline-block mt-8 bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700"
          >
            Subscribe Now
          </Link>
        </div>
      </main>
    );
  }

  return children;
}