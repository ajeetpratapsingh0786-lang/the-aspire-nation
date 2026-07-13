export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{value}</h2>
        </div>

        {Icon && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}