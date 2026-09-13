"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Check, X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { upsertBuildItemAction } from "@/features/pc-builder/actions/mutations";
import type { PCPart } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "./slot-icons";

interface PartCatalogueCardProps {
  part: PCPart;
  buildId: string;
}

function discountPercent(part: PCPart): number | null {
  if (!part.discount_price || !part.base_price) return null;
  const b = Number.parseFloat(part.base_price);
  const d = Number.parseFloat(part.discount_price);
  if (!Number.isFinite(b) || b <= 0 || !Number.isFinite(d) || d >= b) return null;
  return Math.round(((b - d) / b) * 100);
}

export function PartCatalogueCard({ part, buildId }: PartCatalogueCardProps) {
  const t = useTranslations("PCBuilder");
  const tBadges = useTranslations("PCBuilder.badges");
  const tCat = useTranslations("PCBuilder.catalogue");
  const locale = useLocale();
  const rtl = locale === "ar";
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const [isAdding, startAdd] = useTransition();
  const partName = rtl && part.name_ar ? part.name_ar : part.name;
  const price = part.price ?? part.base_price;
  const pct = discountPercent(part);
  const origPrice = pct != null ? part.base_price : null;
  const inStock = part.product_stock === null || part.product_stock > 0;
  const slot = part.spec?.slot;
  const SlotIcon = slot ? SLOT_ICONS[slot] : null;
  const hasVariations = part.available_variations.length > 0;

  function handleAdd() {
    if (!slot || hasVariations) return;
    startAdd(async () => {
      const res = await upsertBuildItemAction(buildId, slot, part.id);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
        toast.success(tCat("addedToBuild", { name: partName }));
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-[10px] border border-[#000000] bg-[#000000] transition-colors hover:border-[#EB0B1A]/30">
      <Link href={`/pc-builder/parts/${part.slug}`} className="relative block aspect-[1/0.85] w-full bg-[#000000]">
        {part.thumbnail ? (
          <Image src={part.thumbnail} alt={partName} fill className="object-contain p-3" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            {SlotIcon && <SlotIcon className="h-8 w-8 text-white/15" />}
          </div>
        )}
        {part.is_compatible === false && (
          <span className="absolute inset-e-1.5 top-1.5 flex h-4.5 items-center gap-1 rounded-[5px] bg-[#EB0B1A] px-1.5 text-[9px] font-bold text-[#EB0B1A]">
            <X className="h-2.5 w-2.5" /> {tBadges("incompatible")}
          </span>
        )}
        {part.is_compatible === true && (
          <span className="absolute inset-e-1.5 top-1.5 flex h-4.5 items-center gap-1 rounded-[5px] bg-white/10 px-1.5 text-[9px] font-bold text-[#FFFFFF]">
            <Check className="h-2.5 w-2.5" /> {tBadges("compatible")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-2.5 py-2">
        {slot && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">
            {t(`slots.${slot}`)}
          </span>
        )}
        <Link
          href={`/pc-builder/parts/${part.slug}`}
          className="line-clamp-2 min-h-8 text-[12.5px] leading-snug font-semibold text-[#FFFFFF] hover:text-[#EB0B1A]"
        >
          {partName}
        </Link>

        <div className={cn("mt-auto flex items-baseline gap-1.5", rtl && "flex-row-reverse justify-end")}>
          <span className="text-[15px] font-bold leading-none text-[#EB0B1A]">
            {price ? `${Number(price).toFixed(2)} JOD` : "—"}
          </span>
          {origPrice && (
            <span className="text-[10.5px] leading-none text-white/35 line-through">
              {Number(origPrice).toFixed(2)}
            </span>
          )}
          {pct != null && <span className="text-[10px] font-bold leading-none text-[#EB0B1A]">-{pct}%</span>}
        </div>

        <div className="mt-1.5">
          {hasVariations ? (
            <Link
              href={`/pc-builder/parts/${part.slug}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#FFFFFF] transition-colors hover:bg-[#EB0B1A] hover:text-white"
            >
              {tCat("chooseOption")}
            </Link>
          ) : (
            <button
              type="button"
              disabled={isAdding || !inStock || part.is_compatible === false || !slot}
              onClick={handleAdd}
              title={!inStock ? tBadges("outOfStock") : tBadges("addToBuild")}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#FFFFFF] transition-colors hover:bg-[#EB0B1A] hover:text-white disabled:opacity-40"
            >
              {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              {inStock ? tBadges("addToBuild") : tBadges("outOfStock")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
