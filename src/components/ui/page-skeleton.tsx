export default function PageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="h-4 w-72 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface-container-high" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-surface-container-high" />
    </div>
  );
}
