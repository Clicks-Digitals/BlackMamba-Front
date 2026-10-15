import "server-only";

import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { Testimonial } from "@/features/testimonials/types";

/**
 * T4: staff could approve testimonials in the panel, but /testimonials was a
 * 404, so an approved one went nowhere.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await apiClient<PaginatedResponse<Testimonial>>(
    "/testimonials/?page_size=60&ordering=-created_at",
    { revalidate: 300 }
  );
  return res.ok && res.data ? res.data.results : [];
}
