"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PCPart, PCSlot } from "@/features/pc-builder/types";
import { isPartInStock } from "@/features/pc-builder/lib/stock";

export type PickerSort = "recommended" | "price_asc" | "price_desc" | "name";

export interface PickerFilterState {
  sort: PickerSort;
  inStockOnly: boolean;
  priceMin: string;
  priceMax: string;
  /** facet key -> chosen values; a part matches when its value is any of them. */
  facets: Record<string, string[]>;
}

export const EMPTY_FILTERS: PickerFilterState = {
  sort: "recommended",
  inStockOnly: false,
  priceMin: "",
  priceMax: "",
  facets: {},
};

interface Facet {
  key: string;
  /** Message key under PCBuilder.picker. */
  label: string;
  value: (part: PCPart) => string | null;
  /** How a value reads on its chip; the value itself by default. */
  display?: (value: string, t: (key: string) => string) => string;
  numeric?: boolean;
}

const brand: Facet = { key: "brand", label: "brand", value: (p) => p.brand_name ?? null };

/**
 * The filters worth offering for each slot. Only the ones whose parts differ
 * are shown - a filter with a single value does nothing.
 */
const FACETS: Partial<Record<PCSlot, Facet[]>> = {
  CPU: [
    { key: "processor_brand", label: "processorBrand", value: (p) => p.spec?.processor_brand ?? null },
    { key: "socket", label: "socket", value: (p) => p.spec?.socket ?? null },
    brand,
  ],
  MOTHERBOARD: [
    brand,
    { key: "socket", label: "socket", value: (p) => p.spec?.socket ?? null },
    { key: "memory_type", label: "memoryType", value: (p) => p.spec?.memory_type ?? null },
    { key: "form_factor", label: "formFactor", value: (p) => p.spec?.form_factor ?? null },
  ],
  RAM: [
    brand,
    { key: "memory_type", label: "memoryType", value: (p) => p.spec?.memory_type ?? null },
    {
      key: "kit",
      label: "kit",
      value: (p) => (p.spec?.is_dual_channel_kit == null ? null : p.spec.is_dual_channel_kit ? "dual" : "single"),
      display: (v, t) => t(v === "dual" ? "dualKit" : "singleStick"),
    },
  ],
  GPU: [
    { key: "graphics_brand", label: "chipset", value: (p) => p.spec?.graphics_brand ?? null },
    brand,
  ],
  CPU_COOLER: [brand, { key: "color", label: "colour", value: (p) => p.spec?.color ?? null }],
  PSU: [
    brand,
    {
      key: "wattage",
      label: "wattage",
      value: (p) => (p.spec?.wattage ? String(p.spec.wattage) : null),
      display: (v) => `${v}W`,
      numeric: true,
    },
  ],
  CASE: [
    brand,
    { key: "max_form_factor", label: "fitsBoard", value: (p) => p.spec?.max_form_factor ?? null },
    { key: "color", label: "colour", value: (p) => p.spec?.color ?? null },
  ],
};

function facetsFor(slot: PCSlot): Facet[] {
  return FACETS[slot] ?? [brand];
}

function priceOf(part: PCPart): number {
  const n = Number(part.price ?? part.base_price);
  return Number.isFinite(n) ? n : 0;
}

/** The parts that pass the filters, in the chosen order. */
export function applyPickerFilters(parts: PCPart[], state: PickerFilterState, slot: PCSlot): PCPart[] {
  const min = state.priceMin === "" ? null : Number(state.priceMin);
  const max = state.priceMax === "" ? null : Number(state.priceMax);
  const facets = facetsFor(slot);

  const kept = parts.filter((part) => {
    if (state.inStockOnly && !isPartInStock(part)) return false;
    const price = priceOf(part);
    if (min !== null && Number.isFinite(min) && price < min) return false;
    if (max !== null && Number.isFinite(max) && price > max) return false;
    return facets.every((facet) => {
      const chosen = state.facets[facet.key];
      if (!chosen?.length) return true;
      const value = facet.value(part);
      return value !== null && chosen.includes(value);
    });
  });

  // "Recommended" keeps the server's order: in stock first, then the
  // catalogue's own display order.
  if (state.sort === "price_asc") kept.sort((a, b) => priceOf(a) - priceOf(b));
  if (state.sort === "price_desc") kept.sort((a, b) => priceOf(b) - priceOf(a));
  if (state.sort === "name") kept.sort((a, b) => a.name.localeCompare(b.name));
  return kept;
}

