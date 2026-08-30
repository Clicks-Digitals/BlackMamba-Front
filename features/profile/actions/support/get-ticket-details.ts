"use server";

import { apiClient } from "@/lib/api";
import type { SupportTicket } from "@/features/profile";

export async function getSupportTicketDetails(ticketId: string): Promise<SupportTicket | null> {
  const res = await apiClient<SupportTicket>(`/support/${ticketId}/`);
  if (!res.ok) return null;
  return res.data;
}
