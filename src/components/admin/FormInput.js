export default function FormInput({ label, type = "text", placeholder }) {
  return (
    <div>
      <label className="font-semibold block mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
      />
    </div>
  );
}