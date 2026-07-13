export default function BreakingNews() {
  const updates = [
    "SSC GD 2026 notification expected soon",
    "UP Police Constable result updates",
    "Railway Group D latest exam news",
    "Daily current affairs PDF coming soon",
  ];

  return (
    <div className="bg-red-800 text-white text-sm py-2 px-6 font-semibold overflow-hidden">
      <div className="max-w-7xl mx-auto flex gap-4">
        <span className="bg-white text-red-800 px-3 py-1 rounded font-extrabold">
          BREAKING
        </span>
        <p className="truncate">{updates.join("  •  ")}</p>
      </div>
    </div>
  );
}