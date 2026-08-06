import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function getRequestUser(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return { user: null, error: "Authentication required." };
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return { user: null, error: error?.message || "Invalid login session." };
  }

  return { user: data.user, error: null };
}

export async function hasActiveSubscription(userId) {
  if (!userId) return false;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Subscription lookup failed:", error.message);
    return false;
  }

  const now = Date.now();

  return (data || []).some((subscription) => {
    if (!subscription.expiry_date) return true;
    return new Date(subscription.expiry_date).getTime() >= now;
  });
}
