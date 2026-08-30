"use server";

import { apiClient, normalizeProducts } from "@/lib/api";
import type { Wishlist } from "@/features/wishlist";

export async function getWishlist(): Promise<Wishlist[]> {
  const res = await apiClient<Wishlist[]>("/wishlist/");
  if (!res.ok) return [];
  return (res.data ?? []).map((list) => ({
    ...list,
    products: normalizeProducts(list.products)
  }));
}
