"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api/client";
import type { ActionState, Order } from "@/types";

export async function cancelOrderAction(
  id: string
): Promise<ActionState<never, Order>> {
  const res = await apiClient<Order>(`/orders/${id}/cancel/`, {
    method: "POST",
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to cancel order.",
    };
  }

  revalidatePath("/profile");

  return {
    status: "success",
    message: "Order cancelled successfully.",
    data: res.data,
  };
}
