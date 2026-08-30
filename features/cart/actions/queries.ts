"use server";

import { apiClient } from "@/lib/api";
import type { Cart } from "@/features/cart";

export async function getMyCart(): Promise<Cart | null> {
  const res = await apiClient<Cart>("/cart/my-cart/");
  if (!res.ok) return null;
  return res.data;
}
