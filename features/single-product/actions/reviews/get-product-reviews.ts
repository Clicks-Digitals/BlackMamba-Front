"use server";

import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ProductReview } from "@/types";

/** Paginated reviews for one product: only `page`, `page_size`, and `product` query params (no search / extra filters). */
export async function getProductReviews(
  page: number,
  productId: string
): Promise<PaginatedResponse<ProductReview>> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: "8",
    product: productId,
  });

  const res = await apiClient<PaginatedResponse<ProductReview>>(
    `/products/reviews/?${params.toString()}`
  );

  if (!res.ok) {
    return {
      count: 0,
      results: [],
      next: null,
      previous: null,
      total_pages: 0,
      current_page: page,
    };
  }

  return res.data;
}
