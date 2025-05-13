export default function SkeletonEventCard() {
  return (
    <div className="animate-pulse bg-white p-4 rounded-lg shadow-md w-full">
      <div className="bg-gray-300 h-40 w-full rounded-md mb-4" />
      <div className="h-4 bg-gray-300 rounded mb-2 w-3/4" />
      <div className="h-3 bg-gray-300 rounded w-1/2" />
    </div>
  );
}
