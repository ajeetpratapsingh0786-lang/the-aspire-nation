"use client";

import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import LogoutButton from "@/components/auth/LogoutButton";

import {
  FaTachometerAlt,
  FaNewspaper,
  FaBookOpen,
  FaBriefcase,
  FaPenNib,
  FaQuestionCircle,
  FaUsers,
  FaRupeeSign,
  FaChartLine,
  FaCog,
  FaBell,
  FaUserCircle,
  FaTrophy,
  FaIdCard,
  FaBullhorn,
} from "react-icons/fa";

export default function AdminLayout({ children }) {
  const menu = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: FaTachometerAlt,
    },
    {
      title: "Newspaper",
      href: "/admin/upload",
      icon: FaNewspaper,
    },
    {
      title: "Current Affairs",
      href: "/admin/current-affairs",
      icon: FaBookOpen,
    },
    {
      title: "Jobs",
      href: "/admin/jobs",
      icon: FaBriefcase,
    },
    {
      title: "Results",
      href: "/admin/results",
      icon: FaTrophy,
    },
    {
      title: "Admit Cards",
      href: "/admin/admit-cards",
      icon: FaIdCard,
    },
    {
      title: "Editorial",
      href: "/admin/editorial",
      icon: FaPenNib,
    },
    {
      title: "Quiz",
      href: "/admin/quiz",
      icon: FaQuestionCircle,
    },
    {
      title: "Breaking News",
      href: "/admin/breaking-news",
      icon: FaBullhorn,
    },
    {
      title: "Subscribers",
      href: "/admin/subscribers",
      icon: FaUsers,
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: FaRupeeSign,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: FaChartLine,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: FaCog,
    },
  ];

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}

        <aside className="hidden md:flex w-72 bg-gray-950 text-white flex-col shadow-xl">

          <div className="p-6 border-b border-gray-800">

            <h1 className="text-2xl font-black tracking-wide text-red-500">
              THE ASPIRE NATION
            </h1>

            <p className="text-gray-400 text-sm mt-2">
              Admin Control Panel
            </p>

          </div>

          <nav className="flex-1 overflow-y-auto p-4">

            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 font-medium transition hover:bg-red-600 hover:text-white"
                >
                  <Icon size={18} />

                  <span>{item.title}</span>
                </Link>
              );
            })}

          </nav>

          <div className="border-t border-gray-800 p-4">
            <LogoutButton />
          </div>

        </aside>

        {/* Main */}

        <div className="flex-1">

          <header className="bg-white shadow px-8 py-5 flex justify-between items-center">

            <div>

              <h2 className="text-3xl font-black text-gray-900">
                Admin Dashboard
              </h2>

              <p className="text-gray-500 mt-1">
                Manage The Aspire Nation Platform
              </p>

            </div>

            <div className="flex items-center gap-6">

              <button className="relative">

                <FaBell className="text-gray-600" size={20} />

                <span className="absolute -top-2 -right-2 h-2 w-2 rounded-full bg-red-600"></span>

              </button>

              <div className="flex items-center gap-3">

                <FaUserCircle
                  size={38}
                  className="text-gray-700"
                />

                <div>

                  <p className="font-bold">
                    Administrator
                  </p>

                  <p className="text-xs text-gray-500">
                    Super Admin
                  </p>

                </div>

              </div>

            </div>

          </header>

          <main className="p-8">
            {children}
          </main>

        </div>

      </div>
    </AuthGuard>
  );
}