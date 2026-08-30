"use server";

import { apiClient } from "@/lib/api/client";
import type { Address } from "@/types";

export async function getAddresses(): Promise<Address[] | null> {
  const res = await apiClient<Address[]>("/users/addresses/");
  if (res.status === 401 || res.status === 403) return null; // token invalid/expired
  if (!res.ok) return [];
  return Array.isArray(res.data) ? res.data : [];
}
