import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing from the .env.local file.");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from the .env.local file.");
}

function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let supabase;

if (typeof window !== "undefined") {
  if (!window.__theAspireNationSupabase) {
    window.__theAspireNationSupabase = createSupabaseClient();
  }

  supabase = window.__theAspireNationSupabase;
} else {
  // Client modules can be imported during server compilation. The returned
  // object is only used by client components in the browser.
  supabase = createSupabaseClient();
}

export { supabase };
