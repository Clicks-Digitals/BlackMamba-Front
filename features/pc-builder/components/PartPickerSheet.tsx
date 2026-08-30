"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Search, Check, X, Loader2, Zap, ChevronDown, ChevronUp, PackageX } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { getPartsForSlotAction } from "@/features/pc-builder/actions/queries";
import { upsertBuildItemAction } from "@/features/pc-builder/actions/mutations";
import { type PCSlot, type PCPart, type PCBuild, type PCPartSpec } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "./slot-icons";

interface PartPickerSheetProps {
  slot: PCSlot | null;
  buildId: string;
  onClose: () => void;
}

/* ── Spec chips per slot ─────────────────────────────────────────────── */
function getSpecChips(spec: PCPartSpec | null, slot: PCSlot): string[] {
  if (!spec) return [];
  const chips: string[] = [];
  switch (slot) {
    case "CPU":
      if (spec.socket) chips.push(spec.socket);
      if (spec.tdp_watts) chips.push(`${spec.tdp_watts}W TDP`);
      if (spec.processor_brand) chips.push(spec.processor_brand);
      break;
    case "MOTHERBOARD":
      if (spec.socket) chips.push(spec.socket);
      if (spec.memory_type) chips.push(spec.memory_type);
      if (spec.form_factor) chips.push(spec.form_factor);
      break;
    case "RAM":
      if (spec.memory_type) chips.push(spec.memory_type);
      if (spec.is_dual_channel_kit === true) chips.push("Dual-Channel Kit");
      if (spec.is_dual_channel_kit === false) chips.push("Single Stick");
      break;
    case "GPU":
      if (spec.graphics_brand) chips.push(spec.graphics_brand);
      if (spec.power_draw_watts) chips.push(`${spec.power_draw_watts}W Draw`);
      break;
    case "CPU_COOLER":
      if (spec.rated_tdp_watts) chips.push(`Up to ${spec.rated_tdp_watts}W`);
      if (spec.color) chips.push(spec.color);
      break;
    case "PSU":
      if (spec.wattage) chips.push(`${spec.wattage}W`);
      break;
    case "CASE":
      if (spec.max_form_factor) chips.push(`Max ${spec.max_form_factor}`);
      if (spec.color) chips.push(spec.color);
      break;
    default:
      break;
  }
  return chips;
}

