"use server";

import { apiClient } from "@/lib/api/client";
import { normalizeProduct, normalizeProducts } from "@/lib/api/normalize-product";
import type { Product } from "@/types";
import { PRODUCTS_TAG } from "@/lib/api/cache-tags";

export async function getProduct(slug: string) {
  const res = await apiClient<Product>(`/products/${slug}/`, { revalidate: 60 });
  if (!res.ok) return res;
  return { ...res, data: normalizeProduct(res.data) };
}

export async function getRelatedProducts(slug: string) {
  // Tagged so removing any product also expires every product's
  // recommendations, not just its own page.
  const res = await apiClient<Product[]>(`/products/${slug}/recommend/`, {
    revalidate: 60,
    tags: [PRODUCTS_TAG],
  });
  if (!res.ok) return res;
  return { ...res, data: normalizeProducts(res.data) };
}
