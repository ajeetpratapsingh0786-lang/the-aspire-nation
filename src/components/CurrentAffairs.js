import SectionTitle from "./SectionTitle";

export default function CurrentAffairs() {
  const news = [
    {
      title: "Cabinet approves new education initiatives",
      category: "National",
    },
    {
      title: "RBI announces latest monetary policy updates",
      category: "Economy",
    },
    {
      title: "India launches new satellite mission",
      category: "Science & Tech",
    },
    {
      title: "International summit concludes with major agreements",
      category: "International",
    },
    {
      title: "Sports highlights for competitive exams",
      category: "Sports",
    },
    {
      title: "Important environment and climate updates",
      category: "Environment",
    },
  ];

  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-6">

        <SectionTitle
          title="Today's Current Affairs"
          subtitle="Important news specially selected for competitive examinations."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {news.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border p-6 hover:shadow-lg transition"
            >
              <span className="inline-block bg-red-800 text-white text-xs px-3 py-1 rounded-full font-bold">
                {item.category}
              </span>

              <h3 className="text-xl font-black mt-4">
                {item.title}
              </h3>

              <button className="mt-5 text-red-800 font-bold">
                Read More →
              </button>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}