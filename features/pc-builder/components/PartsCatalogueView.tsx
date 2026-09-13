"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Search, SlidersHorizontal,
  ChevronDown, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, Loader2
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { searchPartsAction } from "@/features/pc-builder/actions/queries";
import { SLOT_ORDER, type PCSlot, type PCPart, type PartFilters } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "./slot-icons";
import { PartCatalogueCard } from "./PartCatalogueCard";
import { BlackMambaLogo } from "./BuilderPageShell";

interface PartsCatalogueViewProps {
  buildId: string;
  initialParts: PCPart[];
  initialCount: number;
  initialSlot: PCSlot | "ALL";
}

export function PartsCatalogueView({ buildId, initialParts, initialCount, initialSlot }: PartsCatalogueViewProps) {
  const t = useTranslations("PCBuilder");
  const tCat = useTranslations("PCBuilder.catalogue");
  const tPicker = useTranslations("PCBuilder.picker");
  const locale = useLocale();
  const rtl = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const ChevronPrev = rtl ? ChevronRight : ChevronLeft;
  const ChevronNext = rtl ? ChevronLeft : ChevronRight;

  const [activeSlot, setActiveSlot] = useState<PCSlot | "ALL">(initialSlot);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [extraFilters, setExtraFilters] = useState<Partial<PartFilters>>({});
  const [page, setPage] = useState(1);
  const [parts, setParts] = useState(initialParts);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  function handleSlotChange(slot: PCSlot | "ALL") {
    setActiveSlot(slot);
    setExtraFilters({});
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (slot === "ALL") params.delete("slot");
    else params.set("slot", slot);
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      const filters: PartFilters = {
        ...extraFilters,
        search: search || undefined,
        ...(buildId ? { compatible_with: buildId } : {}),
        ...(activeSlot !== "ALL" ? { slot: activeSlot } : {}),
      };
      const res = await searchPartsAction(filters, page);
      if (!cancelled) {
        setParts(res.results);
        setCount(res.count);
        setIsLoading(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot, search, extraFilters, page, buildId]);

  const totalPages = Math.max(1, Math.ceil(count / 24));

  const filterPanelProps = {
    activeSlot,
    filters: extraFilters,
    onChange: (f: Partial<PartFilters>) => { setExtraFilters(f); setPage(1); },
    onSlotChange: handleSlotChange,
    locale,
  };

  return (
    <div className="bg-[#000000]" dir={rtl ? "rtl" : "ltr"}>
      {/* ── Hero ── */}
      <div className="bg-[#000000]">
        <div className="layout-page layout-gutter-x pt-8 pb-0 md:pt-10">
          <Link
            href="/pc-builder"
            className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-white/45 transition-colors hover:text-white/75"
          >
            <BackIcon className="h-3 w-3" />
            {t("backToBuilder")}
          </Link>

          <div className="mb-5">
            <BlackMambaLogo size="sm" />
          </div>

          <div className="border-t border-[#EB0B1A]/20 pt-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h1 className={cn(
              "leading-none text-[#FFFFFF]",
              !rtl && "font-beckman uppercase tracking-wide text-[clamp(2.4rem,5vw,4.2rem)]",
              rtl && "font-cairo font-bold text-[clamp(1.8rem,4vw,3.2rem)]"
            )}>
              {tCat("title")}
            </h1>
            <p className="mb-1 text-[12px] text-white/40">
              {count} {rtl ? "قطعة" : "parts"}
            </p>
          </div>

          {/* Search + mobile filter */}
          <div className="mt-5 flex items-center gap-2">
            <label className="relative flex h-10 min-w-0 flex-1 items-center">
              <Search className="absolute inset-s-3 size-4 text-white/40" strokeWidth={2} />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={tPicker("searchPlaceholder")}
                className="h-10 w-full rounded-full border border-white/15 bg-white/5 ps-10 pe-4 text-[13px] text-[#FFFFFF] placeholder:text-white/35 focus:border-[#EB0B1A]/50 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              aria-label={tCat("filters")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#FFFFFF] transition hover:bg-white/10 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="h-5" />
        </div>
      </div>

      {/* ── Body ── */}
      <section className="layout-gutter-x bg-[#000000] py-6 lg:py-8">
        <div className="layout-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">

            {/* Desktop filter sidebar */}
            <aside className="hidden w-full shrink-0 md:block md:w-56 lg:w-60">
              <div className="sticky top-24 overflow-hidden rounded-[10px] border border-[#000000] bg-[#000000]">
                <div className="border-b-2 border-[#EB0B1A] px-5 py-3.5">
                  <span className={cn(
                    "text-[#FFFFFF]",
                    !rtl && "font-chillax text-[17px] uppercase tracking-widest",
                    rtl && "font-cairo font-semibold text-sm"
                  )}>
                    {tCat("filters")}
                  </span>
                </div>
                <div className="p-5">
                  <PartFilterPanel {...filterPanelProps} />
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-24 text-white/25">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : parts.length === 0 ? (
                <p className="py-24 text-center text-white/40">{tCat("noMatch")}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {parts.map((part) => (
                    <PartCatalogueCard key={part.id} part={part} buildId={buildId} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center justify-center rounded-lg border border-[#000000] bg-[#000000] p-2 text-white/50 transition hover:border-[#EB0B1A]/30 disabled:opacity-30"
                  >
                    <ChevronPrev className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-white/50">{tCat("page", { page, total: totalPages })}</span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center justify-center rounded-lg border border-[#000000] bg-[#000000] p-2 text-white/50 transition hover:border-[#EB0B1A]/30 disabled:opacity-30"
                  >
                    <ChevronNext className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side={rtl ? "left" : "right"} className="border-[#000000] bg-[#000000] text-[#FFFFFF]">
            <SheetHeader>
              <SheetTitle className={cn(
                "text-[#FFFFFF]",
                !rtl && "font-chillax text-[17px] uppercase tracking-widest",
                rtl && "font-cairo font-semibold text-base"
              )}>
                {tCat("filters")}
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-1 pt-4">
              <PartFilterPanel {...filterPanelProps} />
            </div>
          </SheetContent>
        </Sheet>
      </section>
    </div>
  );
}

// ── Filter panel ─────────────────────────────────────────────────────────────

function PartFilterPanel({
  activeSlot, filters, onChange, onSlotChange, locale,
}: {
  activeSlot: PCSlot | "ALL";
  filters: Partial<PartFilters>;
  onChange: (filters: Partial<PartFilters>) => void;
  onSlotChange: (slot: PCSlot | "ALL") => void;
  locale: string;
}) {
  const t = useTranslations("PCBuilder");
  const tFilters = useTranslations("PCBuilder.filters");
  const rtl = locale === "ar";

  function set<K extends keyof PartFilters>(key: K, value: PartFilters[K] | undefined) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters =
    activeSlot !== "ALL" || Object.values(filters).some((v) => v !== undefined && v !== "");

  function clearAll() {
    onSlotChange("ALL");
    onChange({});
  }

  return (
    <div>
      {/* Quick header row */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
          {rtl ? "التصفية" : "Filters"}
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10.5px] font-semibold uppercase tracking-wide text-[#EB0B1A] hover:opacity-75"
          >
            {rtl ? "مسح الكل" : "Clear All"}
          </button>
        )}
      </div>

      {/* ── Part Type ── */}
      <FilterSection title={rtl ? "نوع القطعة" : "Part Type"} defaultOpen>
        <ul className="flex flex-col gap-2">
          {(["ALL", ...SLOT_ORDER] as (PCSlot | "ALL")[]).map((slot) => {
            const checked = activeSlot === slot;
            const id = `slot-${slot}`;
            const Icon = slot !== "ALL" ? SLOT_ICONS[slot] : null;
            const label = slot === "ALL"
              ? (rtl ? "جميع القطع" : "All Parts")
              : t(`slots.${slot}`);
            return (
              <li key={slot} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => onSlotChange(slot)}
                />
                <label
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 text-[13px] hover:text-[#FFFFFF]",
                    checked ? "font-semibold text-[#EB0B1A]" : "text-white/70"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-white/40" />}
                  {label}
                </label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {/* ── Price Range ── */}
      <FilterSection title={tFilters("priceRange")}>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={tFilters("min")}
            value={filters.price_min ?? ""}
            onChange={(e) => set("price_min", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-[#000000] bg-white/5 px-2.5 py-1.5 text-sm text-[#FFFFFF] placeholder:text-white/30 focus:border-[#EB0B1A]/50 focus:outline-none"
          />
          <input
            type="number"
            placeholder={tFilters("max")}
            value={filters.price_max ?? ""}
            onChange={(e) => set("price_max", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-[#000000] bg-white/5 px-2.5 py-1.5 text-sm text-[#FFFFFF] placeholder:text-white/30 focus:border-[#EB0B1A]/50 focus:outline-none"
          />
        </div>
      </FilterSection>

      {/* ── Processor Brand — CPU ── */}
      {(activeSlot === "ALL" || activeSlot === "CPU") && (
        <FilterSection title={tFilters("processorBrand")}>
          <RadioGroup
            options={["INTEL", "AMD"]}
            value={filters.processor_brand}
            onChange={(v) => set("processor_brand", v)}
          />
        </FilterSection>
      )}

      {/* ── Graphics Brand — GPU ── */}
      {(activeSlot === "ALL" || activeSlot === "GPU") && (
        <FilterSection title={tFilters("graphicsBrand")}>
          <RadioGroup
            options={["NVIDIA", "AMD"]}
            value={filters.graphics_brand}
            onChange={(v) => set("graphics_brand", v)}
          />
        </FilterSection>
      )}

      {/* ── Socket — CPU / Motherboard ── */}
      {(activeSlot === "ALL" || activeSlot === "CPU" || activeSlot === "MOTHERBOARD") && (
        <FilterSection title={tFilters("socket")}>
          <input
            value={filters.socket ?? ""}
            onChange={(e) => set("socket", e.target.value || undefined)}
            placeholder="e.g. AM5"
            className="w-full rounded-lg border border-[#000000] bg-white/5 px-2.5 py-1.5 text-sm text-[#FFFFFF] placeholder:text-white/30 focus:outline-none"
          />
        </FilterSection>
      )}

      {/* ── Memory Type — Motherboard / RAM ── */}
      {(activeSlot === "ALL" || activeSlot === "MOTHERBOARD" || activeSlot === "RAM") && (
        <FilterSection title={tFilters("memoryType")}>
          <input
            value={filters.memory_type ?? ""}
            onChange={(e) => set("memory_type", e.target.value || undefined)}
            placeholder="e.g. DDR5"
            className="w-full rounded-lg border border-[#000000] bg-white/5 px-2.5 py-1.5 text-sm text-[#FFFFFF] placeholder:text-white/30 focus:outline-none"
          />
        </FilterSection>
      )}

      {/* ── Form Factor — Motherboard ── */}
      {(activeSlot === "ALL" || activeSlot === "MOTHERBOARD") && (
        <FilterSection title={tFilters("formFactor")}>
          <RadioGroup
            options={["ITX", "MATX", "ATX"]}
            value={filters.form_factor}
            onChange={(v) => set("form_factor", v)}
          />
        </FilterSection>
      )}

      {/* ── Max Form Factor — Case ── */}
      {(activeSlot === "ALL" || activeSlot === "CASE") && (
        <FilterSection title={tFilters("maxFormFactor")}>
          <RadioGroup
            options={["ITX", "MATX", "ATX"]}
            value={filters.max_form_factor}
            onChange={(v) => set("max_form_factor", v)}
          />
        </FilterSection>
      )}

      {/* ── Colour — RAM / Case / CPU Cooler ── */}
      {(activeSlot === "ALL" || activeSlot === "RAM" || activeSlot === "CASE" || activeSlot === "CPU_COOLER") && (
        <FilterSection title={tFilters("colour")}>
          <RadioGroup
            options={["BLACK", "WHITE"]}
            value={filters.color}
            onChange={(v) => set("color", v)}
          />
        </FilterSection>
      )}

      {/* ── Wattage — PSU ── */}
      {(activeSlot === "ALL" || activeSlot === "PSU") && (
        <FilterSection title={tFilters("wattage")}>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={tFilters("min")}
              value={filters.wattage_min ?? ""}
              onChange={(e) => set("wattage_min", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-[#000000] bg-white/5 px-2.5 py-1.5 text-sm text-[#FFFFFF] placeholder:text-white/30 focus:outline-none"
            />
            <input
              type="number"
              placeholder={tFilters("max")}
              value={filters.wattage_max ?? ""}
              onChange={(e) => set("wattage_max", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-[#000000] bg-white/5 px-2.5 py-1.5 text-sm text-[#FFFFFF] placeholder:text-white/30 focus:outline-none"
            />
          </div>
        </FilterSection>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function FilterSection({
  title, defaultOpen = true, children,
}: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 border-t border-[#000000] pt-3 first:border-t-0 first:pt-0 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-start"
        aria-expanded={open}
      >
        <span className="text-[13px] font-semibold text-[#FFFFFF]">{title}</span>
        <ChevronDown className={cn("size-4 text-white/40 transition-transform", !open && "-rotate-90 rtl:rotate-90")} />
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}

function RadioGroup({
  options, value, onChange,
}: {
  options: string[]; value?: string; onChange: (v: string | undefined) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {options.map((opt) => {
        const checked = value === opt;
        const id = `rg-${opt}`;
        return (
          <li key={opt} className="flex items-center gap-2">
            <Checkbox id={id} checked={checked} onCheckedChange={() => onChange(checked ? undefined : opt)} />
            <label
              htmlFor={id}
              className={cn(
                "cursor-pointer text-[13px] hover:text-[#FFFFFF]",
                checked ? "font-semibold text-[#EB0B1A]" : "text-white/70"
              )}
            >
              {opt}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
