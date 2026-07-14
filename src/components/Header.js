"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBars,
  FaCrown,
  FaSearch,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "E-Paper", href: "/epaper" },
  { name: "Current Affairs", href: "/current-affairs" },
  { name: "Editorial", href: "/editorial" },
  { name: "Jobs", href: "/jobs" },
  { name: "Results", href: "/results" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      {/* Main header */}

      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[90px] sm:px-6">
        {/* Logo and brand */}

        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
          aria-label="The Aspire Nation homepage"
        >
          <Image
            src="/images/logo/aspire-nation-logo-header.png"
            alt="The Aspire Nation logo"
            width={100}
            height={100}
            priority
            unoptimized
            className="h-14 w-14 shrink-0 object-contain sm:h-20 sm:w-20"
          />

          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-none tracking-tight text-gray-950 sm:text-2xl xl:text-3xl">
              THE ASPIRE NATION
            </p>

            <p className="mt-1.5 hidden text-xs font-semibold tracking-wide text-gray-500 sm:block xl:text-sm">
              Every Aspirant&apos;s Morning Starts Here.
            </p>
          </div>
        </Link>

        {/* Desktop actions */}

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/search"
            aria-label="Search The Aspire Nation"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <FaSearch />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:border-gray-400 hover:bg-gray-100"
          >
            <FaUserCircle className="text-base" />
            Login
          </Link>

          <Link
            href="/subscribe"
            className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-md"
          >
            <FaCrown />
            Join Premium
          </Link>
        </div>

        {/* Mobile menu button */}

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white text-xl text-gray-950 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 lg:hidden"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Desktop navigation */}

      <div className="hidden border-t border-gray-100 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <nav className="flex items-center">
            {navigationItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-4 text-sm font-bold transition xl:px-4 ${
                    active
                      ? "text-red-700"
                      : "text-gray-700 hover:text-red-700"
                  }`}
                >
                  {item.name}

                  <span
                    className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-red-700 transition ${
                      active
                        ? "scale-x-100 opacity-100"
                        : "scale-x-0 opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <p className="hidden text-xs font-bold uppercase tracking-[0.16em] text-gray-400 xl:block">
            Daily E-Paper for Competitive Exams
          </p>
        </div>
      </div>

      {/* Mobile menu backdrop */}

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 top-[76px] z-40 bg-black/40 backdrop-blur-sm sm:top-[90px] lg:hidden"
        />
      )}

      {/* Mobile navigation panel */}

      <div
        className={`absolute left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-2xl transition-all duration-300 lg:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <div className="max-h-[calc(100vh-76px)] overflow-y-auto px-4 py-5 sm:max-h-[calc(100vh-90px)] sm:px-6">
          <nav className="grid gap-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-bold transition ${
                    active
                      ? "bg-red-50 text-red-700"
                      : "text-gray-800 hover:bg-gray-100 hover:text-red-700"
                  }`}
                >
                  <span>{item.name}</span>

                  {active && (
                    <span className="h-2 w-2 rounded-full bg-red-700" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="my-5 border-t border-gray-200" />

          <Link
            href="/search"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 font-bold text-gray-800 transition hover:bg-gray-100"
          >
            <FaSearch className="text-red-700" />
            Search Website
          </Link>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-3.5 font-bold text-gray-900 transition hover:bg-gray-100"
            >
              <FaUserCircle />
              Login
            </Link>

            <Link
              href="/subscribe"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-3 py-3.5 text-center font-black text-white transition hover:bg-red-800"
            >
              <FaCrown />
              Premium
            </Link>
          </div>

          <p className="mt-5 text-center text-xs font-semibold text-gray-400">
            Every Aspirant&apos;s Morning Starts Here.
          </p>
        </div>
      </div>
    </header>
  );
}