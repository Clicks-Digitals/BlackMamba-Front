export type ProductReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProductReview {
  id: string;
  product: string;
  product_name: string;
  /** Author user id (API returns this for ownership checks). */
  user_id?: string;
  user: string;
  user_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: ProductReviewStatus;
  created_at: string;
  updated_at: string;
}
