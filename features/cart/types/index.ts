import type { Product } from "@/types";
import type { PCBuild } from "@/features/pc-builder/types";

export interface CartVariationDetails {
  id: string;
  product: string;
  sku: string;
  variation_price: string | null;
  variation_stock: number;
  is_available: boolean;
  attribute_names: string;
  image: string | null;
  image_url: string;
  variation_price_display: string;
}

export interface CartCombinationDetails {
  id: string;
  product: string;
  sku: string;
  variations: string[];
  is_available: boolean;
  image: string | null;
  combination_price: string | null;
  combination_stock: number;
}

export interface CartItem {
  id: string;
  cart: string | null;
  // Exactly one of (product) or (build) is set — a build line item has no single product.
  product: string | null;
  variation: string | null;
  combination: string | null;
  build: string | null;
  quantity: number;
  price_at_time: string;
  total_price: string;
  product_details: Product | null;
  variation_details: CartVariationDetails | null;
  combination_details: CartCombinationDetails | null;
  build_details: PCBuild | null;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user: string | null;
  cart_token: string | null;
  items: CartItem[];
  total_amount: string;
  currency_info: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
