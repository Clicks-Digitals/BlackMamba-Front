export interface Campaign {
  id: string;
  name: string;
  name_ar: string | null;
  subtitle: string;
  subtitle_ar: string;
  image: string | null;
  image_url: string | null;
  starts_at: string;
  ends_at: string;
  cta_label: string;
  cta_label_ar: string;
  cta_url: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: string;
  is_active: boolean;
  is_live: boolean;
  display_order: number;
  applicable_categories: { id: string; name: string }[];
  applicable_brands: { id: string; name: string }[];
  applicable_products: { id: string; name: string }[];
}
