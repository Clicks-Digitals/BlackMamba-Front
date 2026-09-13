"use server";

import { apiClient } from "@/lib/api";
import { getProducts } from "@/features/products";
import { findShowcaseBrand } from "../data/showcase";
import type { Brand } from "../types";

function fromShowcase(slug: string): Brand | null {
  const entry = findShowcaseBrand(slug);
  if (!entry) return null;
  return {
    id: entry.slug,
    name: entry.name,
    name_ar: null,
    slug: entry.slug,
    description: null,
    description_ar: null,
    logo: entry.logo,
    logo_url: entry.logo,
    banner_image: null,
    banner_image_url: null,
    tagline: null,
    tagline_ar: null,
    website: entry.website,
    categories: [],
    is_active: true,
    display_order: 0,
  };
}

export async function getBrandBySlugAction(slug: string): Promise<Brand | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  const res = await apiClient<Brand>(`/categories/brands/${key}/`, { revalidate: 300 });
  if (res.ok && res.data) {
    const data = res.data;
    const showcase = findShowcaseBrand(key);
    return {
      ...data,
      slug: data.slug || key,
      logo: data.logo_url || data.logo || showcase?.logo || null,
      logo_url: data.logo_url || data.logo || showcase?.logo || null,
      website: data.website || showcase?.website || null,
      categories: data.categories ?? [],
    };
  }

  const known = fromShowcase(key);
  if (known) return known;

  const products = await getProducts(1, { search: key });
  if (products.count <= 0) return null;

  return {
    id: key,
    name: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    name_ar: null,
    slug: key,
    description: null,
    description_ar: null,
    logo: null,
    logo_url: null,
    banner_image: null,
    banner_image_url: null,
    tagline: null,
    tagline_ar: null,
    website: null,
    categories: [],
    is_active: true,
    display_order: 0,
  };
}
