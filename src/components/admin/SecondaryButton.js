export default function SecondaryButton({ children, icon: Icon }) {
  return (
    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black flex items-center justify-center gap-2">
      {Icon && <Icon />}
      {children}
    </button>
  );
}