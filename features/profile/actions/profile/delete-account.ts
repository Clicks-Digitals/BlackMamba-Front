"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";

/**
 * Close the signed-in customer's account.
 *
 * There was no way for a customer to do this at all — staff had to do it for
 * them. Orders survive: the order's user is SET_NULL, so the store keeps the
 * records it needs for accounting while the person's profile goes.
 */
export async function deleteAccountAction(): Promise<{ ok: boolean; message: string }> {
  const res = await apiClient<unknown>("/users/me/", { method: "DELETE" });

  if (!res.ok) {
    return {
      ok: false,
      message: res.message || "We couldn't close your account. Please try again.",
    };
  }

  // The session is meaningless now; clear it so the browser is not left
  // holding a token for an account that no longer exists.
  const store = await cookies();
  for (const name of ["token", "role", "cart_token", "pc_build_token"]) {
    store.delete(name);
  }

  return { ok: true, message: "Your account has been closed." };
}
