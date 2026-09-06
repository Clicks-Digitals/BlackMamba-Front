export interface ProductTableRow {
  id: string;
  feature: string;
  feature_ar: string | null;
  values: string[];
  order: number;
}

export interface ProductTable {
  id: string;
  title: string | null;
  title_ar: string | null;
  columns: string[];
  columns_ar: string[] | null;
  rows: ProductTableRow[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  logo_url: string;
  website: string | null;
}

export type gallaryItem = {
  id: string;
  product: string;
  file: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  file_type: "IMAGE" | "VIDEO";
};

export interface VariationOption {
  variation_id: string;
  value: string;
  value_ar: string | null;
  sku: string;
  variation_price: string;
  image: string | null;
  color_code?: string | null;
}

export interface VariationGroup {
  name: string;
  name_ar: string | null;
  options: VariationOption[];
}

export interface CombinationSelectedOption {
  attribute: string;
  attribute_ar: string | null;
  value: string;
  value_ar: string | null;
}

export interface Combination {
  id: string;
  sku: string;
  variation_ids: string[];
  selected_options: CombinationSelectedOption[];
  is_available: boolean;
  stock_quantity: number;
  combination_stock: number;
  combination_price: string | null;
  image: string | null;
}

export interface ProductVariantSibling {
  id: string;
  name: string;
  slug: string;
  variant_label: string;
  thumbnail: string | null;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  /** Mean rating from approved reviews (product list/card serializers). */
  avg_rating?: number | null;
  /** Approved review count (product list/card serializers). */
  review_count?: number;
  thumbnail: string | null;
  description: string | null;
  description_ar: string | null;
  overview: string | null;
  overview_ar: string | null;
  features: unknown;
  features_ar: unknown;
  base_price: string | null;
  discount_price: string | null;
  has_discount: boolean;
  is_available: boolean;
  best_seller: boolean;
  clearance_sale: boolean;
  clearance_sale_start: string | null;
  clearance_sale_end: string | null;
  created_at: string;
  updated_at: string;
  categories: CategoryInfo[];
  brand: ProductBrand | null;
  gallery: gallaryItem[];
  inventory_mode: "TRACK" | "TOGGLE" | "TRACK_VARIATIONS" | null;
  product_stock: number | null;
  in_stock: boolean;
  currency_info: { code: string; symbol: string } | null;
  available_variations: VariationGroup[];
  available_combinations: Combination[];
  table: ProductTable | null;
  variant_group: { id: string; name: string; display_label: string } | null;
  variant_label: string;
  variants: ProductVariantSibling[];
  campaign_price: string | null;
  active_campaign: {
    name: string;
    name_ar: string | null;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: string;
  } | null;
  meta_title: string | null;
  meta_title_ar: string | null;
  meta_description: string | null;
  meta_description_ar: string | null;
  meta_keywords: string[] | null;
  meta_keywords_ar: string[] | null;
  og_image: string | null;
  canonical_url: string | null;
  meta_robots: "index,follow" | "noindex,follow" | "index,nofollow" | "noindex,nofollow";
}
