export default function UploadBox({ icon: Icon, title, description, accept }) {
  return (
    <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-gray-50">
      {Icon && <Icon size={42} className="mx-auto text-red-600" />}

      <p className="font-semibold mt-3">{title}</p>

      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}

      <input type="file" accept={accept} className="mt-4" />
    </div>
  );
}