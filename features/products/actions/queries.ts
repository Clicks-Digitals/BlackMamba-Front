"use server";

import { apiClient, normalizeProduct, normalizeProducts } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import type { PaginatedResponse } from "@/types";
import type { Product } from "@/types/product";
import type { Filter } from "../types";

const PAGE_SIZE = 24;
const SEARCH_RESULTS_LIMIT = 6;

export async function getProducts(
  page: number,
  filters: Record<string, string>
): Promise<PaginatedResponse<Product>> {
  const qs = buildQueryParams({ page, page_size: PAGE_SIZE, ...filters });
  const res = await apiClient<PaginatedResponse<Product>>(`/products/${qs}`, { revalidate: 60 });
  if (!res.ok) return { count: 0, next: null, previous: null, results: [] };
  return {
    ...res.data,
    results: (res.data.results ?? []).map(normalizeProduct)
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Fast endpoint with fuzzy + category search
  const params = new URLSearchParams({ q: trimmed, page_size: String(SEARCH_RESULTS_LIMIT) });
  const res = await apiClient<Product[]>(`/products/search/?${params}`);
  if (res.ok) return normalizeProducts(res.data);

  // Fallback: existing list endpoint — works even before server restart
  // search_fields now includes categories__name so this also finds products by category
  const fallbackQs = buildQueryParams({ search: trimmed, page_size: SEARCH_RESULTS_LIMIT });
  const fallback = await apiClient<PaginatedResponse<Product>>(`/products/${fallbackQs}`);
  if (!fallback.ok) return [];
  return (fallback.data.results ?? []).map(normalizeProduct);
}

export async function searchProductsByTag(categorySlug: string): Promise<Product[]> {
  const slug = categorySlug.trim();
  if (!slug) return [];

  // Fast endpoint: tag (category slug) based search
  const params = new URLSearchParams({ tag: slug, page_size: String(SEARCH_RESULTS_LIMIT) });
  const res = await apiClient<Product[]>(`/products/search/?${params}`);
  if (res.ok) return normalizeProducts(res.data);

  // Fallback: filter by category slug using existing endpoint
  const fallbackQs = buildQueryParams({ category_slug: slug, page_size: SEARCH_RESULTS_LIMIT });
  const fallback = await apiClient<PaginatedResponse<Product>>(`/products/${fallbackQs}`);
  if (!fallback.ok) return [];
  return (fallback.data.results ?? []).map(normalizeProduct);
}

export async function getProductFilters(
  categorySlug?: string
): Promise<Filter[]> {
  const qs = buildQueryParams(categorySlug ? { category_slug: categorySlug } : {});
  const res = await apiClient<PaginatedResponse<Filter>>(`/filters/${qs}`, { revalidate: 60 });
  if (!res.ok) return [];
  return res.data.results ?? [];
}
