"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api";
import type { ActionState } from "@/types";
import type { Cart, CartItem } from "@/features/cart/types";

export interface SharedCart {
  slug: string;
  items: CartItem[];
  total_amount: string;
}

/** A short link to a copy of the current cart. */
export async function shareCartAction(): Promise<ActionState<never, { slug: string }>> {
  const res = await apiClient<{ slug: string }>("/cart/share/", { method: "POST" });
  if (res.ok && res.data) return { status: "success", message: "", data: res.data };
  return { status: "error", message: res.message ?? "Could not share the cart." };
}

/** What a shared cart holds, at today's prices. */
export async function getSharedCart(slug: string): Promise<SharedCart | null> {
  const res = await apiClient<SharedCart>(`/cart/shared/${encodeURIComponent(slug)}/`, { cache: "no-store" });
  return res.ok && res.data ? res.data : null;
}

/** Put a shared cart's items into the visitor's own cart. */
export async function addSharedCartAction(
  slug: string
): Promise<ActionState<never, { count: number; skipped: number }>> {
  const res = await apiClient<Cart & { skipped: number }>(
    `/cart/shared/${encodeURIComponent(slug)}/add/`,
    { method: "POST" }
  );
  if (res.ok && res.data) {
    revalidatePath("/cart");
    return {
      status: "success",
      message: "",
      data: { count: res.data.items.length, skipped: res.data.skipped ?? 0 },
    };
  }
  return { status: "error", message: res.message ?? "Could not add these items to your cart." };
}
