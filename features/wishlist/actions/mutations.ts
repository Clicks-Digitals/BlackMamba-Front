"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api/";

export async function addToWishlistAction(productId: string) {
  const res = await apiClient("/wishlist/add-product/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId })
  });

  if (res.ok) {
    return { ok: true, message: res.message ?? "Added to wishlist." };
  }

  return { ok: false, message: res.message ?? "Could not add to wishlist." };
}

export async function removeFromWishlistAction(productId: string) {
  const res = await apiClient("/wishlist/remove-product/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId })
  });

  if (res.ok) {
    revalidatePath("/favourites");
    return { ok: true, message: res.message ?? "Removed from wishlist." };
  }

  return { ok: false, message: res.message ?? "Could not remove from wishlist." };
}
