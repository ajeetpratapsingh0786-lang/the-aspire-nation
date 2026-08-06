export function verifyCronRequest(request) {
  const expected = String(process.env.CRON_SECRET || "").trim();
  if (!expected) return { ok: false, error: "CRON_SECRET is not configured." };

  const authorization = String(request.headers.get("authorization") || "");
  const suppliedBearer = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  const suppliedHeader = String(request.headers.get("x-cron-secret") || "").trim();
  const suppliedQuery = new URL(request.url).searchParams.get("secret") || "";

  const supplied = suppliedBearer || suppliedHeader || suppliedQuery;
  return supplied === expected
    ? { ok: true }
    : { ok: false, error: "Unauthorized automation request." };
}
