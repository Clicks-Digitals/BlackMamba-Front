"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";

export async function logoutAction() {
  const cookieStore = await cookies();

  try {
    await apiClient("/accounts/auth/logout/");
  } catch {
    // Continue with clearing cookies even if API call fails
  } finally {
    cookieStore.delete("token");
    cookieStore.delete("role");
    cookieStore.delete("cart_token");
    cookieStore.delete("pc_build_token");
  }
}
