import type { HomeBanner, HomeSection, HomeSwiperSlide } from "@/features/home/types";
import { extractList } from "./extract-list";
import { normalizeProducts } from "./normalize-product";

type RawSwiper = Partial<HomeSwiperSlide> & {
  id: string | number;
  image?: string | null;
  image_url?: string | null;
};

export function normalizeSwiper(raw: RawSwiper): HomeSwiperSlide {
  const image = raw.image_url || raw.image || "";
  const active = raw.active ?? raw.is_active ?? true;
  return {
    ...(raw as HomeSwiperSlide),
    id: String(raw.id),
    title: raw.title ?? "",
    title_ar: raw.title_ar ?? "",
    subtitle: raw.subtitle ?? "",
    subtitle_ar: raw.subtitle_ar ?? "",
    image,
    image_url: image,
    icon: raw.icon ?? "",
    icon_url: raw.icon_url || raw.icon || "",
    button_text: raw.button_text ?? "",
    button_text_ar: raw.button_text_ar ?? "",
    link: raw.link || null,
    media_type: raw.media_type || "image",
    order: raw.order ?? 0,
    active,
    is_active: active,
    created_at: raw.created_at ?? "",
    updated_at: raw.updated_at ?? ""
  };
}

type RawBanner = Partial<HomeBanner> & {
  id: string | number;
  image?: string | null;
  is_active?: boolean;
};

export function normalizeBanner(raw: RawBanner): HomeBanner {
  const file = raw.file_url || raw.file || raw.image || "";
  const active = raw.active ?? raw.is_active ?? true;
  return {
    ...(raw as HomeBanner),
    id: String(raw.id),
    title: raw.title ?? null,
    title_ar: raw.title_ar ?? null,
    subtitle: raw.subtitle ?? null,
    subtitle_ar: raw.subtitle_ar ?? null,
    media_type: raw.media_type || "image",
    size: raw.size || "compact",
    file: file || null,
    file_url: file,
    link: raw.link || null,
    button_text: raw.button_text ?? null,
    button_text_ar: raw.button_text_ar ?? null,
    active,
    order: raw.order ?? 0,
    created_at: raw.created_at ?? "",
    updated_at: raw.updated_at ?? ""
  };
}

type RawSection = Partial<HomeSection> & {
  id: string | number;
  products?: unknown;
};

export function normalizeHomeSection(raw: RawSection): HomeSection {
  return {
    ...(raw as HomeSection),
    id: String(raw.id),
    title: raw.title ?? "",
    title_ar: raw.title_ar ?? "",
    order: raw.order ?? 0,
    is_active: raw.is_active ?? true,
    products: normalizeProducts(raw.products),
    created_at: raw.created_at ?? "",
    updated_at: raw.updated_at ?? ""
  };
}

export function normalizeSwipers(raw: unknown): HomeSwiperSlide[] {
  return extractList<RawSwiper>(raw)
    .map(normalizeSwiper)
    .filter((s) => s.is_active && s.image_url)
    .sort((a, b) => a.order - b.order);
}

export function normalizeBanners(raw: unknown): HomeBanner[] {
  return extractList<RawBanner>(raw)
    .map(normalizeBanner)
    .filter((b) => b.active && b.file_url)
    .sort((a, b) => a.order - b.order);
}

export function normalizeHomeSections(raw: unknown): HomeSection[] {
  return extractList<RawSection>(raw)
    .map(normalizeHomeSection)
    .filter((s) => s.is_active && s.products.length)
    .sort((a, b) => a.order - b.order);
}
