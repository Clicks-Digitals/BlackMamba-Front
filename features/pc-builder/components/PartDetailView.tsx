"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { upsertBuildItemAction } from "@/features/pc-builder/actions/mutations";
import type { PCPart } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "./slot-icons";
import { getSpecRows } from "./spec-rows";

interface PartDetailViewProps {
  part: PCPart;
  buildId: string;
}

export function PartDetailView({ part, buildId }: PartDetailViewProps) {
  const t = useTranslations("PCBuilder");
  const tDetail = useTranslations("PCBuilder.detail");
  const tSpecs = useTranslations("PCBuilder.specs");
  const locale = useLocale();
  const rtl = locale === "ar";
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const [isAdding, startAdd] = useTransition();
  const slot = part.spec?.slot;
  const SlotIcon = slot ? SLOT_ICONS[slot] : null;
  const specRows = getSpecRows(part.spec, tSpecs);
  const partName = rtl && part.name_ar ? part.name_ar : part.name;
  const description = rtl && part.description_ar ? part.description_ar : part.description;

  const variationOptions = part.available_variations.flatMap((g) =>
    g.options.map((o) => ({ group: (rtl && g.name_ar) || g.name, ...o }))
  );
  const [selectedVariationId, setSelectedVariationId] = useState<string | undefined>(variationOptions[0]?.variation_id);
  const selectedVariation = variationOptions.find((v) => v.variation_id === selectedVariationId);

  const price = selectedVariation ? selectedVariation.variation_price ?? part.price : part.price ?? part.base_price;
  const inStock = selectedVariation ? selectedVariation.variation_stock > 0 : part.product_stock === null || part.product_stock > 0;

  function handleAdd() {
    if (!slot) return;
    startAdd(async () => {
      const res = await upsertBuildItemAction(buildId, slot, part.id, selectedVariationId);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
        toast.success(partName);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-3" dir={rtl ? "rtl" : "ltr"}>
      {/* Slot chip */}
      {slot && (
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[#9e1d20]/15 px-3 font-chillax text-[11px] font-semibold uppercase tracking-widest text-[#9e1d20]">
            {SlotIcon && <SlotIcon className="h-3 w-3" />}
            {t(`slots.${slot}`)}
          </span>
        </div>
      )}

      {/* Part name — Oswald-style caps (font-chillax); Beckman reserved for big headlines only */}
      <h1
        className={cn(
          "leading-none text-[#EDEFF0]",
          rtl
            ? "font-cairo font-bold text-[clamp(1.3rem,3vw,2.2rem)]"
            : "font-chillax uppercase text-[clamp(1.5rem,3.5vw,2.5rem)]"
        )}
      >
        {partName}
      </h1>

      <div className="h-px bg-[#26292C]" />

      {/* Compatibility badge — Black Mamba: white = ok, red = incompatible (no green) */}
      {part.is_compatible === false && (
        <div className="flex items-center gap-2 rounded-lg border border-[#3a1c1e] bg-[#2A1416] px-3 py-2 text-sm text-[#F08A8A]">
          <X className="h-4 w-4 shrink-0" />
          {tDetail("incompatible")}
        </div>
      )}
      {part.is_compatible === true && (
        <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm text-[#EDEDED]">
          <Check className="h-4 w-4 shrink-0" />
          {tDetail("compatible")}
        </div>
      )}

      {/* Price */}
      <p className="font-chillax text-5xl leading-none text-[#EDEFF0]">
        {price ? `${Number(price).toFixed(2)} JOD` : "—"}
      </p>

      {/* Description */}
      {description && (
        <p className="font-chillax text-sm leading-relaxed text-white/55">{description}</p>
      )}

      {/* Variation selector */}
      {variationOptions.length > 0 && (
        <>
          <div className="h-px bg-[#26292C]" />
          <div className="flex flex-col gap-1.5">
            <h3 className="font-chillax text-xl tracking-wide text-[#EDEFF0]">{variationOptions[0].group}</h3>
            <div className="flex flex-wrap gap-2.5">
              {variationOptions.map((option) => (
                <button
                  key={option.variation_id}
                  type="button"
                  disabled={option.variation_stock <= 0}
                  onClick={() => setSelectedVariationId(option.variation_id)}
                  className={cn(
                    "h-9 rounded-md px-4 font-chillax text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40",
                    selectedVariationId === option.variation_id
                      ? "bg-[#9e1d20] text-white shadow-sm"
                      : "border border-white/15 bg-transparent text-[#EDEFF0] hover:border-[#9e1d20]/50 hover:bg-[#9e1d20]/5"
                  )}
                >
                  {(rtl && option.value_ar) || option.value}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spec rows */}
      {specRows.length > 0 && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#26292C] bg-[#17181B] p-4">
          {specRows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-white/40">{row.label}</span>
              <span className="text-sm font-medium text-[#EDEFF0]">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add to Build */}
      <div className="h-px bg-[#26292C]" />
      <button
        type="button"
        disabled={isAdding || !inStock || part.is_compatible === false || !slot}
        onClick={handleAdd}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2.5 rounded-lg font-chillax text-base font-bold tracking-wide transition-all",
          !isAdding && inStock && part.is_compatible !== false && slot
            ? "bg-[#9e1d20] text-white hover:bg-[#7a1618] hover:shadow-lg active:scale-[0.99]"
            : "cursor-not-allowed bg-[#9e1d20]/25 text-white/50"
        )}
      >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={18} strokeWidth={1.8} />}
        {inStock ? tDetail("addToBuild") : tDetail("outOfStock")}
      </button>
    </div>
  );
}
