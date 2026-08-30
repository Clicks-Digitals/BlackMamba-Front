import { z } from "zod";

/** Message strings are i18n keys under `SingleProduct.validation`. */
export const reviewFormSchema = z
  .object({
    product: z.uuid("validation.productInvalid"),
    rating: z.coerce.number().int().min(1, "validation.ratingMin").max(5, "validation.ratingMax"),
    title: z
      .string()
      .max(255, "validation.titleMax")
      .optional()
      .transform((s) => {
        const trimmed = s?.trim();
        return trimmed === "" ? undefined : trimmed;
      }),
    body: z.string().min(1, "validation.bodyRequired").max(8000, "validation.bodyMax"),
  })
  .transform((data) => ({
    ...data,
    title: data.title ?? null,
  }));

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

export type CreateReviewFormData = ReviewFormData;
