"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Sparkles, Wand2, Wallet, Loader2 } from "lucide-react";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { quickStartAction, surpriseMeAction, buildToBudgetAction } from "@/features/pc-builder/actions/mutations";
import { useBuilderMotion, fadeUp } from "./builder-motion";

const TIER_VALUES = ["BUDGET", "MID", "HIGH", "ULTRA"] as const;
const TIER_KEYS: Record<(typeof TIER_VALUES)[number], string> = {
  BUDGET: "budget",
  MID: "midRange",
  HIGH: "highEnd",
  ULTRA: "ultra",
};

interface AutoBuilderControlsProps {
  buildId: string;
}

export function AutoBuilderControls({ buildId }: AutoBuilderControlsProps) {
  const t = useTranslations("PCBuilder.autoBuilders");
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [isQuickStarting, startQuickStart] = useTransition();
  const [isSurprising, startSurprise] = useTransition();
  const [isBudgeting, startBudget] = useTransition();
  const [budget, setBudget] = useState("");
  const { setAssembling, setMobileSummaryOpen, reduceMotion } = useBuilderMotion();
  const busy = isQuickStarting || isSurprising || isBudgeting;

  function afterResult(ok: boolean) {
    setAssembling(false);
    if (!ok) return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) {
      setMobileSummaryOpen(true);
    } else {
      document.getElementById("bm-build-summary")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }

  function handleQuickStart(tier: (typeof TIER_VALUES)[number]) {
    setPendingTier(tier);
    setAssembling(true);
    startQuickStart(async () => {
      const res = await quickStartAction(buildId, tier);
      setPendingTier(null);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
        toast.success(res.message);
        afterResult(true);
      } else {
        toast.error(res.message);
        afterResult(false);
      }
    });
  }

  function handleSurpriseMe() {
    setAssembling(true);
    startSurprise(async () => {
      const res = await surpriseMeAction(buildId);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
        toast.success(res.message);
        afterResult(true);
      } else {
        toast.error(res.message);
        afterResult(false);
      }
    });
  }

  function handleBuildToBudget(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(budget);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(t("invalidBudget"));
      return;
    }
    setAssembling(true);
    startBudget(async () => {
      const res = await buildToBudgetAction(buildId, value);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
        toast.success(res.message);
        afterResult(true);
      } else {
        toast.error(res.message);
        afterResult(false);
      }
    });
  }

  return (
    <motion.div
      {...fadeUp(0.55, reduceMotion)}
      className="relative overflow-hidden rounded-lg border border-white/10 bg-black/25 p-3.5 sm:p-4"
    >
      {busy && !reduceMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="bm-assemble-scan" />
        </div>
      )}
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/40">{t("quickStart")}</span>
          {TIER_VALUES.map((tier) => (
            <button
              key={tier}
              type="button"
              disabled={isQuickStarting}
              onClick={() => handleQuickStart(tier)}
              className="group inline-flex min-h-11 items-center rounded-md border border-white/15 px-3 text-sm font-medium text-white/80 transition-all duration-200 hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/10 hover:text-[#d12f27] active:scale-[0.98] disabled:opacity-50"
            >
              {isQuickStarting && pendingTier === tier ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                t(TIER_KEYS[tier])
              )}
            </button>
          ))}

          <span className="mx-2 h-5 w-px bg-white/10" />

          <button
            type="button"
            disabled={isSurprising}
            onClick={handleSurpriseMe}
            className="group flex min-h-11 items-center gap-1.5 rounded-md border border-white/15 px-3 text-sm font-medium text-white/80 transition-all duration-200 hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/10 hover:text-[#d12f27] active:scale-[0.98] disabled:opacity-50"
          >
            {isSurprising ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-12" />
            )}
            {t("surpriseMe")}
          </button>
        </div>

        <form onSubmit={handleBuildToBudget} className="flex flex-wrap items-center gap-2">
          <Wallet className="h-4 w-4 shrink-0 text-white/40" />
          <input
            type="number"
            min={1}
            step="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder={t("budgetPlaceholder")}
            className="h-11 w-36 rounded-md border border-white/15 bg-transparent px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#9e1d20]/50"
          />
          <button
            type="submit"
            disabled={isBudgeting}
            className="group flex min-h-11 items-center gap-1.5 rounded-md bg-[#9e1d20] px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#7a1618] disabled:opacity-50"
          >
            {isBudgeting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-px" />
            )}
            {t("buildToBudget")}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