/* ── Main sheet ──────────────────────────────────────────────────────── */
export function PartPickerSheet({ slot, buildId, onClose }: PartPickerSheetProps) {
  const t = useTranslations("PCBuilder");
  const tPicker = useTranslations("PCBuilder.picker");
  const locale = useLocale();
  const rtl = locale === "ar";
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const [search, setSearch] = useState("");
  const [compatibleOnly, setCompatibleOnly] = useState(true);
  const [parts, setParts] = useState<PCPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!slot) return;
    setSearch("");
    setParts([]);
  }, [slot]);

  useEffect(() => {
    if (!slot) return;
    let cancelled = false;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      const results = await getPartsForSlotAction(slot, buildId, search || undefined);
      if (!cancelled) {
        setParts(results);
        setIsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slot, buildId, search]);

  const visibleParts = compatibleOnly ? parts.filter((p) => p.is_compatible !== false) : parts;
  const compatibleCount = parts.filter((p) => p.is_compatible !== false).length;
  const SlotIcon = slot ? SLOT_ICONS[slot] : null;

  function handleAdded(build: PCBuild, name: string) {
    setBuild(build);
    toast.success(tPicker("added", { name }));
    onClose();
  }

  return (
    <Sheet open={!!slot} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={rtl ? "left" : "right"}
        className="flex w-full flex-col overflow-x-hidden border-s border-[#9e1d20]/20 bg-[#0f1110] p-0 text-[#EDEFF0] sm:max-w-xl"
      >
        {/* Header */}
        <SheetHeader className="border-b border-white/6 bg-[#0f1110] px-5 pb-4 pt-5">
          <SheetTitle className="flex items-center gap-2.5 text-base font-bold text-white">
            {SlotIcon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#9e1d20]/20">
                <SlotIcon className="h-4 w-4 text-[#d12f27]" />
              </span>
            )}
            {slot ? t("select", { slot: t(`slots.${slot}`) }) : ""}
            {!isLoading && parts.length > 0 && (
              <span className="ms-auto rounded-full bg-white/8 px-2.5 py-0.5 text-xs font-semibold text-white/50">
                {compatibleCount} compatible
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="mt-1 text-xs text-white/40">
            {tPicker("description")}
          </SheetDescription>
        </SheetHeader>

        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-white/6 bg-[#0f1110] px-5 py-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tPicker("searchPlaceholder")}
            beforeIcon={Search}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#9e1d20]/50"
          />
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/50 select-none">
            <Checkbox
              checked={compatibleOnly}
              onCheckedChange={(v) => setCompatibleOnly(v === true)}
              className="border-white/20 data-[state=checked]:bg-[#9e1d20] data-[state=checked]:border-[#9e1d20]"
            />
            {tPicker("compatibleOnly")}
            {compatibleOnly && !isLoading && parts.length > 0 && (
              <span className="ms-auto text-white/30">
                {parts.length - compatibleCount} hidden
              </span>
            )}
          </label>
        </div>

        {/* Parts list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex h-full flex-col gap-2 rounded-lg border border-white/6 bg-white/3 p-3 animate-pulse">
                  <div className="aspect-square w-full rounded-md bg-white/8" />
                  <div className="h-3.5 w-3/4 rounded bg-white/8" />
                  <div className="h-3 w-1/2 rounded bg-white/6" />
                </div>
              ))}
            </div>
          ) : visibleParts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <PackageX className="h-10 w-10 text-white/15" />
              <p className="text-sm font-semibold text-white/30">{tPicker("noPartsFound")}</p>
              {compatibleOnly && parts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCompatibleOnly(false)}
                  className="text-xs text-[#9e1d20] hover:underline"
                >
                  Show all {parts.length} parts anyway
                </button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibleParts.map((part) => (
                <PartPickerCard
                  key={part.id}
                  part={part}
                  slot={slot!}
                  buildId={buildId}
                  slotIcon={SlotIcon}
                  onAdded={handleAdded}
                />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Part card ───────────────────────────────────────────────────────── */
function PartPickerCard({
  part,
  slot,
  buildId,
  slotIcon: SlotIcon,
  onAdded,
}: {
  part: PCPart;
  slot: PCSlot;
  buildId: string;
  slotIcon: (typeof SLOT_ICONS)[PCSlot] | null;
  onAdded: (build: PCBuild, name: string) => void;
}) {
  const tPicker = useTranslations("PCBuilder.picker");
  const locale = useLocale();
  const rtl = locale === "ar";
  const [showVariations, setShowVariations] = useState(false);
  const [isSelecting, startSelect] = useTransition();
  const partName = rtl && part.name_ar ? part.name_ar : part.name;
  const price = part.price ?? part.base_price;
  const hasDiscount = part.price && part.base_price && Number(part.price) < Number(part.base_price);
  const inStock = part.product_stock === null || part.product_stock > 0;
  const hasVariations = part.available_variations.length > 0;
  const isIncompatible = part.is_compatible === false;
  const specChips = getSpecChips(part.spec, slot);

  function addToBuild(variationId?: string) {
    startSelect(async () => {
      const res = await upsertBuildItemAction(buildId, slot, part.id, variationId);
      if (res.status === "success" && res.data) {
        onAdded(res.data, partName);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <li className={isIncompatible ? "flex h-full flex-col opacity-50" : "flex h-full flex-col"}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (isSelecting || !inStock) return;
          if (hasVariations) setShowVariations((v) => !v);
          else addToBuild();
        }}
        onKeyDown={(e) => e.key === "Enter" && !isSelecting && inStock && (hasVariations ? setShowVariations((v) => !v) : addToBuild())}
        className={[
          "group flex h-full min-h-11 w-full cursor-pointer flex-col gap-3 rounded-lg border p-3 text-left transition-all duration-200",
          isIncompatible
            ? "border-[#FF6B70]/15 bg-white/2 hover:border-[#FF6B70]/25"
            : part.is_compatible === true
              ? "border-white/8 bg-white/3 hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/6"
              : "border-white/8 bg-white/3 hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/6",
          !inStock && "cursor-not-allowed",
        ].join(" ")}
        aria-disabled={isSelecting || !inStock}
      >
        {/* Thumbnail */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[7.5rem] items-center justify-center overflow-hidden rounded-md bg-white/6 transition-colors group-hover:bg-white/9">
          {part.thumbnail ? (
            <Image
              src={part.thumbnail}
              alt={partName}
              width={72}
              height={72}
              className="h-full w-full object-contain p-1.5"
              unoptimized
            />
          ) : SlotIcon ? (
            <SlotIcon className="h-7 w-7 text-white/20" />
          ) : null}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Out</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#EDEFF0] group-hover:text-white">
            {partName}
          </p>

          {/* Spec chips */}
          {specChips.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {specChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Price row */}
          <div className="mt-2 flex items-center gap-2">
            {isSelecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
            ) : (
              <>
                {price && (
                  <span className="text-sm font-bold text-[#d12f27]">
                    {Number(price).toFixed(2)} JOD
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs text-white/30 line-through">
                    {Number(part.base_price).toFixed(2)}
                  </span>
                )}
                {!inStock && (
                  <span className="text-xs font-semibold text-white/30">{tPicker("outOfStock")}</span>
                )}
              </>
            )}

            {/* Compat badge pushed right */}
            <span className="ms-auto">
              {isIncompatible ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B70]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6B70]">
                  <X className="h-2.5 w-2.5" /> Incompatible
                </span>
              ) : part.is_compatible === true ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Check className="h-2.5 w-2.5" /> Compatible
                </span>
              ) : inStock && hasVariations ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/30">
                  {showVariations
                    ? <ChevronUp className="h-3 w-3" />
                    : <ChevronDown className="h-3 w-3" />}
                  Options
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      {/* Variation picker */}
      {showVariations && hasVariations && (
        <div className="mt-1 flex flex-col gap-1.5 rounded-lg border border-[#9e1d20]/15 bg-[#9e1d20]/5 p-3">
          {part.available_variations.map((group) =>
            group.options.map((option) => {
              const optionPrice = option.variation_price ?? price;
              const optionInStock = option.variation_stock > 0;
              return (
                <button
                  key={option.variation_id}
                  type="button"
                  disabled={isSelecting || !optionInStock}
                  onClick={() => addToBuild(option.variation_id)}
                  className="flex min-h-11 items-center justify-between rounded-md border border-white/8 bg-white/3 px-3.5 py-2.5 text-sm text-white/80 transition-all hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="font-medium">
                    {(rtl && group.name_ar) || group.name}: {(rtl && option.value_ar) || option.value}
                  </span>
                  <span className="ms-4 shrink-0 font-bold text-[#d12f27]">
                    {optionPrice ? `${Number(optionPrice).toFixed(2)} JOD` : ""}
                    {!optionInStock && (
                      <span className="ms-1.5 font-normal text-white/30">{tPicker("outOfStock")}</span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </li>
  );
}
