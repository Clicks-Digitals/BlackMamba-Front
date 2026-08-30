"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { HomeBrand } from "@/features/home";
import type { PaginatedResponse } from "@/types";
import type { Product } from "@/types/product";
import {
  FilterSidebar,
  MobileFiltersDrawer,
  ProductsGrid,
  ProductsCategoriesRow,
  SortDropdown,
  DEFAULT_SORT,
  type Filter,
  type SortValue
} from "@/features/products";

type Props = {
  categories: Category[];
  activeCategories: Category[];
  childCategories: Category[];
  filters: Filter[];
  brands: HomeBrand[];
  locale: string;
  initialProducts?: PaginatedResponse<Product>;
  initialFilters?: Record<string, string>;
};

// Given the category currently selected via `category_slug`, compute the
// root-first chain of ancestor slugs whose CHILDREN should be shown in the
// top category row: if the active category itself has children, drill into
// it; otherwise drill into its parent so it shows up among its siblings.
function computeDrillPath(categories: Category[], activeSlug: string | undefined): string[] {
  if (!activeSlug) return [];

  const bySlug = new Map(categories.map((c) => [c.slug, c] as const));
  const byId = new Map(categories.map((c) => [c.id, c] as const));
  const hasChildren = (id: string) => categories.some((c) => c.parent === id);

  const active = bySlug.get(activeSlug);
  if (!active) return [];

  let node = hasChildren(active.id) ? active : active.parent ? byId.get(active.parent) : undefined;

  const path: string[] = [];
  while (node) {
    path.unshift(node.slug);
    node = node.parent ? byId.get(node.parent) : undefined;
  }
  return path;
}

