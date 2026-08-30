"use server";
import { apiClient } from "@/lib/api";
import { extractList, isBlankParent } from "@/lib/api/extract-list";
import { normalizeCategories, normalizeCategory } from "@/lib/api/normalize-category";
import type { PaginatedResponse, Category } from "@/types";

export async function searchCategories(query: string): Promise<Category[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({ search: trimmed, page_size: "6" });
  const res = await apiClient<unknown>(`/categories/?${params}`, { revalidate: 30 });
  if (!res.ok) return [];
  return normalizeCategories(res.data);
}

export async function getAllCategories(
  page: number,
  filters: Record<string, string>
): Promise<PaginatedResponse<Category>> {
  const params = new URLSearchParams({ page: page.toString() });
  const topLevelOnly = isBlankParent(filters.parent) && filters.parent !== undefined;

  for (const [key, value] of Object.entries(filters)) {
    if (key === "parent" || key === "is_active") continue;
    if (value) params.set(key, value);
  }

  if (topLevelOnly) {
    params.set("page_size", "100");
    params.delete("page");
    const res = await apiClient<unknown>(`/categories/?${params.toString()}`);
    if (!res.ok) {
      return { count: 0, results: [], next: null, previous: null, total_pages: 0, current_page: 1 };
    }
    const results = normalizeCategories(res.data).filter((c) => !c.parent);
    return {
      count: results.length,
      results,
      next: null,
      previous: null,
      total_pages: 1,
      current_page: 1
    };
  }

  const res = await apiClient<unknown>(`/categories/?${params.toString()}`);
  if (!res.ok) {
    return { count: 0, results: [], next: null, previous: null, total_pages: 0, current_page: page };
  }

  const list = extractList<Parameters<typeof normalizeCategory>[0]>(res.data);
  const results = list.map(normalizeCategory);
  const payload = res.data as PaginatedResponse<Category> | Category[];
  const count = !Array.isArray(payload) && payload && "count" in payload ? payload.count : results.length;
  const next = !Array.isArray(payload) && payload && "next" in payload ? payload.next : null;
  const previous = !Array.isArray(payload) && payload && "previous" in payload ? payload.previous : null;

  return { count, results, next, previous, current_page: page };
}
