export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-red-600 animate-spin"></div>
    </div>
  );
}