export function ProductsView({
  categories,
  activeCategories,
  childCategories,
  filters,
  brands,
  locale,
  initialProducts,
  initialFilters,
}: Props) {
  const t = useTranslations("Products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rtl = locale === "ar";

  const [count, setCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Chain of category slugs drilled into so far, root-first. The visible row
  // shows the children of the LAST entry (or root categories when empty),
  // so this supports drilling arbitrarily deep, not just one level.
  const [expandedPath, setExpandedPath] = useState<string[]>(() => {
    const raw = searchParams.get("category_slug") ?? "";
    return computeDrillPath(categories, raw.split(",").filter(Boolean)[0]);
  });
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchDraft, 350);

  const sort = (searchParams.get("ordering") as SortValue) || DEFAULT_SORT;
  const search = searchParams.get("search") ?? "";
  const isNewRelease = searchParams.get("new_release") === "true";
  const isClearanceSale = searchParams.get("clearance_sale") === "true";

  const activeSlugs = useMemo(() => {
    const raw = searchParams.get("category_slug") ?? "";
    return raw.split(",").filter(Boolean);
  }, [searchParams]);

  const activeSlugSet = useMemo(() => new Set(activeSlugs), [activeSlugs]);

  // `expandedPath` only self-updates via handleCategoryToggle/handleBack (row
  // clicks). Navigating here from elsewhere while already on this page — e.g.
  // the persistent header's category nav bar — changes `category_slug` via a
  // plain link, not those handlers, so without this the row would keep
  // showing whatever was drilled into on first mount. Re-sync it whenever the
  // active category no longer matches the tail of the current path.
  useEffect(() => {
    const path = computeDrillPath(categories, activeSlugs[0]);
    const currentTail = expandedPath[expandedPath.length - 1];
    const nextTail = path[path.length - 1];
    if (currentTail !== nextTail) setExpandedPath(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlugs, categories]);

  const activeBrandSlugs = useMemo(() => {
    const raw = searchParams.get("brand_slug") ?? "";
    return raw.split(",").filter(Boolean);
  }, [searchParams]);

  const activeBrandSet = useMemo(() => new Set(activeBrandSlugs), [activeBrandSlugs]);

  const parentChildrenMap = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const c of categories) {
      if (!c.parent || c.is_active === false) continue;
      const list = map.get(c.parent) ?? [];
      list.push(c);
      map.set(c.parent, list);
    }
    return map;
  }, [categories]);

  const desktopRowCategories = useMemo(() => {
    const lastSlug = expandedPath[expandedPath.length - 1];
    if (lastSlug) {
      const parent = categories.find((c) => c.slug === lastSlug);
      if (parent) return parentChildrenMap.get(parent.id) ?? [];
    }
    return categories.filter((c) => !c.parent && c.is_active !== false);
  }, [categories, expandedPath, parentChildrenMap]);

  const activeFilterKeys = useMemo(() => {
    const raw = searchParams.get("filter_values") ?? "";
    return new Set(raw.split(",").filter(Boolean));
  }, [searchParams]);

  const activeValues = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const f of filters) {
      const group = new Set<string>();
      for (const v of f.values) {
        if (activeFilterKeys.has(v.key)) group.add(v.key);
      }
      map[f.key] = group;
    }
    return map;
  }, [filters, activeFilterKeys]);

  const apiFilters = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (activeSlugs.length > 0) out.category_slug = activeSlugs.join(",");
    if (search) out.search = search;
    if (sort && sort !== DEFAULT_SORT) out.ordering = sort;
    if (activeFilterKeys.size > 0) out.filter_values = Array.from(activeFilterKeys).join(",");
    if (isNewRelease) out.new_release = "true";
    if (isClearanceSale) out.clearance_sale = "true";
    if (activeBrandSlugs.length > 0) out.brand_slug = activeBrandSlugs.join(",");
    return out;
  }, [activeSlugs, search, sort, activeFilterKeys, isNewRelease, isClearanceSale, activeBrandSlugs]);

  const filterKey = useMemo(
    () =>
      Object.entries(apiFilters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&"),
    [apiFilters]
  );

  const buildHref = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      next.delete("page");
      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      router.replace(buildHref(mutate), { scroll: false });
    },
    [router, buildHref]
  );

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      updateParams((p) => {
        if (value && value.length > 0) p.set(key, value);
        else p.delete(key);
      });
    },
    [updateParams]
  );

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) setParam("search", debouncedSearch || undefined);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFilterValue = useCallback(
    (filter: Filter, valueKey: string) => {
      updateParams((p) => {
        const raw = p.get("filter_values");
        const set = new Set(raw ? raw.split(",").filter(Boolean) : []);
        if (filter.is_multiple) {
          if (set.has(valueKey)) set.delete(valueKey);
          else set.add(valueKey);
        } else {
          const isActive = set.has(valueKey);
          for (const v of filter.values) set.delete(v.key);
          if (!isActive) set.add(valueKey);
        }
        if (set.size === 0) p.delete("filter_values");
        else p.set("filter_values", Array.from(set).join(","));
      });
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    updateParams((p) => {
      p.delete("filter_values");
      p.delete("new_release");
      p.delete("clearance_sale");
      p.delete("brand_slug");
    });
  }, [updateParams]);

  const toggleNewRelease = useCallback(() => {
    updateParams((p) => {
      if (p.get("new_release") === "true") p.delete("new_release");
      else p.set("new_release", "true");
    });
  }, [updateParams]);

  const toggleClearanceSale = useCallback(() => {
    updateParams((p) => {
      if (p.get("clearance_sale") === "true") p.delete("clearance_sale");
      else p.set("clearance_sale", "true");
    });
  }, [updateParams]);

  const toggleBrand = useCallback(
    (slug: string) => {
      updateParams((p) => {
        const raw = p.get("brand_slug");
        const set = new Set(raw ? raw.split(",").filter(Boolean) : []);
        if (set.has(slug)) set.delete(slug);
        else set.add(slug);
        if (set.size === 0) p.delete("brand_slug");
        else p.set("brand_slug", Array.from(set).join(","));
      });
    },
    [updateParams]
  );

  const handleSortChange = useCallback(
    (next: SortValue) => setParam("ordering", next === DEFAULT_SORT ? undefined : next),
    [setParam]
  );

  const handleCategoryToggle = useCallback(
    (slug: string) => {
      const cat = categories.find((c) => c.slug === slug);
      if (!cat) return;
      const children = parentChildrenMap.get(cat.id) ?? [];

      if (children.length > 0) {
        // Has sub-categories → drill down to show them (however deep the
        // tree goes) AND filter by this category. The backend includes
        // descendant categories, so this shows every product in it and all
        // of its nested sub-categories.
        setExpandedPath((prev) => [...prev, slug]);
        updateParams((p) => p.set("category_slug", slug));
      } else {
        // Leaf category → filter, keep the current row of siblings visible.
        // Clicking an already selected leaf keeps it selected (idempotent)
        // rather than clearing the filter; use "Back" to go up a level.
        updateParams((p) => {
          const isSelected = p.get("category_slug") === slug;
          if (isSelected) p.delete("category_slug");
          else p.set("category_slug", slug);
        });
      }
    },
    [updateParams, categories, parentChildrenMap]
  );

  const handleBack = useCallback(() => {
    const next = expandedPath.slice(0, -1);
    setExpandedPath(next);
    const parentSlug = next[next.length - 1];
    updateParams((p) => {
      if (parentSlug) p.set("category_slug", parentSlug);
      else p.delete("category_slug");
    });
  }, [expandedPath, updateParams]);

  const filterSidebarProps = {
    categories,
    hasActiveCategory: activeCategories.length > 0,
    childCategories,
    activeSlugs: activeSlugSet,
    filters,
    activeValues,
    brands,
    activeBrands: activeBrandSet,
    locale,
    isNewRelease,
    isClearanceSale,
    onToggleFilter: toggleFilterValue,
    onToggleCategory: handleCategoryToggle,
    onToggleBrand: toggleBrand,
    onToggleNewRelease: toggleNewRelease,
    onToggleClearanceSale: toggleClearanceSale,
    onClear: clearFilters,
  };

  return (
    <>
      {/* ── Hero: title + search + categories ── */}
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x pt-6 pb-0 md:pt-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="bm-kicker mb-2">
                {rtl ? "تسوق" : "Shop"}
              </p>
              <h1
                className={cn(
                  "leading-none text-white",
                  !rtl && "font-beckman uppercase tracking-wide text-[clamp(1.8rem,3.4vw,2.8rem)]",
                  rtl && "font-cairo font-bold text-[clamp(1.4rem,2.8vw,2.2rem)]"
                )}
              >
                {t("title")}
              </h1>
            </div>
            <p className="mb-0.5 text-[13px] text-white/40">
              {t("count", { count })}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 sm:gap-3">
            <label className="relative flex h-11 min-w-0 flex-1 items-center">
              <svg className="absolute inset-s-3.5 size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-md border border-white/12 bg-white/6 ps-11 pe-4 text-[13px] text-white placeholder:text-white/35 transition-colors duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <SortDropdown
              value={sort}
              onChange={handleSortChange}
              className="hidden shrink-0 md:inline-flex"
              variant="light"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label={t("filter")}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/12 bg-white/6 text-white transition duration-200 hover:bg-white/12 md:hidden"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            </button>
          </div>

          {/* Category slider — circular icons, identical on mobile and desktop */}
          <div className="mt-3">
            <ProductsCategoriesRow
              categories={desktopRowCategories}
              activeSlugs={activeSlugSet}
              locale={locale}
              onToggle={handleCategoryToggle}
              variant="hero"
              showBackButton={expandedPath.length > 0}
              onBack={handleBack}
            />
          </div>

          {/* Bottom spacer */}
          <div className="h-2.5" />
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="layout-gutter-x bg-background py-8 lg:py-10">
        <div className="layout-page flex flex-col gap-5">
          {/* Sidebar + Grid */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <FilterSidebar {...filterSidebarProps} />

            <div className="min-w-0 flex-1">
              <ProductsGrid
                key={filterKey}
                filters={apiFilters}
                locale={locale}
                onCountChange={setCount}
                initialData={
                  initialProducts && initialFilters &&
                  filterKey === Object.entries(initialFilters).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join("&")
                    ? initialProducts
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        <MobileFiltersDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          sort={sort}
          onSortChange={handleSortChange}
          {...filterSidebarProps}
        />
      </section>
    </>
  );
}
