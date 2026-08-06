import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "package.json", "vercel.json", "src/app/layout.js", "src/app/page.js",
  "src/app/newspaper/page.js", "src/app/admin/page.js",
  "src/app/admin/launch-readiness/page.js",
  "src/app/api/cron/newsroom-start/route.js",
  "src/app/api/cron/newsroom-worker/route.js",
  "src/app/api/cron/newsroom-publish/route.js",
  "src/app/api/health/route.js",
];
const failures = [];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`Missing file: ${relative}`);
}
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const dependency of ["next", "react", "react-dom", "@supabase/supabase-js", "openai"]) {
  if (!packageJson.dependencies?.[dependency]) failures.push(`Missing dependency: ${dependency}`);
}
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const cronPaths = new Set((vercel.crons || []).map((item) => item.path));
for (const route of ["/api/cron/newsroom-start", "/api/cron/newsroom-worker", "/api/cron/newsroom-publish"]) {
  if (!cronPaths.has(route)) failures.push(`Missing Vercel cron: ${route}`);
}
if (failures.length) {
  console.error("\nRelease preflight failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Release preflight passed.");
console.log(`Next.js ${packageJson.dependencies.next}`);
console.log(`${requiredFiles.length} required files verified.`);
console.log(`${vercel.crons.length} Vercel cron entries verified.`);
