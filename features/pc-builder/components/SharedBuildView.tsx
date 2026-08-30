"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Wrench, Zap, Loader2 } from "lucide-react";
import { cloneSharedBuildAction } from "@/features/pc-builder/actions/mutations";
import type { PCBuild } from "@/features/pc-builder/types";
import { BuilderPageShell, BlackMambaLogo } from "./BuilderPageShell";
import { SLOT_ICONS } from "./slot-icons";

export function SharedBuildView({ build, shareSlug }: { build: PCBuild; shareSlug: string }) {
  const t = useTranslations("PCBuilder");
  const tShared = useTranslations("PCBuilder.shared");
  const tSummary = useTranslations("PCBuilder.summary");
  const locale = useLocale();
  const rtl = locale === "ar";
  const router = useRouter();
  const [isCloning, startClone] = useTransition();
  const name = (rtl && build.name_ar) || build.name || tShared("defaultName");

  function handleCustomize() {
    startClone(async () => {
      const res = await cloneSharedBuildAction(shareSlug);
      if (res.status === "success") {
        router.push("/pc-builder");
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <BuilderPageShell>
      <div className="mx-auto max-w-3xl" dir={rtl ? "rtl" : "ltr"}>
        <header className="mb-8">
          <BlackMambaLogo size="sm" />
          <div className="mt-5 border-t border-[#9e1d20]/20 pt-5">
            <h1
              className={
                rtl
                  ? "font-cairo text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-none text-[#EDEFF0]"
                  : "font-beckman text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-none tracking-wide text-[#EDEFF0]"
              }
            >
              {name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-white/50">
              <Zap className="h-4 w-4 text-[#d12f27]" />
              {build.total_power_draw_watts}W · {tShared("partsCount", { count: build.items.length })}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCustomize}
            disabled={isCloning}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#9e1d20] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7a1618] disabled:opacity-50"
          >
            {isCloning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            {tShared("customizeThisBuild")}
          </button>
        </header>

        <div className="rounded-lg border border-[#9e1d20]/15 bg-[#17181B] p-6">
          <ul className="flex flex-col gap-3">
            {build.items.map((item) => {
              const SlotIcon = SLOT_ICONS[item.slot];
              const partName = (rtl && item.product_details.name_ar) || item.product_details.name;
              return (
                <li key={item.id} className="flex items-center gap-3 border-b border-[#26292C] pb-3 last:border-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9e1d20]/10">
                    <SlotIcon className="h-4 w-4 text-[#9e1d20]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-white/40">{t(`slots.${item.slot}`)}</p>
                    <p className="truncate text-sm font-medium text-[#EDEFF0]">{partName}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#EDEFF0]">{Number(item.unit_price).toFixed(2)} JOD</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-1 border-t border-[#26292C] pt-4 text-sm">
            <div className="flex justify-between text-white/60">
              <span>{tSummary("subtotal")}</span>
              <span>{Number(build.pricing.subtotal).toFixed(2)} JOD</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>{tSummary("bundleDiscount")}</span>
              <span className="text-[#d12f27]">-{build.pricing.discount_percent}%</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-[#EDEFF0]">
              <span>{tSummary("total")}</span>
              <span className="text-lg font-bold text-[#d12f27]">{Number(build.pricing.total_price).toFixed(2)} JOD</span>
            </div>
          </div>
        </div>
      </div>
    </BuilderPageShell>
  );
}
