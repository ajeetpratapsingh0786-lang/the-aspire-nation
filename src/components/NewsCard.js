export default function NewsCard({ title, desc, Icon }) {
  return (
    <div className="bg-[#f7f7f3] border rounded-2xl p-7 shadow-sm hover:shadow-lg transition">
      <Icon className="text-red-800 text-3xl mb-5" />

      <h3 className="text-2xl font-black">{title}</h3>

      <p className="text-gray-600 mt-3">{desc}</p>
    </div>
  );
}