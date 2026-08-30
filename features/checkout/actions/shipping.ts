"use server";

import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { ShippingOption } from "@/features/checkout/types";

export async function getShippingOptions(): Promise<ShippingOption[]> {
  const res = await apiClient<PaginatedResponse<ShippingOption>>("/logistics/shipping-options/", {
    method: "GET"
  });

  if (!res.ok) {
    console.error("Failed to fetch shipping options:", res.message);
    return [];
  }

  return res.data.results ?? [];
}
