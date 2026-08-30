"use server";

import { apiClient } from "@/lib/api/client";
import type { User } from "@/types";

export async function getProfileAction(): Promise<{ user: User; unauthorized: false } | { user: null; unauthorized: boolean }> {
  const res = await apiClient<User>("/users/me/");
  if (!res.ok) return { user: null, unauthorized: res.status === 401 || res.status === 500 };
  return { user: res.data, unauthorized: false };
}
