import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServerAuth } from "@/lib/supabaseServerAuth";

const ACTIVE_STATUSES = new Set(["active", "paid", "current", "premium", "completed", "success"]);
const END_DATE_FIELDS = ["expiry_date", "expires_at", "end_date", "valid_until", "subscription_end", "plan_expiry"];

function isStillValid(row) {
  const status = String(row?.status || "").trim().toLowerCase();
  if (status && !ACTIVE_STATUSES.has(status)) return false;

  const dateField = END_DATE_FIELDS.find((field) => row?.[field]);
  if (!dateField) return ACTIVE_STATUSES.has(status) || row?.is_active === true;

  const expiry = new Date(row[dateField]);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() >= Date.now();
}

async function readRows(admin, table, userId) {
  const { data, error } = await admin
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .limit(50);

  if (error) {
    // Missing optional table/column: try the next supported schema.
    return { rows: [], unavailable: true };
  }
  return { rows: data || [], unavailable: false };
}

export async function getPremiumAccess() {
  try {
    const authClient = await createSupabaseServerAuth();
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const user = userData?.user || null;

    if (userError || !user) {
      return { hasPremium: false, isSignedIn: false, reason: "login_required" };
    }

    const adminEmail = String(process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();
    if (adminEmail && String(user.email || "").toLowerCase() === adminEmail) {
      return { hasPremium: true, isSignedIn: true, reason: "admin" };
    }

    const admin = createSupabaseAdmin();
    const tables = ["user_subscriptions", "subscriptions"];

    for (const table of tables) {
      const result = await readRows(admin, table, user.id);
      if (result.unavailable) continue;
      if (result.rows.some(isStillValid)) {
        return { hasPremium: true, isSignedIn: true, reason: `active:${table}` };
      }
    }

    return { hasPremium: false, isSignedIn: true, reason: "subscription_required" };
  } catch (error) {
    // Fail closed: a broken auth/subscription query must never expose Pages 2–8.
    console.error("Premium access check failed:", error);
    return { hasPremium: false, isSignedIn: false, reason: "access_check_failed" };
  }
}
