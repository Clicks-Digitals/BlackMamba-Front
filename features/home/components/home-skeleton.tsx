/**
 * Shown while the homepage's content is still being built on the server.
 *
 * This lives inside the page rather than in a route-level loading.tsx: that
 * file applied to every storefront route, including the product pages that
 * decide a 404 or a redirect, and it committed a 200 before they could.
 * The homepage never does either, so it can stream safely.
 */
export function HomeSkeleton() {
  return (
    <div className="min-h-[60vh]" aria-hidden>
      <div className="relative h-72 w-full overflow-hidden bg-card sm:h-105">
        <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="layout-page layout-gutter-x space-y-10 py-10">
        <div className="h-3 w-24 rounded-md bg-primary/25" />
        <div className="h-6 w-48 rounded-md bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square w-full animate-pulse rounded-lg border border-border bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
