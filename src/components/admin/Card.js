export default function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {title && <h2 className="text-xl font-bold mb-5">{title}</h2>}
      {children}
    </div>
  );
}