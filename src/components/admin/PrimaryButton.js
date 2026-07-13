export default function PrimaryButton({ children, icon: Icon }) {
  return (
    <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center gap-2">
      {Icon && <Icon />}
      {children}
    </button>
  );
}