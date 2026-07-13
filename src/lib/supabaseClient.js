import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing from the .env.local file."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from the .env.local file."
  );
}

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "the-aspire-nation-auth",
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
  supabase = createSupabaseClient();
}

export { supabase };