"use client";

import Image from "next/image";
import { useEffect, useRef, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { removeBuildItemAction } from "@/features/pc-builder/actions/mutations";
import { SLOT_ORDER, type PCSlot } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "./slot-icons";
import { useBuilderMotion } from "./builder-motion";

interface SlotRowProps {
  slot: PCSlot;
  buildId: string;
  onOpenPicker: (slot: PCSlot) => void;
  index?: number;
}

/** Newegg/Microless-style component row: category | selection | price | select */
export function SlotRow({ slot, buildId, onOpenPicker, index = 0 }: SlotRowProps) {
  const t = useTranslations("PCBuilder");
  const locale = useLocale();
  const rtl = locale === "ar";
  const item = usePCBuilderStore((s) => s.items[slot]);
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const redIssues = usePCBuilderStore((s) => s.compatibility.red_issues);
  const yellowIssues = usePCBuilderStore((s) => s.compatibility.yellow_issues);
  const { activeSlot, pulseSlot, pulseKey, reduceMotion } = useBuilderMotion();
  const [isRemoving, startRemove] = useTransition();
  const confirmRef = useRef<HTMLSpanElement>(null);

  const issue = [...redIssues, ...yellowIssues].find((entry) => entry.slot === slot);
  const isBlocking = redIssues.some((entry) => entry.slot === slot);
  const isActive = activeSlot === slot;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    startRemove(async () => {
      if (item?.id.startsWith("demo-")) {
        const store = usePCBuilderStore.getState();
        const nextItems = { ...store.items };
        delete nextItems[slot];
        const itemList = Object.values(nextItems).filter(Boolean) as NonNullable<(typeof nextItems)[PCSlot]>[];
        const subtotal = itemList.reduce((sum, entry) => sum + Number(entry.unit_price || 0), 0);
        const discountPercent =
          itemList.length >= 12 ? 15 : itemList.length >= 9 ? 12 : itemList.length >= 7 ? 8 : itemList.length >= 5 ? 5 : 0;
        setBuild({
          id: buildId,
          build_token: null,
          is_template: false,
          tier: null,
          name: "Black Mamba Build",
          name_ar: "جهاز بلاك مامبا",
          target_performance: "",
          thumbnail: null,
          display_order: 0,
          preference_processor_brand: store.preferences.preference_processor_brand,
          preference_graphics_brand: store.preferences.preference_graphics_brand,
          preference_color: store.preferences.preference_color,
          items: itemList,
          total_power_draw_watts: store.totalPowerDrawWatts,
          has_blocking_issues: store.hasBlockingIssues,
          compatibility: store.compatibility,
          pricing: {
            subtotal: subtotal.toFixed(2),
            discount_percent: String(discountPercent),
            total_price: (subtotal * (1 - discountPercent / 100)).toFixed(2),
            part_count: itemList.length,
            next_tier: null,
          },
          is_shareable: false,
          share_slug: null,
        });
        return;
      }

      const res = await removeBuildItemAction(buildId, slot);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
      } else {
        toast.error(res.message);
      }
    });
  };

  const part = item?.product_details;
  const partName = part ? (rtl && part.name_ar ? part.name_ar : part.name) : null;
  const price = part?.price ?? part?.base_price;
  const SlotIcon = SLOT_ICONS[slot];
  const slotLabel = t(`slots.${slot}`);
  const bay = String(SLOT_ORDER.indexOf(slot) + 1).padStart(2, "0");
  const specHint = part?.spec
    ? [
        part.spec.socket,
        part.spec.memory_type,
        part.spec.wattage ? `${part.spec.wattage}W` : null,
        part.spec.tdp_watts ? `${part.spec.tdp_watts}W` : null,
      ]
        .filter(Boolean)
        .slice(0, 2)
        .join(" · ")
    : null;

  useEffect(() => {
    if (pulseSlot !== slot || reduceMotion) return;
    const el = confirmRef.current;
    if (!el) return;
    el.classList.remove("bm-confirm-pulse");
    void el.offsetWidth;
    el.classList.add("bm-confirm-pulse");
  }, [pulseSlot, pulseKey, slot, reduceMotion]);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      data-slot-row={slot}
      onClick={() => onOpenPicker(slot)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenPicker(slot);
        }
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: reduceMotion ? 0 : 0.4 + index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group grid w-full cursor-pointer grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 py-3 text-start sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_6.5rem_auto] sm:gap-4 sm:px-4 sm:py-3.5",
        "bg-card/40 transition-colors hover:bg-muted/40",
        isActive && "bg-primary/10",
        isBlocking && "bg-destructive/5",
        issue && !isBlocking && "bg-deal/5"
      )}
    >
      <span
        ref={confirmRef}
        className="pointer-events-none absolute size-0 opacity-0"
        aria-hidden
      />

      {/* Component category */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "hidden w-6 shrink-0 font-mono text-[10px] tabular-nums sm:inline",
            part ? "text-primary" : "text-muted-foreground/50"
          )}
        >
          {bay}
        </span>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border",
            part ? "border-primary/35 bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
          )}
        >
          <SlotIcon className="size-4" strokeWidth={1.6} />
        </div>
        <p
          className={cn(
            "truncate text-[13px] font-semibold",
            part ? "text-foreground" : "text-muted-foreground",
            rtl && "font-cairo"
          )}
        >
          {slotLabel}
        </p>
      </div>

      {/* Selection */}
      <div className="flex min-w-0 items-center gap-3">
        {part?.thumbnail ? (
          <div className="relative hidden size-11 shrink-0 overflow-hidden rounded-md border border-border bg-background sm:block">
            <Image src={part.thumbnail} alt="" fill className="object-contain p-1" unoptimized />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          {part ? (
            <>
              <p className={cn("truncate text-sm font-medium text-foreground", rtl && "font-cairo")}>
                {partName}
                {item?.variation_details?.attribute_names?.length ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {item.variation_details.attribute_names.join(", ")}
                  </span>
                ) : null}
              </p>
              {specHint ? (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{specHint}</p>
              ) : null}
              {issue ? (
                <p className="mt-0.5 truncate text-[11px] text-destructive">{issue.message}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("select", { slot: slotLabel })}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="hidden text-end sm:block">
        {part && price ? (
          <span className="text-sm font-bold tabular-nums text-primary">
            {Number(price).toFixed(2)} JOD
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center justify-end gap-1.5">
        {part ? (
          <>
            <span className="hidden rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-foreground sm:inline">
              {t("changePart")}
            </span>
            <span
              role="button"
              onClick={handleRemove}
              className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              aria-disabled={isRemoving}
              aria-label={t("removePart")}
            >
              <X className="size-3.5" />
            </span>
          </>
        ) : (
          <span className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-[12px] font-bold tracking-wide text-white uppercase transition-colors group-hover:bg-[#EB0B1A]">
            <Plus className="size-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">{t("selectBtn")}</span>
          </span>
        )}
        {part && price ? (
          <span className="text-xs font-bold tabular-nums text-primary sm:hidden">
            {Number(price).toFixed(2)}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
