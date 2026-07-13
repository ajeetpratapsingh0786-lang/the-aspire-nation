"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SubscribersAdminPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  async function loadSubscribers() {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubscriptions(data);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Subscribers
        </h1>
        <p className="text-gray-500 mt-2">
          Manage premium subscribers and subscription status.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Total Subscriptions</p>
          <h2 className="text-3xl font-bold mt-2">
            {subscriptions.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Active Subscribers</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {
              subscriptions.filter(
                (item) =>
                  item.status === "active" &&
                  new Date(item.expiry_date) > new Date()
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Expired</p>
          <h2 className="text-3xl font-bold mt-2 text-red-600">
            {
              subscriptions.filter(
                (item) =>
                  item.expiry_date &&
                  new Date(item.expiry_date) < new Date()
              ).length
            }
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-bold mb-6">
          Subscription Records
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">User ID</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment ID</th>
                  <th>Expiry</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-none">
                    <td className="py-4 text-sm">
                      {sub.user_id}
                    </td>
                    <td className="capitalize">
                      {sub.plan}
                    </td>
                    <td>₹{sub.amount}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="text-sm">
                      {sub.razorpay_payment_id || "-"}
                    </td>
                    <td>
                      {sub.expiry_date
                        ? new Date(sub.expiry_date).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}

                {subscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500"
                    >
                      No subscribers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}