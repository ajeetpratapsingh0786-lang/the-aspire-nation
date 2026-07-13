export default function EmptyState({ title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow p-10 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
    </div>
  );
}