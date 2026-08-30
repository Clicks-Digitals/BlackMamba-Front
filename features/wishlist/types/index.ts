import type { Product } from "@/types/product";

export interface Wishlist {
  id: string;
  user: string;
  product_ids: string[];
  products: Product[];
  created_at: string;
  updated_at: string;
}
