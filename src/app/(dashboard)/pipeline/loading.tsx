export default function PipelineLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-[300px] shrink-0 space-y-3 rounded-lg border border-border p-3">
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-24 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
