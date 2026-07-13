export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-500 mt-2">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}