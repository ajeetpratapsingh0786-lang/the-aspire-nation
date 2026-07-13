"use client";

import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600 transition text-white"
    >
      <FaSignOutAlt />
      Logout
    </button>
  );
}