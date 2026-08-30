"use server";

import { apiClient } from "@/lib/api";
import type { ActionState } from "@/types";

export async function deleteReviewAction(reviewId: string): Promise<ActionState> {
  const res = await apiClient<unknown>(`/products/reviews/${reviewId}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Could not delete the review.",
    };
  }

  return { status: "success", message: "Review deleted." };
}
