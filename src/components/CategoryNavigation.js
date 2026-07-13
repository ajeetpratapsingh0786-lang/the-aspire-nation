export default function CategoryNavigation() {
  const categories = [
    "SSC",
    "UPSC",
    "Banking",
    "Railway",
    "Defence",
    "Teaching",
    "State Exams",
    "Current Affairs",
    "PDF Notes",
    "Mock Test",
  ];

  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
        {categories.map((category) => (
          <a
            key={category}
            href="#"
            className="whitespace-nowrap bg-gray-100 hover:bg-red-800 hover:text-white transition px-4 py-2 rounded-full text-sm font-bold"
          >
            {category}
          </a>
        ))}
      </div>
    </section>
  );
}