import SectionTitle from "./SectionTitle";

export default function LatestJobs() {
  const jobs = [
    {
      title: "SSC CGL 2026 Notification",
      date: "Last Date: 20 August 2026",
      status: "Apply Online",
    },
    {
      title: "Railway Group D Recruitment",
      date: "Last Date: 28 August 2026",
      status: "New Vacancy",
    },
    {
      title: "UP Police Constable Recruitment",
      date: "Last Date: 05 September 2026",
      status: "Official Notification",
    },
    {
      title: "Bank PO Recruitment",
      date: "Registration Open",
      status: "Apply Now",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <SectionTitle
        title="Latest Government Jobs"
        subtitle="Stay updated with the newest government job opportunities across India."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border p-6 hover:shadow-lg transition"
          >
            <span className="inline-block bg-red-800 text-white text-xs px-3 py-1 rounded-full font-bold">
              {job.status}
            </span>

            <h3 className="text-2xl font-black mt-4">
              {job.title}
            </h3>

            <p className="text-gray-600 mt-3">
              {job.date}
            </p>

            <button className="mt-5 bg-black text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-800 transition">
              View Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}