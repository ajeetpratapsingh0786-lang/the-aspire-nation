export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <p className="text-red-800 font-black uppercase text-sm">
        The Aspire Nation
      </p>

      <h2 className="text-4xl font-black mt-2">{title}</h2>

      {subtitle && (
        <p className="text-gray-600 mt-2 max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}