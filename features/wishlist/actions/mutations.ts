"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { apiClient } from "@/lib/api/";

// The API's envelope says "Request completed successfully." on success, so the
// success message is our own; errors keep the server's wording.

export async function addToWishlistAction(productId: string) {
  const t = await getTranslations("Wishlist.messages");
  const res = await apiClient("/wishlist/add-product/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId })
  });

  if (res.ok) {
    return { ok: true, message: t("added") };
  }

  return { ok: false, message: res.message ?? t("addFailed") };
}

export async function removeFromWishlistAction(productId: string) {
  const t = await getTranslations("Wishlist.messages");
  const res = await apiClient("/wishlist/remove-product/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId })
  });

  if (res.ok) {
    revalidatePath("/favourites");
    return { ok: true, message: t("removed") };
  }

  return { ok: false, message: res.message ?? t("removeFailed") };
}
