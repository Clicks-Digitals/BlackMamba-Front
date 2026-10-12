import { Suspense } from "react";
import { HomeFeature } from "@/features/home";
import { HomeSkeleton } from "@/features/home/components/home-skeleton";

/**
 * The homepage builds eight product carousels from nine API calls before it
 * can render anything, which left the browser on a blank page for several
 * seconds. Suspending it here lets the header, navigation and footer arrive
 * straight away while the content streams in behind them.
 *
 * Deliberately a Suspense boundary inside the page and not a route-level
 * loading.tsx: that applied to every storefront route, including the product
 * pages that answer with a 404 or a redirect, and it committed a 200 status
 * before they had the chance. The homepage is always a 200, so it can stream.
 */
export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeFeature />
    </Suspense>
  );
}
