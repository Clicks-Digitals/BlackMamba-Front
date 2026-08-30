"use server";

import { apiClient } from "@/lib/api";
import type { Brand } from "../types";

export async function getBrandBySlugAction(slug: string): Promise<Brand | null> {
  const res = await apiClient<Brand>(`/categories/brands/${slug}/`, { revalidate: 300 });
  if (!res.ok) return null;
  return res.data;
}
