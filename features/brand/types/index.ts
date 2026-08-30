export interface BrandCategory {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  image_url: string | null;
}

export interface Brand {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  logo: string | null;
  logo_url: string | null;
  banner_image: string | null;
  banner_image_url: string | null;
  tagline: string | null;
  tagline_ar: string | null;
  website: string | null;
  categories: BrandCategory[];
  is_active: boolean;
  display_order: number;
}
