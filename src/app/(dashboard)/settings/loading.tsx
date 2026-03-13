export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-border p-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
