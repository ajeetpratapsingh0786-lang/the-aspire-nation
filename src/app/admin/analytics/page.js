"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AnalyticsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const { data: subData } = await supabase
      .from("user_subscriptions")
      .select("*");

    const { data: paperData } = await supabase
      .from("newspapers")
      .select("*");

    setSubscriptions(subData || []);
    setPapers(paperData || []);
  }

  const revenue = subscriptions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const active = subscriptions.filter(
    (item) =>
      item.status === "active" &&
      new Date(item.expiry_date) > new Date()
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Analytics Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Business overview of The Aspire Nation.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Revenue</p>
          <h2 className="text-4xl font-bold text-green-600 mt-2">
            ₹{revenue}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Premium Users</p>
          <h2 className="text-4xl font-bold mt-2">
            {active}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Total Payments</p>
          <h2 className="text-4xl font-bold mt-2">
            {subscriptions.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Newspapers Published</p>
          <h2 className="text-4xl font-bold mt-2">
            {papers.length}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow p-8">

        <h2 className="text-2xl font-bold mb-6">
          Launch Status
        </h2>

        <div className="space-y-4 text-lg">

          <div>✅ Authentication</div>

          <div>✅ Razorpay</div>

          <div>✅ Premium Subscription</div>

          <div>✅ Newspaper Upload</div>

          <div>✅ Reader</div>

          <div>✅ Current Affairs</div>

          <div>✅ Jobs</div>

          <div>✅ Subscribers</div>

          <div>✅ Payments</div>

        </div>

      </div>
    </div>
  );
}