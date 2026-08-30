"use server";

import { apiClient } from "@/lib/api";
import { formDataToObject, validateData } from "@/lib/utils";
import type { ActionState, ProductReview } from "@/types";
import { reviewFormSchema, type ReviewFormData } from "@/features/single-product";

export async function updateReviewAction(
  reviewId: string,
  _prev: ActionState<ReviewFormData, ProductReview>,
  formData: FormData
): Promise<ActionState<ReviewFormData, ProductReview>> {
  const raw = formDataToObject(formData);
  const validated = validateData(reviewFormSchema, raw);
  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof ReviewFormData | string, string[]>>,
      inputs: raw as unknown as Partial<ReviewFormData>,
    };
  }

  const res = await apiClient<ProductReview>(`/products/reviews/${reviewId}/`, {
    method: "PATCH",
    body: JSON.stringify(validated.data),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Could not update your review.",
      inputs: raw as unknown as Partial<ReviewFormData>,
    };
  }

  return {
    status: "success",
    message: res.message || "Review updated.",
    data: res.data,
  };
}