export function activeFilterCount(state: PickerFilterState): number {
  return (
    Object.values(state.facets).reduce((n, values) => n + values.length, 0) +
    (state.inStockOnly ? 1 : 0) +
    (state.priceMin !== "" ? 1 : 0) +
    (state.priceMax !== "" ? 1 : 0)
  );
}

interface PickerFiltersProps {
  slot: PCSlot;
  parts: PCPart[];
  state: PickerFilterState;
  onChange: (state: PickerFilterState) => void;
}

export function PickerFilters({ slot, parts, state, onChange }: PickerFiltersProps) {
  const t = useTranslations("PCBuilder.picker");
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(state);

  const groups = facetsFor(slot)
    .map((facet) => {
      const values = Array.from(
        new Set(parts.map(facet.value).filter((v): v is string => v !== null && v !== ""))
      );
      values.sort(facet.numeric ? (a, b) => Number(a) - Number(b) : (a, b) => a.localeCompare(b));
      return { facet, values };
    })
    .filter(({ values }) => values.length > 1);

  function toggle(key: string, value: string) {
    const current = state.facets[key] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...state, facets: { ...state.facets, [key]: next } });
  }

  const chip = (selected: boolean) =>
    cn(
      "min-h-8 rounded-md border px-2.5 text-xs font-medium transition-colors",
      selected
        ? "border-[#EB0B1A] bg-[#EB0B1A]/15 text-white"
        : "border-white/12 bg-white/3 text-white/60 hover:border-white/25 hover:text-white"
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="relative flex flex-1 items-center">
          <ArrowUpDown className="pointer-events-none absolute start-3 h-3.5 w-3.5 text-white/40" />
          <span className="sr-only">{t("sortBy")}</span>
          <select
            value={state.sort}
            onChange={(e) => onChange({ ...state, sort: e.target.value as PickerSort })}
            className="h-9 w-full appearance-none rounded-md border border-white/12 bg-white/5 ps-8 pe-3 text-xs text-white focus:border-[#EB0B1A]/50 focus:outline-none"
          >
            <option value="recommended" className="bg-black">{t("sortRecommended")}</option>
            <option value="price_asc" className="bg-black">{t("sortPriceAsc")}</option>
            <option value="price_desc" className="bg-black">{t("sortPriceDesc")}</option>
            <option value="name" className="bg-black">{t("sortName")}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors",
            open || active
              ? "border-[#EB0B1A]/50 bg-[#EB0B1A]/10 text-white"
              : "border-white/12 bg-white/5 text-white/70 hover:text-white"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t("filters")}
          {active > 0 && (
            <span className="rounded-full bg-[#EB0B1A] px-1.5 text-[10px] font-bold text-white">{active}</span>
          )}
        </button>
      </div>

      {open && (
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-lg border border-white/8 bg-white/2 p-3">
          {groups.map(({ facet, values }) => (
            <div key={facet.key} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {t(facet.label)}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {values.map((value) => {
                  const selected = (state.facets[facet.key] ?? []).includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggle(facet.key, value)}
                      className={chip(selected)}
                    >
                      {facet.display ? facet.display(value, t) : value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {t("priceRange")}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={state.priceMin}
                onChange={(e) => onChange({ ...state, priceMin: e.target.value })}
                placeholder={t("priceMin")}
                className="h-8 w-full rounded-md border border-white/12 bg-transparent px-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#EB0B1A]/50 focus:outline-none"
              />
              <span className="text-white/30">–</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={state.priceMax}
                onChange={(e) => onChange({ ...state, priceMax: e.target.value })}
                placeholder={t("priceMax")}
                className="h-8 w-full rounded-md border border-white/12 bg-transparent px-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#EB0B1A]/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-pressed={state.inStockOnly}
              onClick={() => onChange({ ...state, inStockOnly: !state.inStockOnly })}
              className={chip(state.inStockOnly)}
            >
              {t("inStockOnly")}
            </button>
            {active > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...EMPTY_FILTERS, sort: state.sort })}
                className="flex items-center gap-1 text-xs font-medium text-[#EB0B1A] hover:underline"
              >
                <X className="h-3 w-3" />
                {t("resetFilters")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
