"use client";

import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  FaTachometerAlt,
  FaNewspaper,
  FaRobot,
  FaUpload,
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
  FaRocket,
} from "react-icons/fa";

const primaryMenu = [
  { title: "Control Room", href: "/admin", icon: FaTachometerAlt },
  { title: "AI Newsroom", href: "/admin/newsroom-automation", icon: FaRobot },
  { title: "Editions", href: "/admin/newsroom-editions", icon: FaNewspaper },
  { title: "Launch Readiness", href: "/admin/launch-readiness", icon: FaRocket },
];

const contentMenu = [
  { title: "Current Affairs", href: "/admin/current-affairs", icon: FaBookOpen },
  { title: "Jobs", href: "/admin/jobs", icon: FaBriefcase },
  { title: "Results", href: "/admin/results", icon: FaTrophy },
  { title: "Admit Cards", href: "/admin/admit-cards", icon: FaIdCard },
  { title: "Editorial", href: "/admin/editorial", icon: FaPenNib },
  { title: "Quiz", href: "/admin/quiz", icon: FaQuestionCircle },
  { title: "Breaking News", href: "/admin/breaking-news", icon: FaBullhorn },
];

const businessMenu = [
  { title: "Subscribers", href: "/admin/subscribers", icon: FaUsers },
  { title: "Payments", href: "/admin/payments", icon: FaRupeeSign },
  { title: "Analytics", href: "/admin/analytics", icon: FaChartLine },
  { title: "Settings", href: "/admin/settings", icon: FaCog },
  { title: "Manual PDF Upload", href: "/admin/upload", icon: FaUpload },
];

function MenuGroup({ title, items }) {
  return (
    <div className="mb-5">
      <p className="mb-2 px-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-200 transition hover:bg-red-600 hover:text-white"
          >
            <Icon size={17} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-100">
        <aside className="hidden w-72 flex-col bg-slate-950 text-white shadow-xl md:flex">
          <div className="border-b border-slate-800 p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-400">
              The Aspire Nation
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight">
              Editorial Control Room
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Daily newsroom, review and publishing
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <MenuGroup title="Newsroom" items={primaryMenu} />
            <MenuGroup title="Publishing Desk" items={contentMenu} />
            <MenuGroup title="Business & System" items={businessMenu} />
          </nav>

          <div className="border-t border-slate-800 p-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 shadow-sm md:px-8">
            <div>
              <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                Editorial Control Room
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Produce, approve and publish The Aspire Nation
              </p>
            </div>

            <div className="flex items-center gap-5">
              <button className="relative" aria-label="Notifications">
                <FaBell className="text-slate-600" size={20} />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-600" />
              </button>

              <div className="hidden items-center gap-3 sm:flex">
                <FaUserCircle size={38} className="text-slate-700" />
                <div>
                  <p className="font-bold text-slate-950">Editor-in-Chief</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
