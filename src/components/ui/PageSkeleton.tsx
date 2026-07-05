export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-48" />
        <div className="h-4 bg-gray-200 rounded w-72" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
