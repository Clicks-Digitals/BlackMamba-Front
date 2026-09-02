"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { HomeBrand } from "@/features/home";
import { type Filter } from "@/features/products";


export type FiltersPanelProps = {
  categories?: Category[];
  hasActiveCategory: boolean;
  childCategories: Category[];
  activeSlugs: Set<string>;
  filters: Filter[];
  activeValues: Record<string, Set<string>>;
  brands: HomeBrand[];
  activeBrands: Set<string>;
  locale: string;
  isNewRelease: boolean;
  isClearanceSale: boolean;
  onToggleFilter: (filter: Filter, valueKey: string) => void;
  onToggleCategory: (slug: string) => void;
  onToggleBrand: (slug: string) => void;
  onToggleNewRelease: () => void;
  onToggleClearanceSale: () => void;
  onClear: () => void;
};

function buildByParent(cats: Category[]) {
  const map: Record<string, Category[]> = {};
  for (const c of cats) {
    const key = c.parent || "__root__";
    if (!map[key]) map[key] = [];
    map[key].push(c);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.display_order - b.display_order);
  }
  return map;
}

function CategoryNode({
  category,
  byParent,
  activeSlugs,
  rtl,
  depth = 0,
  onToggle,
}: {
  category: Category;
  byParent: Record<string, Category[]>;
  activeSlugs: Set<string>;
  rtl: boolean;
  depth?: number;
  onToggle: (slug: string) => void;
}) {
  const children = byParent[category.id] ?? [];
  const hasChildren = children.length > 0;
  const isActive = activeSlugs.has(category.slug);

  const hasActiveDescendant = useMemo(() => {
    const check = (cats: Category[]): boolean =>
      cats.some((c) => activeSlugs.has(c.slug) || check(byParent[c.id] ?? []));
    return check(children);
  }, [activeSlugs, children, byParent]);

  const [open, setOpen] = useState(() => isActive || hasActiveDescendant);

  useEffect(() => {
    if (isActive || hasActiveDescendant) setOpen(true);
  }, [isActive, hasActiveDescendant]);

  const name = rtl ? category.name_ar || category.name : category.name;
  const id = `cat-${category.id}`;

  return (
    <li>
      <div className={cn("flex items-center gap-1.5", depth > 0 && "ps-3")}>
        <Checkbox
          id={id}
          checked={isActive}
          onCheckedChange={() => onToggle(category.slug)}
          className="shrink-0"
        />
        <label
          htmlFor={id}
          className={cn(
            "min-w-0 flex-1 cursor-pointer truncate text-[13px] hover:text-foreground",
            isActive ? "font-semibold text-foreground" : "text-foreground/85"
          )}
        >
          {name}
        </label>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDown className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="ms-2 mt-1 flex flex-col gap-1 border-s border-border ps-1.5">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              byParent={byParent}
              activeSlugs={activeSlugs}
              rtl={rtl}
              depth={depth + 1}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FiltersPanel({
  categories = [], activeSlugs, filters, activeValues,
  brands, activeBrands, locale,
  isNewRelease, isClearanceSale,
  onToggleFilter, onToggleCategory, onToggleBrand, onToggleNewRelease, onToggleClearanceSale, onClear,
}: FiltersPanelProps) {
  const t = useTranslations("Products");
  const rtl = locale === "ar";
  const hasFilters = filters.length > 0;
  const hasBrands = brands.length > 0;
  const hasActiveValues =
    Object.values(activeValues).some((s) => s.size > 0) ||
    isNewRelease ||
    isClearanceSale ||
    activeBrands.size > 0;

  const byParent = useMemo(() => buildByParent(categories), [categories]);
  const topLevel = byParent["__root__"] ?? [];
  const hasCategories = topLevel.length > 0;

  return (
    <div>
      {/* Hierarchical category tree */}
      {hasCategories && (
        <Section title={t("categories")} defaultOpen>
          <ul className="flex flex-col gap-1.5">
            {topLevel.map((cat) => (
              <CategoryNode
                key={cat.id}
                category={cat}
                byParent={byParent}
                activeSlugs={activeSlugs}
                rtl={rtl}
                onToggle={onToggleCategory}
              />
            ))}
          </ul>
        </Section>
      )}

      {/* Quick toggles + Clear All header */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60">
            {t("filtersTitle")}
          </h3>
          {hasActiveValues && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10.5px] font-semibold uppercase tracking-wide text-destructive hover:opacity-75"
            >
              {t("clearAll")}
            </button>
          )}
        </div>
        <ul className="flex flex-col gap-2 pt-1">
          <li className="flex items-center gap-2">
            <Checkbox
              id="quick-new-release"
              checked={isNewRelease}
              onCheckedChange={onToggleNewRelease}
            />
            <label
              htmlFor="quick-new-release"
              className={cn(
                "cursor-pointer text-[13px] hover:text-foreground",
                isNewRelease ? "font-semibold text-foreground" : "text-foreground/85"
              )}
            >
              {t("newRelease")}
            </label>
          </li>
          <li className="flex items-center gap-2">
            <Checkbox
              id="quick-clearance-sale"
              checked={isClearanceSale}
              onCheckedChange={onToggleClearanceSale}
            />
            <label
              htmlFor="quick-clearance-sale"
              className={cn(
                "cursor-pointer text-[13px] hover:text-foreground",
                isClearanceSale ? "font-semibold text-foreground" : "text-foreground/85"
              )}
            >
              {t("clearanceSale")}
            </label>
          </li>
        </ul>
      </div>

      {/* Brands */}
      {hasBrands && (
        <Section title={t("brandsTitle")} defaultOpen>
          <CollapsibleList
            count={brands.length}
            items={brands}
            rtl={rtl}
            renderItem={(brand) => {
              const checked = activeBrands.has(brand.slug);
              const name = rtl ? brand.name_ar || brand.name : brand.name;
              const id = `brand-${brand.id}`;
              return (
                <li key={brand.id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => onToggleBrand(brand.slug)}
                  />
                  <label
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 text-[13px] hover:text-foreground",
                      checked ? "font-semibold text-foreground" : "text-foreground/85"
                    )}
                  >
                    {brand.logo_url && (
                      <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white">
                        <Image
                          src={brand.logo_url}
                          alt={name}
                          fill
                          className="object-contain p-0.5"
                          unoptimized
                        />
                      </span>
                    )}
                    {name}
                  </label>
                </li>
              );
            }}
          />
        </Section>
      )}

      {/* Dynamic filter groups */}
      {hasFilters && (
        <>
          {filters.map((f) => {
            const groupValues = activeValues[f.key] ?? new Set<string>();
            const name = rtl ? f.name_ar || f.name : f.name;
            return (
              <Section key={f.id} title={name} defaultOpen>
                <CollapsibleList
                  count={f.values.length}
                  items={f.values}
                  rtl={rtl}
                  renderItem={(v) => {
                    const checked = groupValues.has(v.key);
                    const label = rtl ? v.value_ar || v.value : v.value;
                    const id = `f-${f.key}-${v.id}`;
                    return (
                      <li key={v.id} className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() => onToggleFilter(f, v.key)}
                        />
                        <label
                          htmlFor={id}
                          className={cn(
                            "cursor-pointer text-[13px] hover:text-foreground",
                            checked ? "font-semibold text-foreground" : "text-foreground/85"
                          )}
                        >
                          {label}
                        </label>
                      </li>
                    );
                  }}
                />
              </Section>
            );
          })}
        </>
      )}
    </div>
  );
}

