import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getStorefrontCategories, getBrands } from "@/features/home";
import { getProductFilters, getProducts, ProductsView } from "@/features/products";
import { findCategoryBySlug } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Products");
  return { title: t("title") };
}

const DEFAULT_SORT = "-created_at";

type SearchParamsShape = {
  category_slug?: string | string[];
  ordering?: string | string[];
  search?: string | string[];
  filter_values?: string | string[];
  new_release?: string | string[];
  clearance_sale?: string | string[];
  brand_slug?: string | string[];
};

function first(v: string | string[] | undefined): string | undefined {
  return v ? (Array.isArray(v) ? v[0] : v) : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;
  const rawSlug = sp.category_slug;
  const slugStr = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const activeSlugs = slugStr ? slugStr.split(",").filter(Boolean) : [];

  // Mirror the apiFilters logic in ProductsView so initialData matches
  const initialFilters: Record<string, string> = {};
  if (activeSlugs.length) initialFilters.category_slug = activeSlugs.join(",");
  const ordering = first(sp.ordering);
  if (ordering && ordering !== DEFAULT_SORT) initialFilters.ordering = ordering;
  const search = first(sp.search);
  if (search) initialFilters.search = search;
  const filterValues = first(sp.filter_values);
  if (filterValues) initialFilters.filter_values = filterValues;
  if (first(sp.new_release) === "true") initialFilters.new_release = "true";
  if (first(sp.clearance_sale) === "true") initialFilters.clearance_sale = "true";
  const brandSlug = first(sp.brand_slug);
  if (brandSlug) initialFilters.brand_slug = brandSlug;

  const [locale, categories] = await Promise.all([
    getLocale(),
    getStorefrontCategories(),
  ]);

  const activeCategories = activeSlugs
    .map((s) => findCategoryBySlug(categories, s))
    .filter((c): c is NonNullable<ReturnType<typeof findCategoryBySlug>> => !!c);

  const activeCategoryId = activeCategories[0]?.id;

  const [filters, brands, initialProducts] = await Promise.all([
    getProductFilters(activeSlugs.join(",") || undefined),
    getBrands(activeCategoryId),
    getProducts(1, initialFilters),
  ]);

  // For the sidebar sub-category list, surface every child of every top-level
  // ancestor present in the selection. That way picking either a parent or a
  // sub-category keeps siblings visible and pickable for true multi-select.
  const rootIds = new Set<string>();
  for (const c of activeCategories) rootIds.add(c.parent || c.id);
  const childCategories = categories.filter(
    (c) => !!c.parent && rootIds.has(c.parent) && c.is_active !== false
  );

  return (
    <Suspense fallback={null}>
      <ProductsView
        categories={categories}
        activeCategories={activeCategories}
        childCategories={childCategories}
        filters={filters}
        brands={brands}
        locale={locale}
        initialProducts={initialProducts}
        initialFilters={initialFilters}
      />
    </Suspense>
  );
}
