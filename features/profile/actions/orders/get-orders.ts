"use server";

import { apiClient } from "@/lib/api/client";
import { buildQueryParams } from "@/lib/utils";
import type { PaginatedResponse, Order } from "@/types";

const PAGE_SIZE = 10;

export async function getOrders(
  page: number,
  filters: Record<string, string>
): Promise<PaginatedResponse<Order>> {
  const qs = buildQueryParams({ page, page_size: PAGE_SIZE, ...filters });
  const res = await apiClient<PaginatedResponse<Order>>(`/orders/${qs}`);
  if (!res.ok)
    return { count: 0, results: [], total_pages: 0, next: null, previous: null };
  return res.data;
}
