export default function Sidebar() {
  const trending = [
    "SSC CGL 2026 Preparation Strategy",
    "Railway Group D Latest Update",
    "UP Police Constable Recruitment",
    "Current Affairs PDF - Today",
    "Weekly Editorial Analysis",
  ];

  return (
    <aside className="bg-white rounded-3xl shadow-lg border p-6 sticky top-24">
      <h3 className="text-2xl font-black border-b pb-4">
        🔥 Trending
      </h3>

      <div className="mt-5 space-y-4">
        {trending.map((item, index) => (
          <div
            key={index}
            className="border-b pb-3 cursor-pointer hover:text-red-700 transition"
          >
            <span className="font-bold text-red-800">
              #{index + 1}
            </span>

            <p className="mt-1 font-semibold">
              {item}
            </p>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full bg-red-800 text-white py-3 rounded-xl font-bold hover:bg-red-900 transition">
        View All Updates
      </button>
    </aside>
  );
}