"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api/client";
import type { ActionState, Address } from "@/types";

export async function setDefaultAddressAction(id: string): Promise<ActionState<never, Address>> {
  const res = await apiClient<Address>(`/users/addresses/${id}/set-default/`, {
    method: "POST",
  });

  if (!res.ok) {
    return { status: "error", message: res.message || "Failed to set default address." };
  }

  revalidatePath("/profile");

  return { status: "success", message: "Default address updated.", data: res.data };
}
