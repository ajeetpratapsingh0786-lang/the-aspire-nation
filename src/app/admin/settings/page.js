"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("The Aspire Nation");
  const [tagline, setTagline] = useState("Every Aspirant's Morning Starts Here");
  const [email, setEmail] = useState("contact@theaspirenation.com");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage basic platform settings.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 max-w-3xl">
        <h2 className="text-xl font-bold mb-6">Website Settings</h2>

        <div className="space-y-5">
          <div>
            <label className="font-semibold block mb-2">Website Name</label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">Contact Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}