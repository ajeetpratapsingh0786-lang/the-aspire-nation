import Link from "next/link";

export default function QuickActions({ actions }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">Quick Actions</h2>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="block w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-black"
          >
            {action.title}
          </Link>
        ))}
      </div>
    </div>
  );
}