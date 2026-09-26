export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-4 p-4 sm:p-6" aria-busy="true" aria-label={label}>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted/80" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
    </div>
  );
}