export function FilterSidebar(props: FiltersPanelProps) {
  return (
    <aside className="hidden w-full shrink-0 md:block md:w-56 lg:w-60">
      <div className="sticky top-[calc(var(--layout-chrome-top)+1rem)] overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b-2 border-primary px-5 py-3.5">
          <span className="font-chillax text-[17px] uppercase tracking-widest text-foreground">
            {props.locale === "ar" ? "التصفية" : "Filters"}
          </span>
        </div>
        <div className="p-5">
          <FiltersPanel {...props} />
        </div>
      </div>
    </aside>
  );
}

const SHOW_LIMIT = 4;

function CollapsibleList<T>({
  items,
  count,
  renderItem,
  rtl,
}: {
  items: T[];
  count: number;
  renderItem: (item: T) => React.ReactNode;
  rtl: boolean;
}) {
  const [showAll, setShowAll] = useState(false);

  if (count <= SHOW_LIMIT) {
    return <ul className="flex flex-col gap-2">{items.map(renderItem)}</ul>;
  }

  const visible = showAll ? items : items.slice(0, SHOW_LIMIT);
  const hidden = count - SHOW_LIMIT;

  return (
    <div>
      <ul className="flex flex-col gap-2">{visible.map(renderItem)}</ul>
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-foreground/60 hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", showAll && "rotate-180")}
        />
        {showAll
          ? (rtl ? "عرض أقل" : "See less")
          : (rtl ? `عرض ${hidden} أكثر` : `See ${hidden} more`)}
      </button>
    </div>
  );
}

function Section({
  title, defaultOpen = true, children,
}: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-start"
        aria-expanded={open}
      >
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", !open && "-rotate-90 rtl:rotate-90")}
        />
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}
