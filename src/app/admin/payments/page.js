"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data);
    }

    setLoading(false);
  }

  const totalRevenue = payments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-2">
          Track Razorpay payments and subscription revenue.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Total Payments</p>
          <h2 className="text-3xl font-bold mt-2">{payments.length}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            ₹{totalRevenue}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Successful</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {payments.filter((item) => item.status === "active").length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-bold mb-6">Payment Records</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Payment ID</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>User ID</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-none">
                    <td className="py-4 text-sm">
                      {payment.razorpay_payment_id || "-"}
                    </td>
                    <td className="capitalize">{payment.plan}</td>
                    <td>₹{payment.amount}</td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-sm">{payment.user_id}</td>
                    <td>
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No payments found.
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