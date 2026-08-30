"use client";

import Image from "next/image";
import { useEffect, useRef, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { X, ChevronRight, ChevronLeft, Plus } from "lucide-react";
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
}

export function SlotRow({ slot, buildId, onOpenPicker }: SlotRowProps) {
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
  const ChevronIcon = rtl ? ChevronLeft : ChevronRight;
  const slotLabel = t(`slots.${slot}`);
  const bay = String(SLOT_ORDER.indexOf(slot) + 1).padStart(2, "0");
  const index = SLOT_ORDER.indexOf(slot);
  const specHint = part?.spec
    ? [part.spec.socket, part.spec.memory_type, part.spec.wattage ? `${part.spec.wattage}W` : null, part.spec.tdp_watts ? `${part.spec.tdp_watts}W` : null]
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
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.32, delay: reduceMotion ? 0 : 0.55 + index * 0.045, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.32, delay: reduceMotion ? 0 : 0.55 + index * 0.045, ease: [0.22, 1, 0.36, 1] },
      }}
      whileHover={reduceMotion ? undefined : { y: -2, transition: { duration: 0.18, delay: 0 } }}
      className={cn(
        "group relative flex min-h-11 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border px-3 py-3 text-start sm:gap-4 sm:px-4 sm:py-3.5",
        "transition-[border-color,background-color,box-shadow] duration-200",
        "hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.9)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(110deg,rgba(255,255,255,0.05),transparent_42%)] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100",
        part
          ? "border-[#9e1d20]/40 bg-[#9e1d20]/8 hover:border-[#d12f27]/55 hover:bg-[#9e1d20]/12"
          : "border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]",
        isActive && "border-[#d12f27]/70 bg-[#9e1d20]/12 shadow-[inset_3px_0_0_0_#9e1d20]",
        part && !isActive && "shadow-[inset_3px_0_0_0_#9e1d20]",
        isBlocking && "bm-warn-pulse border-[#FF6B70]/45",
        issue && !isBlocking && "border-[#F5C147]/30"
      )}
    >
      <span
        ref={confirmRef}
        className="pointer-events-none absolute start-8 top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#d12f27] opacity-0"
        aria-hidden
      />

      <span
        className={cn(
          "w-7 shrink-0 font-beckman text-[11px] tracking-widest sm:w-8 sm:text-xs",
          part ? "text-[#d12f27]" : "text-white/25",
          rtl && "font-cairo font-bold tracking-normal"
        )}
      >
        {bay}
      </span>

      <div
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md sm:size-14",
          part ? "bg-[#0d0e0e] ring-1 ring-[#9e1d20]/35" : "bg-white/4 ring-1 ring-white/8",
          "transition-[box-shadow] duration-200 group-hover:shadow-[0_0_16px_-6px_rgba(209,47,39,0.7)]"
        )}
      >
        {part?.thumbnail ? (
          <Image
            src={part.thumbnail}
            alt={partName ?? ""}
            width={56}
            height={56}
            className="size-full object-contain p-1 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300"
            unoptimized
          />
        ) : (
          <SlotIcon
            className={cn(
              "size-5 transition-colors duration-200",
              part ? "text-[#d12f27]" : "text-white/28 group-hover:text-[#d12f27]/80"
            )}
          />
        )}
        <span
          className={cn(
            "absolute end-1 top-1 size-1.5 rounded-full",
            part ? "bg-[#d12f27] shadow-[0_0_8px_#d12f27]" : "bg-white/20"
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">{slotLabel}</p>
          <span
            className={cn(
              "rounded-sm px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.12em]",
              part ? "bg-[#9e1d20]/20 text-[#d12f27]" : "bg-white/6 text-white/30"
            )}
          >
            {part ? t("hud.selected") : t("hud.empty")}
          </span>
        </div>
        {part ? (
          <>
            <p className="truncate text-sm font-semibold text-[#EDEFF0]">
              {partName}
              {item?.variation_details?.attribute_names?.length ? (
                <span className="font-medium text-white/45"> · {item.variation_details.attribute_names.join(", ")}</span>
              ) : null}
            </p>
            {specHint ? <p className="mt-0.5 truncate text-[11px] text-white/35">{specHint}</p> : null}
            {issue ? <p className="mt-0.5 truncate text-[11px] text-[#FF8A8E]">{issue.message}</p> : null}
          </>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-medium text-white/48 transition-colors group-hover:text-white/75">
            <Plus className="size-3.5 opacity-60" />
            {t("select", { slot: slotLabel })}
          </p>
        )}
      </div>

      {part && price && (
        <span className="hidden shrink-0 text-sm font-bold tabular-nums text-[#d12f27] sm:inline">
          {Number(price).toFixed(2)} JOD
        </span>
      )}

      {part ? (
        <span
          role="button"
          onClick={handleRemove}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          aria-disabled={isRemoving}
        >
          <X className="h-4 w-4" />
        </span>
      ) : (
        <ChevronIcon className="h-4 w-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/50 rtl:group-hover:-translate-x-0.5" />
      )}
    </motion.div>
  );
}
