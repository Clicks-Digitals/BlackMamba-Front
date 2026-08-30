"use server";

import { apiClient } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import type { PaginatedResponse } from "@/types";
import type { SupportTicket } from "@/features/profile";

const PAGE_SIZE = 10;

export async function getSupportTickets(
  page: number,
  filters: Record<string, string>
): Promise<PaginatedResponse<SupportTicket>> {
  const qs = buildQueryParams({ page, page_size: PAGE_SIZE, ...filters });
  const res = await apiClient<PaginatedResponse<SupportTicket>>(`/support/${qs}`);
  if (!res.ok) {
    return { count: 0, results: [], total_pages: 0, next: null, previous: null };
  }
  return res.data;
}
