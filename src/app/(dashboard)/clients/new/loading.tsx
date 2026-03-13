export default function NewClientLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="rounded-lg border border-border p-6 space-y-5 max-w-2xl">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ))}
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
