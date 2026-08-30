import type { Category } from "@/types/category";
import { extractList, isBlankParent } from "./extract-list";

type RawCategory = Partial<Category> & {
  id: string | number;
  featured?: boolean;
  image?: string | null;
  image_url?: string | null;
  parent?: string | number | null;
};

export function normalizeCategory(raw: RawCategory): Category {
  const image = raw.image_url || raw.image || "";
  return {
    ...(raw as Category),
    id: String(raw.id),
    name: raw.name ?? "",
    name_ar: raw.name_ar ?? "",
    slug: raw.slug ?? "",
    description: raw.description ?? "",
    description_ar: raw.description_ar ?? "",
    image,
    image_url: image,
    parent: isBlankParent(raw.parent) ? "" : String(raw.parent),
    parent_name: raw.parent_name ?? "",
    is_active: raw.is_active ?? true,
    is_featured: raw.is_featured ?? raw.featured ?? false,
    is_nav: raw.is_nav ?? false,
    display_order: raw.display_order ?? 0,
    brands: raw.brands ?? "",
    created_at: raw.created_at ?? "",
    updated_at: raw.updated_at ?? ""
  };
}

export function normalizeCategories(raw: unknown): Category[] {
  return extractList<RawCategory>(raw).map(normalizeCategory);
}
