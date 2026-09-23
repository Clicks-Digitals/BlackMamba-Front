"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isAnalyticsEnabled } from "../lib/config";
import { trackPageView } from "../lib/track";

/**
 * Reports a page view on every App Router navigation.
 *
 * Next.js client-side navigation never reloads the document, so neither SDK's
 * built-in page view fires again after the first load. This effect covers both
 * the initial view and every subsequent route change.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    const query = searchParams.toString();
    trackPageView(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  // useSearchParams opts everything above it out of static rendering unless it
  // sits behind a Suspense boundary - this one renders nothing, so the fallback
  // is empty and no page is held back by it.
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
