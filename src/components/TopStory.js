export default function TopStory() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-12">
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white rounded-3xl p-10 shadow-xl">

        <p className="uppercase font-black text-sm tracking-wider">
          TOP STORY
        </p>

        <h2 className="text-5xl font-black mt-4 leading-tight">
          Start Every Morning With The Most Important Exam Updates.
        </h2>

        <p className="mt-6 text-red-100 text-lg max-w-3xl">
          The Aspire Nation brings together current affairs, government jobs,
          admit cards, results, editorials, quizzes and daily newspaper—all in
          one place for serious aspirants.
        </p>

        <button className="mt-8 bg-white text-red-800 px-8 py-4 rounded-xl font-black hover:scale-105 transition">
          Explore Today's Updates
        </button>

      </div>
    </section>
  );
}