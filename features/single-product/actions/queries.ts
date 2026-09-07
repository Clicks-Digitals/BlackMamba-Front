"use server";

import { apiClient } from "@/lib/api/client";
import { normalizeProduct, normalizeProducts } from "@/lib/api/normalize-product";
import type { Product } from "@/types";
import { DEMO_PRODUCT, DEMO_PRODUCT_SLUG } from "../data/demo-product";

export async function getProduct(slug: string) {
  if (slug === DEMO_PRODUCT_SLUG) {
    return { ok: true as const, data: DEMO_PRODUCT, status: 200 };
  }

  const res = await apiClient<Product>(`/products/${slug}/`, { revalidate: 60 });
  if (!res.ok) return res;
  return { ...res, data: normalizeProduct(res.data) };
}

export async function getRelatedProducts(slug: string) {
  const res = await apiClient<Product[]>(`/products/${slug}/recommend/`, { revalidate: 60 });
  if (!res.ok) return res;
  return { ...res, data: normalizeProducts(res.data) };
}
