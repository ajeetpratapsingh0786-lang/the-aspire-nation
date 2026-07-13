"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaBars,
  FaSearch,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
        {/* Logo and website name */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <Image
            src="/images/logo/aspire-nation-logo-header.png"
            alt="The Aspire Nation Logo"
            width={120}
            height={90}
            priority
            unoptimized
            className="h-14 w-14 shrink-0 object-contain sm:h-20 sm:w-20"
          />

          <div className="min-w-0">
            <h1 className="text-lg font-black leading-tight tracking-tight text-gray-950 sm:text-3xl">
              THE ASPIRE NATION
            </h1>

            <p className="mt-1 hidden text-sm font-semibold text-gray-500 sm:block">
              Every Aspirant&apos;s Morning Starts Here.
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden shrink-0 items-center gap-5 text-sm font-bold lg:flex">
          <Link href="/" className="hover:text-red-700">
            Home
          </Link>

          <Link href="/epaper" className="hover:text-red-700">
            E-Paper
          </Link>

          <Link href="/current-affairs" className="hover:text-red-700">
            Current Affairs
          </Link>

          <Link href="/jobs" className="hover:text-red-700">
            Jobs
          </Link>

          <Link href="/editorial" className="hover:text-red-700">
            Editorial
          </Link>
        </nav>

        {/* Desktop actions only */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link
            href="/search"
            aria-label="Search"
            className="text-lg text-gray-700 hover:text-red-700"
          >
            <FaSearch />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold hover:bg-gray-100"
          >
            <FaUserCircle />
            Login
          </Link>

          <Link
            href="/subscribe"
            className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white hover:bg-red-800"
          >
            Join Premium
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-xl text-gray-950 lg:hidden"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="w-full border-t border-gray-200 bg-white px-4 py-5 lg:hidden">
          <nav className="flex flex-col gap-4 font-bold text-gray-800">
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>

            <Link href="/epaper" onClick={closeMenu}>
              E-Paper
            </Link>

            <Link href="/current-affairs" onClick={closeMenu}>
              Current Affairs
            </Link>

            <Link href="/jobs" onClick={closeMenu}>
              Jobs
            </Link>

            <Link href="/editorial" onClick={closeMenu}>
              Editorial
            </Link>

            <Link
              href="/search"
              onClick={closeMenu}
              className="flex items-center gap-2"
            >
              <FaSearch />
              Search
            </Link>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-3"
              >
                <FaUserCircle />
                Login
              </Link>

              <Link
                href="/subscribe"
                onClick={closeMenu}
                className="rounded-xl bg-red-700 px-3 py-3 text-center text-white"
              >
                Join Premium
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}