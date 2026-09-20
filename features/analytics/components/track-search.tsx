"use client";

import { useEffect } from "react";
import { trackSearch } from "../lib/track";

/**
 * Renders nothing; reports a search from the results page.
 *
 * Tracking here rather than in the search box covers every way a customer
 * reaches results - the header box, the mobile sheet, a shared link, or the
 * back button - and keeps the three search inputs uninstrumented.
 */
export function TrackSearch({ term }: { term: string }) {
  useEffect(() => {
    const trimmed = term.trim();
    if (!trimmed) return;
    trackSearch({ term: trimmed });
  }, [term]);

  return null;
}
