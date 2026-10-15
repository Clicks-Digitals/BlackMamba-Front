"use server";

import { apiClient } from "@/lib/api";
import type { Order } from "@/types/order";

/**
 * S2: a guest can check out now, so they need a way back to the order.
 *
 * The backend answers the same way for an unknown number and a wrong
 * email, so there is nothing here to tell them apart either.
 */
export async function trackOrderAction(
  _prev: { status: "idle" | "found" | "error"; message: string; order: Order | null },
  formData: FormData
): Promise<{ status: "idle" | "found" | "error"; message: string; order: Order | null }> {
  const order_number = String(formData.get("order_number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!order_number || !email) {
    return {
      status: "error",
      message: "Enter both your order number and the email you used.",
      order: null,
    };
  }

  const res = await apiClient<Order>("/orders/track/", {
    method: "POST",
    body: JSON.stringify({ order_number, email }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok || !res.data) {
    return {
      status: "error",
      message:
        res.message || "We could not find an order with that number and email.",
      order: null,
    };
  }

  return { status: "found", message: "", order: res.data };
}
