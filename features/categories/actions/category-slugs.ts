"use server";

import { apiClient } from "@/lib/api";
import { extractList } from "@/lib/api/extract-list";

type SlugRow = { slug?: string | null };

/**
 * Every category slug, for deciding whether a URL's first segment is a real
 * category. Cached, because it is consulted on each product page view.
 */
export async function getCategorySlugs(): Promise<Set<string>> {
  const res = await apiClient<unknown>("/categories/?page_size=500", { revalidate: 300 });
  if (!res.ok) return new Set();

  const rows = extractList<SlugRow>(res.data);
  return new Set(
    rows.map((row) => row?.slug).filter((slug): slug is string => Boolean(slug))
  );
}
