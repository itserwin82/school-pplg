export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <div className="h-[380px] animate-pulse rounded-2xl border border-border bg-card xl:col-span-4" />
        <div className="h-[380px] animate-pulse rounded-2xl border border-border bg-card xl:col-span-3" />
      </div>
    </div>
  );
}