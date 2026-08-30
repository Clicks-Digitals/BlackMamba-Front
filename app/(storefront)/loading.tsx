export default function StorefrontLoading() {
  return (
    <div className="min-h-[60vh]">
      <div className="relative h-72 w-full overflow-hidden bg-[#121314] sm:h-105">
        <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-white/4 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      </div>
      <div className="layout-page layout-gutter-x space-y-10 py-10">
        <div className="h-3 w-24 rounded-md bg-primary/25" />
        <div className="h-6 w-48 rounded-md bg-white/8" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square w-full animate-pulse rounded-lg border border-white/8 bg-white/6" />
              <div className="h-3 w-3/4 rounded bg-white/8" />
              <div className="h-3 w-1/2 rounded bg-white/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
