"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertTriangle, XCircle, Zap, ShoppingCart, Loader2, Share2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { applyFixAction, addBuildToCartAction, shareBuildAction } from "@/features/pc-builder/actions/mutations";
import { SLOT_ORDER, CORE_SLOTS, type PCSlot } from "@/features/pc-builder/types";
import { useCartStore } from "@/stores/cart-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RigPreview } from "./RigPreview";
import { useBuilderMotion, fadeUp } from "./builder-motion";
import { useAnimatedNumber } from "./use-animated-number";

interface SummarySidebarProps {
  buildId: string;
  onBrowseSlot: (slot: PCSlot) => void;
}

export function SummarySidebar({ buildId, onBrowseSlot }: SummarySidebarProps) {
  const { reduceMotion, mobileSummaryOpen, setMobileSummaryOpen, activeSlot } = useBuilderMotion();
  const t = useTranslations("PCBuilder");
  const pricing = usePCBuilderStore((s) => s.pricing);
  const totalPowerDrawWatts = usePCBuilderStore((s) => s.totalPowerDrawWatts);
  const items = usePCBuilderStore((s) => s.items);
  const hasBlockingIssues = usePCBuilderStore((s) => s.hasBlockingIssues);
  const filled = SLOT_ORDER.filter((slot) => items[slot]).length;
  const price = useAnimatedNumber(Number(pricing?.total_price ?? 0));
  const watts = useAnimatedNumber(totalPowerDrawWatts);

  return (
    <>
      <motion.aside
        id="bm-build-summary"
        {...fadeUp(0.92, reduceMotion)}
        className="order-1 hidden h-auto w-full flex-col gap-4 overflow-visible rounded-lg border border-[#9e1d20]/30 bg-[#0a0b0c]/92 p-4 shadow-[0_0_60px_-28px_rgba(158,29,32,0.85)] backdrop-blur-sm lg:order-2 lg:sticky lg:top-[calc(var(--layout-chrome-top)+1rem)] lg:flex lg:w-[26rem]"
      >
        <BuildSummaryBody buildId={buildId} onBrowseSlot={onBrowseSlot} />
      </motion.aside>

      <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden", activeSlot && "hidden")}>
        <div className="pointer-events-auto border-t border-[#9e1d20]/30 bg-[#0a0b0c]/95 px-4 py-2.5 shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md pb-[max(0.65rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(true)}
            className="flex min-h-11 w-full items-center gap-3 rounded-md text-start"
            aria-label={t("hud.expandBuild")}
          >
            <MiniProgress filled={filled} total={SLOT_ORDER.length} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{t("summary.title")}</p>
              <p className="truncate text-sm font-semibold tabular-nums text-[#EDEFF0]">
                {price.toFixed(2)} JOD
                <span className="ms-2 font-normal text-white/40">{Math.round(watts)}W</span>
              </p>
            </div>
            <span className="inline-flex min-h-11 items-center gap-1 rounded-md border border-white/12 px-3 text-xs font-semibold text-white/70">
              {t("hud.viewBuild")}
              <ChevronUp className="size-3.5" />
            </span>
            {hasBlockingIssues ? (
              <XCircle className="size-4 shrink-0 text-[#FF6B70]" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400/80" />
            )}
          </button>
        </div>
      </div>

      <Sheet open={mobileSummaryOpen} onOpenChange={setMobileSummaryOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[100dvh] max-h-[100dvh] flex-col gap-0 overflow-y-auto border-t border-[#9e1d20]/25 bg-[#0a0b0c] p-4 text-[#EDEFF0] lg:hidden"
        >
          <SheetHeader className="px-0 pb-3">
            <SheetTitle className="text-start font-chillax text-xl uppercase tracking-wide text-[#EDEFF0]">
              {t("summary.title")}
            </SheetTitle>
            <SheetDescription className="sr-only">{t("hud.chassis")}</SheetDescription>
          </SheetHeader>
          <BuildSummaryBody buildId={buildId} onBrowseSlot={onBrowseSlot} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function MiniProgress({ filled, total }: { filled: number; total: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (filled / total) * c;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90" aria-hidden>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="#d12f27"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

function BuildSummaryBody({
  buildId,
  onBrowseSlot,
}: {
  buildId: string;
  onBrowseSlot: (slot: PCSlot) => void;
}) {
  const t = useTranslations("PCBuilder");
  const tSummary = useTranslations("PCBuilder.summary");
  const items = usePCBuilderStore((s) => s.items);
  const pricing = usePCBuilderStore((s) => s.pricing);
  const compatibility = usePCBuilderStore((s) => s.compatibility);
  const totalPowerDrawWatts = usePCBuilderStore((s) => s.totalPowerDrawWatts);
  const hasBlockingIssues = usePCBuilderStore((s) => s.hasBlockingIssues);
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const setCartCount = useCartStore((s) => s.setCount);
  const router = useRouter();
  const { assembling, reduceMotion } = useBuilderMotion();

  const [isFixing, startFix] = useTransition();
  const [isAdding, startAdd] = useTransition();
  const [isSharing, startShare] = useTransition();
  const [fixingIssueId, setFixingIssueIdState] = useState<string | null>(null);

  const displayWatts = useAnimatedNumber(totalPowerDrawWatts);
  const displayTotal = useAnimatedNumber(Number(pricing?.total_price ?? 0));
  const displaySub = useAnimatedNumber(Number(pricing?.subtotal ?? 0));

  function handleShare() {
    startShare(async () => {
      const res = await shareBuildAction(buildId);
      if (res.status === "success" && res.data?.share_slug) {
        const url = `${window.location.origin}/pc-builder/share/${res.data.share_slug}`;
        setBuild(res.data);
        try {
          await navigator.clipboard.writeText(url);
          toast.success(tSummary("shareLinkCopied"));
        } catch {
          toast.success(url);
        }
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleApplyFix(issueId: string) {
    setFixingIssueIdState(issueId);
    startFix(async () => {
      const res = await applyFixAction(buildId, issueId);
      setFixingIssueIdState(null);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleAddToCart() {
    startAdd(async () => {
      const res = await addBuildToCartAction(buildId, 1);
      if (res.status === "success" && res.data) {
        setCartCount(res.data.count);
        toast.success(res.message);
        router.push("/cart");
      } else {
        toast.error(res.message);
      }
    });
  }

  const selectedSlots = SLOT_ORDER.filter((slot) => items[slot]);
  const filled = selectedSlots.length;
  const coreFilled = CORE_SLOTS.filter((slot) => items[slot]).length;
  const complete = coreFilled === CORE_SLOTS.length && !hasBlockingIssues;
  const discountTiers = [
    { min: 3, pct: 5 },
    { min: 5, pct: 8 },
    { min: 7, pct: 12 },
    { min: 9, pct: 15 },
  ];

  return (
    <div className="relative flex flex-col gap-4">
      {assembling && !reduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-lg" aria-hidden>
          <div className="bm-assemble-scan" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-chillax text-xl uppercase tracking-wide text-[#EDEFF0]">{tSummary("title")}</h2>
        <span className="flex items-center gap-1.5 text-sm tabular-nums text-white/50">
          <Zap className="h-4 w-4 text-[#9e1d20]" />
          {Math.round(displayWatts)}W
        </span>
      </div>

      <div className="flex items-center gap-2">
        {SLOT_ORDER.map((slot) => (
          <span
            key={slot}
            title={t(`slots.${slot}`)}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              items[slot] ? "bg-[#d12f27]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <RigPreview />

      {hasBlockingIssues ? (
        <div className="flex items-center gap-2 rounded-md bg-[#2A1416] px-3 py-2 text-sm text-[#FF6B70]">
          <XCircle className="h-4 w-4 shrink-0" />
          {tSummary("issuesToResolve", { count: compatibility.red_issues.length })}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/8 px-3 py-2 text-sm text-emerald-300/90">
          <CheckDraw className="h-4 w-4 shrink-0" key={complete ? "done" : "ok"} />
          {complete ? t("hud.systemsClear") : tSummary("allCompatible")}
        </div>
      )}

      <ul className="flex flex-col gap-1.5 text-sm">
        {selectedSlots.length === 0 && <li className="text-white/40">{tSummary("noPartsYet")}</li>}
        {selectedSlots.map((slot) => {
          const item = items[slot]!;
          return (
            <li key={slot} className="flex items-center justify-between gap-3 text-white/70">
              <span className="truncate">
                <span className="text-white/40">{t(`slots.${slot}`)}:</span> {item.product_details.name}
                {item.variation_details?.attribute_names?.length
                  ? ` (${item.variation_details.attribute_names.join(", ")})`
                  : ""}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-[#EDEFF0]">
                {Number(item.unit_price).toFixed(2)} JOD
              </span>
            </li>
          );
        })}
      </ul>

      {pricing && (
        <div className="flex flex-col gap-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>{tSummary("subtotal")}</span>
            <span className="tabular-nums">{displaySub.toFixed(2)} JOD</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>{tSummary("bundleDiscount")}</span>
            <span className="text-[#9e1d20]">-{pricing.discount_percent}%</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-[#EDEFF0]">
            <span>{tSummary("total")}</span>
            <span className="text-lg font-bold tabular-nums text-[#9e1d20]">{displayTotal.toFixed(2)} JOD</span>
          </div>
        </div>
      )}

      {pricing && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {discountTiers.map((tier) => (
              <div
                key={tier.min}
                className={`flex-1 rounded-md py-1 text-center text-[11px] font-semibold ${
                  pricing.part_count >= tier.min ? "bg-[#2A1416] text-[#FF8A8E]" : "bg-white/5 text-white/30"
                }`}
              >
                {tier.min}+ · {tier.pct}%
              </div>
            ))}
          </div>
          {pricing.next_tier ? (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#9e1d20] transition-all duration-300"
                  style={{ width: `${Math.min(100, (pricing.part_count / pricing.next_tier.min_parts) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/40">
                {tSummary("addMoreParts", {
                  count: pricing.next_tier.parts_needed,
                  pct: pricing.next_tier.discount_percent,
                })}
              </p>
            </>
          ) : (
            <p className="text-xs text-emerald-300/80">{tSummary("maxDiscountUnlocked")}</p>
          )}
        </div>
      )}

      {(compatibility.red_issues.length > 0 || compatibility.yellow_issues.length > 0) && (
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          {compatibility.red_issues.map((issue) => (
            <div key={issue.id} className="bm-warn-pulse flex flex-col gap-2 rounded-md bg-[#2A1416] p-3 text-sm text-[#F08A8A]">
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{issue.message}</span>
              </div>
              {issue.suggested_fix_product_id && (
                <button
                  type="button"
                  disabled={isFixing && fixingIssueId === issue.id}
                  onClick={() => handleApplyFix(issue.id)}
                  className="min-h-11 self-start rounded-md bg-[#9e1d20]/20 px-2.5 py-2 text-xs font-semibold text-[#FF8A8E] hover:bg-[#9e1d20]/30 disabled:opacity-50"
                >
                  {isFixing && fixingIssueId === issue.id
                    ? tSummary("applying")
                    : tSummary("applyFix", { name: issue.suggested_fix_product_name ?? "" })}
                </button>
              )}
            </div>
          ))}
          {compatibility.yellow_issues.map((issue) => (
            <div key={issue.id} className="flex flex-col gap-2 rounded-md bg-white/5 p-3 text-sm text-[#EDEFF0]/80">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F5C147]" />
                <span>{issue.message}</span>
              </div>
              <button
                type="button"
                onClick={() => onBrowseSlot(issue.slot)}
                className="min-h-11 self-start rounded-md bg-white/10 px-2.5 py-2 text-xs font-semibold text-[#EDEFF0] hover:bg-white/15"
              >
                {tSummary("browseCategory", { slot: t(`slots.${issue.slot}`) })}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={isAdding || hasBlockingIssues || selectedSlots.length === 0}
          onClick={handleAddToCart}
          className="group flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#9e1d20] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#7a1618] disabled:opacity-40"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-px" />
          )}
          {tSummary("addToCart")}
        </button>
        <button
          type="button"
          disabled={isSharing || selectedSlots.length === 0}
          onClick={handleShare}
          title={tSummary("shareTitle")}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/15 px-3 text-white/70 transition-colors duration-200 hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/10 hover:text-[#d12f27] disabled:opacity-40"
        >
          {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function CheckDraw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        className="bm-check-draw"
        d="M7 12.5 L10.5 16 L17 8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
