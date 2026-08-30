"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, Wrench, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { customizeReadyMadeAction, addBuildToCartAction } from "@/features/pc-builder/actions/mutations";
import { useCartStore } from "@/stores/cart-store";
import { SLOT_ORDER, type PCBuild, type PCSlot } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "./slot-icons";

function RigStrip({ filledSlots }: { filledSlots: Set<PCSlot> }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-1.5 px-6">
      {SLOT_ORDER.map((slot) => {
        const Icon = SLOT_ICONS[slot];
        const filled = filledSlots.has(slot);
        return (
          <div
            key={slot}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
              filled
                ? "border-[#9e1d20]/40 bg-[#9e1d20]/10 text-[#9e1d20]"
                : "border-white/8 bg-white/3 text-white/15"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        );
      })}
    </div>
  );
}

export function ReadyMadeCard({ build }: { build: PCBuild }) {
  const t = useTranslations("PCBuilder.readyMade");
  const locale = useLocale();
  const rtl = locale === "ar";
  const router = useRouter();
  const setCartCount = useCartStore((s) => s.setCount);
  const [isCustomizing, startCustomize] = useTransition();
  const [isAdding, startAdd] = useTransition();
  const name = rtl && build.name_ar ? build.name_ar : build.name;

  function handleCustomize() {
    startCustomize(async () => {
      const res = await customizeReadyMadeAction(build.id);
      if (res.status === "success" && res.data) {
        router.push("/pc-builder");
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleAddToCart() {
    startAdd(async () => {
      const res = await addBuildToCartAction(build.id, 1);
      if (res.status === "success" && res.data) {
        setCartCount(res.data.count);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  const filledSlots = new Set(build.items.map((item) => item.slot));

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[#26292C] bg-[#17181B] transition-colors hover:border-[#9e1d20]/30">
      <div className="relative h-28 w-full overflow-hidden bg-[#0B0F0E]">
        {build.thumbnail ? (
          <Image src={build.thumbnail} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <RigStrip filledSlots={filledSlots} />
        )}
        {build.tier && (
          <span className="absolute left-3 top-3 rounded-full border border-[#9e1d20]/30 bg-[#0D0D0D]/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#9e1d20] rtl:left-auto rtl:right-3">
            {build.tier}
          </span>
        )}
        {build.total_power_draw_watts > 0 && (
          <span className="absolute bottom-2 right-3 flex items-center gap-1 rounded-full bg-[#0D0D0D]/80 px-2 py-0.5 text-[11px] font-medium text-white/60 rtl:right-auto rtl:left-3">
            <Zap className="h-3 w-3 text-[#9e1d20]" />
            {build.total_power_draw_watts}W
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="min-w-0">
          <h3 className={cn("truncate", rtl ? "font-cairo text-lg font-bold text-[#EDEFF0]" : "font-chillax text-xl uppercase tracking-wide text-[#EDEFF0]")}>{name}</h3>
          {build.target_performance && <p className="truncate text-sm text-white/50">{build.target_performance}</p>}
        </div>

        <ul className="flex flex-1 flex-col gap-1.5 text-[12.5px] text-white/60">
          {build.items.slice(0, 6).map((item) => {
            const Icon = SLOT_ICONS[item.slot];
            const partName = rtl && item.product_details.name_ar ? item.product_details.name_ar : item.product_details.name;
            return (
              <li key={item.id} className="flex items-center gap-1.5 truncate">
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/30" />
                <span className="truncate">{partName}</span>
              </li>
            );
          })}
          {build.items.length > 6 && (
            <li className="text-white/40">{t("morePartsCount", { count: build.items.length - 6 })}</li>
          )}
        </ul>

        <div className="flex flex-col gap-3 border-t border-[#26292C] pt-3">
          <div>
            <p className="text-xs text-white/40">{t("bundlePrice")}</p>
            <p className="text-lg font-bold text-[#9e1d20]">{Number(build.pricing.total_price).toFixed(2)} JOD</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCustomize}
              disabled={isCustomizing}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-[#EDEFF0] transition-colors hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/10 hover:text-[#9e1d20] disabled:opacity-50"
            >
              {isCustomizing ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Wrench className="h-4 w-4 shrink-0" />}
              {t("customize")}
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || build.has_blocking_issues}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#9e1d20] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7a1618] disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <ShoppingCart className="h-4 w-4 shrink-0" />}
              {t("addToCart")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
