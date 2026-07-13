import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function EpaperPage() {
  const { data: papers, error } = await supabase
    .from("newspapers")
    .select("*")
    .eq("is_published", true)
    .order("edition_date", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Unable to Load E-Paper
          </h1>
          <p className="mt-4 text-gray-600">
            Please try again later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <h1 className="text-5xl font-black text-gray-900">
            The Aspire Nation
          </h1>

          <p className="text-xl text-gray-600 mt-3">
            Daily E-Paper for Competitive Exam Aspirants
          </p>
        </div>

        {papers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <h2 className="text-3xl font-bold">
              No Edition Published Yet
            </h2>

            <p className="text-gray-500 mt-3">
              Today's newspaper has not been published yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {papers.map((paper) => (

              <div
                key={paper.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition"
              >

                <img
                  src={paper.preview_url}
                  alt={paper.title}
                  className="w-full h-[380px] object-cover bg-gray-200"
                />

                <div className="p-6">

                  <h2 className="text-2xl font-bold text-gray-900">
                    {paper.title}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Edition Date
                  </p>

                  <p className="font-semibold">
                    {paper.edition_date}
                  </p>

                  <div className="flex gap-3 mt-6">

                    <a
                      href={paper.preview_url}
                      target="_blank"
                      className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-center font-semibold hover:bg-black"
                    >
                      Preview
                    </a>

                    <Link
                      href={`/epaper/${paper.id}`}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl text-center font-semibold hover:bg-red-700"
                    >
                      Read Edition
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </main>
  );
}