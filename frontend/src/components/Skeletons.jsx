export function TaskCardSkeleton() {
  return (
    <div className="card animate-pulse p-3">
      <div className="mb-3 h-3.5 w-3/4 rounded bg-ink/10" />
      <div className="mb-4 h-3 w-full rounded bg-ink/5" />
      <div className="mb-3 h-4 w-16 rounded bg-ink/10" />
      <div className="h-7 w-full rounded bg-ink/5" />
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-ink/10" />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse p-5">
          <div className="mb-2 h-4 w-1/2 rounded bg-ink/10" />
          <div className="h-3 w-3/4 rounded bg-ink/5" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="card divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-ink/10" />
          <div className="flex-1">
            <div className="mb-1.5 h-3 w-1/3 rounded bg-ink/10" />
            <div className="h-2.5 w-1/2 rounded bg-ink/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
