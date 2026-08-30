import { apiClient } from "@/lib/api/client";
import { PaginatedResponse } from "@/types";
import { Offer } from "@/types/offer";

export async function getOfferSections(): Promise<Offer[]> {
  const res = await apiClient<PaginatedResponse<Offer>>("/cms/offer-sections/");
  if (!res.ok) return [];
  return res.data?.results ?? [];
}
