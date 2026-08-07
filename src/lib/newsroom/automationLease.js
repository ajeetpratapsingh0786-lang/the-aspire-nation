import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const LOCK_NAME = "daily-newspaper-production";
const DEFAULT_LEASE_SECONDS = 480;

export async function acquireAutomationLease({ leaseSeconds = DEFAULT_LEASE_SECONDS } = {}) {
  const supabase = createSupabaseAdmin();
  const owner = `pulse-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const { data, error } = await supabase.rpc("newsroom_try_acquire_lock", {
    p_lock_name: LOCK_NAME,
    p_owner: owner,
    p_lease_seconds: leaseSeconds,
  });

  if (error) {
    throw new Error(`Could not acquire newsroom production lock: ${error.message}`);
  }

  const acquired = Array.isArray(data) ? Boolean(data[0]?.acquired) : Boolean(data?.acquired ?? data);
  return { acquired, owner, lockName: LOCK_NAME };
}

export async function releaseAutomationLease(owner) {
  if (!owner) return;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.rpc("newsroom_release_lock", {
    p_lock_name: LOCK_NAME,
    p_owner: owner,
  });
  if (error) {
    // Lease expiry is the safety net; release failure must not turn a completed
    // production pulse into a failed HTTP request.
    console.error("Could not release newsroom production lock:", error.message);
  }
}
