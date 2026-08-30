import type { Product } from "@/types/product";

export interface HomeSwiperSlide {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  image: string;
  image_url: string;
  icon: string;
  icon_url: string;
  button_text: string;
  button_text_ar: string;
  link: string | null;
  media_type: "image" | "video";
  order: number;
  active: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeSection {
  id: string;
  title: string;
  title_ar: string;
  order: number;
  is_active: boolean;
  products: Product[];
  created_at: string;
  updated_at: string;
}

/** Matches Sponsor schema from /api/cms/sponsors/ */
export interface HomeSponsor {
  id: string;
  name: string;
  name_ar: string | null;
  image: string;
  image_url: string;
  link: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Matches BannerSwiper schema from /api/cms/banners/ */
export interface HomeBanner {
  id: string;
  title: string | null;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  media_type: "image" | "video";
  size: "compact" | "standard" | "tall";
  file: string | null;
  file_url: string;
  link: string | null;
  button_text: string | null;
  button_text_ar: string | null;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

/** Matches Brand schema from /api/categories/brands/ */
export interface HomeBrand {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  logo: string | null;
  logo_url: string;
  website: string | null;
  categories: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type HomeSectionKey =
  | "hero"
  | "trust_bar"
  | "campaigns"
  | "categories"
  | "product_sections"
  | "promo_split"
  | "black_mamba"
  | "promo_banner"
  | "top_brands"
  | "shop_by_brand";

export interface HomeLayoutSection {
  id: string;
  key: HomeSectionKey;
  label: string;
  order: number;
  is_visible: boolean;
}

export interface HomeTestimonial {
  id?: string;
  user_name: string;
  title: string;
  content: string;
  rating: number;
  created_at?: string;
}
