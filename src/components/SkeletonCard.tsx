export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-24"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-16 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 animate-pulse">
          <div className="w-8 h-4 bg-slate-200 rounded"></div>
          <div className="w-40 h-4 bg-slate-200 rounded"></div>
          <div className="flex-1 h-6 bg-slate-200 rounded"></div>
          <div className="w-12 h-4 bg-slate-200 rounded"></div>
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
      <div className="h-80 bg-slate-100 rounded"></div>
    </div>
  );
}
