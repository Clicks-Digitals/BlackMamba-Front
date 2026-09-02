"use server";

import { apiClient } from "@/lib/api/client";
import { extractList } from "@/lib/api/extract-list";
import { normalizeCategories } from "@/lib/api/normalize-category";
import { normalizeBanners, normalizeHomeSections, normalizeSwipers } from "@/lib/api/normalize-home";
import type { Category } from "@/types/category";
import type { PaginatedResponse } from "@/types/api";
import type { HomeBanner, HomeBrand, HomeLayoutSection, HomeSection, HomeSponsor, HomeSwiperSlide, HomeTestimonial } from "../types";
import type { Campaign } from "@/types/campaign";

export async function getFeaturedCategories(): Promise<Category[]> {
  const res = await apiClient<unknown>("/categories/?featured=true");
  if (!res.ok) return [];
  const cats = normalizeCategories(res.data);
  return cats.filter((c) => c.is_featured).length ? cats.filter((c) => c.is_featured) : cats;
}

export async function getNavCategories(): Promise<Category[]> {
  const featured = await getFeaturedCategories();
  if (featured.length) return featured;
  const res = await apiClient<unknown>("/categories/?page_size=100");
  if (!res.ok) return [];
  return normalizeCategories(res.data).filter((c) => !c.parent).slice(0, 12);
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const res = await apiClient<unknown>("/categories/?page_size=100");
  if (!res.ok) return [];
  return normalizeCategories(res.data);
}

export async function getHomeSwipers(): Promise<HomeSwiperSlide[]> {
  const res = await apiClient<unknown>("/swipers/");
  if (!res.ok) return [];
  return normalizeSwipers(res.data);
}

export async function getHomeSections(): Promise<HomeSection[]> {
  const res = await apiClient<unknown>("/sections/");
  if (!res.ok) return [];
  return normalizeHomeSections(res.data);
}

export async function getSponsors(): Promise<HomeSponsor[]> {
  const res = await apiClient<PaginatedResponse<HomeSponsor>>("/cms/sponsors/");
  if (!res.ok) return [];
  return extractList<HomeSponsor>(res.data).filter((s) => s.is_active && (s.image_url || s.image));
}

export async function getBrands(categoryId?: string | number): Promise<HomeBrand[]> {
  const url = categoryId
    ? `/categories/brands/?page_size=100&category=${categoryId}`
    : `/categories/brands/?page_size=100`;
  const res = await apiClient<PaginatedResponse<HomeBrand>>(url);
  if (!res.ok) return [];
  return extractList<HomeBrand>(res.data).filter((b) => b.is_active !== false);
}

/** Brands for the home “Shop by Brand” rail. Falls back to a showcase list if the API is empty. */
export async function getShopByBrands(): Promise<HomeBrand[]> {
  const categories = await getFeaturedCategories();
  const merged = new Map<string, HomeBrand>();

  await Promise.all(
    categories.slice(0, 8).map(async (cat) => {
      const list = await getBrands(cat.id);
      for (const brand of list) {
        const key = brand.slug || brand.id;
        if (key && !merged.has(key)) merged.set(key, brand);
      }
    })
  );

  if (merged.size > 0) {
    return Array.from(merged.values()).map((brand) => withLocalBrandLogo(brand));
  }

  // API currently requires a category and often returns empty — keep a visible showcase.
  const showcase: { name: string; slug: string; logo: string }[] = [
    { name: "AMD", slug: "amd", logo: "/brands/amd.svg" },
    { name: "Intel", slug: "intel", logo: "/brands/intel.svg" },
    { name: "NVIDIA", slug: "nvidia", logo: "/brands/nvidia.svg" },
    { name: "ASUS", slug: "asus", logo: "/brands/asus.svg" },
    { name: "MSI", slug: "msi", logo: "/brands/msi.svg" },
    { name: "Corsair", slug: "corsair", logo: "/brands/corsair.svg" },
    { name: "Logitech", slug: "logitech", logo: "/brands/logitech.svg" },
    { name: "Samsung", slug: "samsung", logo: "/brands/samsung.svg" },
    { name: "Kingston", slug: "kingston", logo: "/brands/kingston.svg" },
    { name: "Razer", slug: "razer", logo: "/brands/razer.svg" },
    { name: "Cooler Master", slug: "cooler-master", logo: "/brands/coolermaster.svg" },
  ];

  return showcase.map((entry, index) => ({
    id: `showcase-${entry.slug}`,
    name: entry.name,
    name_ar: entry.name,
    slug: entry.slug,
    description: null,
    description_ar: null,
    logo: entry.logo,
    logo_url: entry.logo,
    website: null,
    categories: [],
    is_active: true,
    display_order: index,
    created_at: "",
    updated_at: "",
  }));
}

const LOCAL_BRAND_LOGOS: Record<string, string> = {
  amd: "/brands/amd.svg",
  intel: "/brands/intel.svg",
  nvidia: "/brands/nvidia.svg",
  asus: "/brands/asus.svg",
  msi: "/brands/msi.svg",
  corsair: "/brands/corsair.svg",
  logitech: "/brands/logitech.svg",
  samsung: "/brands/samsung.svg",
  kingston: "/brands/kingston.svg",
  razer: "/brands/razer.svg",
  "cooler-master": "/brands/coolermaster.svg",
  coolermaster: "/brands/coolermaster.svg",
};

function withLocalBrandLogo(brand: HomeBrand): HomeBrand {
  if (brand.logo_url || brand.logo) return brand;
  const key = (brand.slug || brand.name || "").toLowerCase().replace(/\s+/g, "-");
  const local = LOCAL_BRAND_LOGOS[key] || LOCAL_BRAND_LOGOS[key.replace(/-/g, "")];
  if (!local) return brand;
  return { ...brand, logo: local, logo_url: local };
}

export async function getHomeBanners(): Promise<HomeBanner[]> {
  const res = await apiClient<unknown>("/banners/");
  if (!res.ok) return [];
  return normalizeBanners(res.data);
}

export async function getHomeLayout(): Promise<HomeLayoutSection[]> {
  const res = await apiClient<PaginatedResponse<HomeLayoutSection>>("/cms/home-layout/");
  if (!res.ok) return [];
  return (res.data.results ?? []).sort((a, b) => a.order - b.order);
}

export type FeaturedCoupon = {
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: string;
  minimum_order_amount: string | null;
  valid_until: string | null;
};

export async function getFeaturedCoupon(): Promise<FeaturedCoupon | null> {
  const res = await apiClient<FeaturedCoupon>("/promotions/coupons/featured/", { revalidate: 300 });
  if (!res.ok || !res.data) return null;
  return res.data;
}

export async function getHomeTestimonials(): Promise<HomeTestimonial[]> {
  const res = await apiClient<PaginatedResponse<HomeTestimonial>>("/testimonials/");
  if (!res.ok) return [];
  return res.data.results ?? [];
}

export type OfferSection = {
  id: string;
  text: string;
  text_ar: string | null;
  link: string | null;
  is_active: boolean;
  order: number;
};

/** All active announcement/offer bar entries (already filtered & ordered by the CMS). */
export async function getActiveOffers(): Promise<OfferSection[]> {
  const res = await apiClient<PaginatedResponse<OfferSection>>("/cms/offer-sections/", { revalidate: 300 });
  if (!res.ok) return [];
  return res.data.results ?? [];
}

/** Currently-live campaigns for the carousel (backend filters by is_active + date range). */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  const res = await apiClient<PaginatedResponse<Campaign>>("/cms/campaigns/", { revalidate: 60 });
  if (!res.ok) return [];
  return res.data.results ?? [];
}
