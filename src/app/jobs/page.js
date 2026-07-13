import { createClient } from "@supabase/supabase-js";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function JobsPage() {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        description,
        category,
        official_link,
        published_at,
        is_published
      `
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-950 to-red-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <FaBriefcase className="text-4xl text-red-300" />
            </div>

            <div>
              <p className="font-black uppercase tracking-[0.2em] text-red-300">
                Latest Openings
              </p>

              <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                Government Jobs
              </h1>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-200">
            Find the latest government job notifications, eligibility details,
            important dates and official application links.
          </p>
        </div>
      </section>

      {/* Jobs List */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load job notifications.
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                    {job.category || "Government Job"}
                  </span>

                  {job.published_at && (
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <FaCalendarAlt />
                      {formatDate(job.published_at)}
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-black leading-snug text-gray-950">
                  {job.title}
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  {job.description}
                </p>

                {job.official_link && (
                  <a
                    href={job.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-black text-white transition hover:bg-red-800"
                  >
                    Official Notification
                    <FaExternalLinkAlt size={13} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <FaBriefcase className="mx-auto text-5xl text-gray-300" />

            <h2 className="mt-5 text-2xl font-black text-gray-800">
              No jobs published yet
            </h2>

            <p className="mt-2 text-gray-500">
              New government job notifications will appear here after they are
              published from the admin dashboard.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}