"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api/client";
import type { ActionState } from "@/types";

export async function deleteAddressAction(id: string): Promise<ActionState> {
  const res = await apiClient(`/users/addresses/${id}/`, { method: "DELETE" });

  if (!res.ok) {
    return { status: "error", message: res.message || "Failed to delete address." };
  }

  revalidatePath("/profile");

  return { status: "success", message: "Address deleted successfully." };
}
