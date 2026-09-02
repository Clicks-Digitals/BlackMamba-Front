"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Cpu, ShieldCheck, Tag, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { SlotRow } from "./SlotRow";
import { PartPickerSheet } from "./PartPickerSheet";
import { PreferencesRow } from "./PreferencesRow";
import { AutoBuilderControls } from "./AutoBuilderControls";
import { SummarySidebar } from "./SummarySidebar";
import { BuilderPageShell, BuilderBadge } from "./BuilderPageShell";
import { BuilderMotionProvider, fadeUp, useBuilderMotion } from "./builder-motion";
import { EnergyBeam } from "./EnergyBeam";
import { useAnimatedNumber } from "./use-animated-number";
import { SLOT_ORDER, CORE_SLOTS, ACCESSORY_SLOTS, type PCBuild, type PCSlot } from "@/features/pc-builder/types";
import { withDemoBuild } from "@/features/pc-builder/demo-build";

interface BuilderViewProps {
  initialBuild: PCBuild;
}

export function BuilderView({ initialBuild }: BuilderViewProps) {
  const [activeSlot, setActiveSlot] = useState<PCSlot | null>(null);
  const seededBuild = useMemo(() => withDemoBuild(initialBuild), [initialBuild]);

  return (
    <BuilderMotionProvider activeSlot={activeSlot}>
      <BuilderStage initialBuild={seededBuild} activeSlot={activeSlot} setActiveSlot={setActiveSlot} />
    </BuilderMotionProvider>
  );
}

function BuilderStage({
  initialBuild,
  activeSlot,
  setActiveSlot,
}: {
  initialBuild: PCBuild;
  activeSlot: PCSlot | null;
  setActiveSlot: (slot: PCSlot | null) => void;
}) {
  const t = useTranslations("PCBuilder");
  const locale = useLocale();
  const rtl = locale === "ar";
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const items = usePCBuilderStore((s) => s.items);
  const watts = usePCBuilderStore((s) => s.totalPowerDrawWatts);
  const hydrated = usePCBuilderStore((s) => s.buildId === initialBuild.id);
  const { triggerPulse, assembling, setMotionReady, reduceMotion } = useBuilderMotion();
  const ArrowIcon = rtl ? ArrowLeft : ArrowRight;
  const prevItems = useRef<Partial<Record<PCSlot, unknown>> | null>(null);
  const skipPulse = useRef(true);

  useLayoutEffect(() => {
    const current = usePCBuilderStore.getState().items;
    if (initialBuild.items.some((item) => item.slot && !current[item.slot])) {
      setBuild(initialBuild);
    }
  }, [initialBuild, setBuild]);

  useEffect(() => {
    if (!hydrated) return;
    prevItems.current = { ...items };
    const frame = requestAnimationFrame(() => {
      skipPulse.current = false;
      setMotionReady(true);
    });
    return () => cancelAnimationFrame(frame);
    // Capture the first hydrated snapshot only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPulse.current) {
      prevItems.current = { ...items };
      return;
    }
    if (assembling) {
      prevItems.current = { ...items };
      return;
    }
    const prev = prevItems.current ?? {};
    for (const slot of SLOT_ORDER) {
      const was = !!prev[slot];
      const now = !!items[slot];
      if (was !== now) {
        triggerPulse(slot, now ? "add" : "remove");
        break;
      }
    }
    prevItems.current = { ...items };
  }, [items, hydrated, assembling, triggerPulse]);

  const filledCore = hydrated
    ? CORE_SLOTS.filter((slot) => items[slot]).length
    : initialBuild.items.filter((i) => (CORE_SLOTS as string[]).includes(i.slot)).length;
  const filledAccessories = hydrated
    ? ACCESSORY_SLOTS.filter((slot) => items[slot]).length
    : initialBuild.items.filter((i) => (ACCESSORY_SLOTS as string[]).includes(i.slot)).length;
  const power = hydrated ? watts : initialBuild.total_power_draw_watts || 0;
  const progress = Math.round((filledCore / CORE_SLOTS.length) * 100);
  const liveWatts = useAnimatedNumber(power);

  return (
    <BuilderPageShell>
      <EnergyBeam />
      <div className="w-full" dir={rtl ? "rtl" : "ltr"}>
        <header className="relative mb-7">
          <motion.div {...fadeUp(0.18, reduceMotion)}>
            <BuilderBadge>{t("badge")}</BuilderBadge>
            <h1
              className={cn(
                "mt-2 text-[clamp(2.6rem,6vw,4.4rem)] uppercase leading-[0.88] tracking-wide text-[#EDEFF0]",
                rtl ? "font-cairo font-bold" : "font-beckman"
              )}
            >
              {t("title")}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#9AA3A8] sm:text-[15px]">{t("subtitle")}</p>
          </motion.div>

          <motion.div {...fadeUp(0.32, reduceMotion)} className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: Cpu, label: t("hud.chipSlots") },
              { icon: ShieldCheck, label: t("hud.chipCompat") },
              { icon: Tag, label: t("hud.chipDiscount") },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-white/8 bg-black/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/55 sm:min-h-0"
              >
                <Icon className="h-3.5 w-3.5 text-[#d12f27]" />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.42, reduceMotion)} className="mt-6 flex flex-wrap items-end gap-4">
            <HudMeter
              label={t("hud.slotsLabel")}
              value={t("hud.slotsFilled", { filled: filledCore, total: CORE_SLOTS.length })}
              progress={progress}
              rtl={rtl}
            />
            <div className="min-w-[7.5rem] rounded-lg border border-white/8 bg-black/30 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                {t("hud.accessoriesLabel")}
              </p>
              <p className="mt-1 font-letterman text-2xl tabular-nums text-[#EDEFF0]">
                {t("hud.slotsFilled", { filled: filledAccessories, total: ACCESSORY_SLOTS.length })}
              </p>
            </div>
            <div className="min-w-[7.5rem] rounded-lg border border-white/8 bg-black/30 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{t("hud.powerLabel")}</p>
              <p className="mt-1 flex items-center gap-1.5 font-beckman text-2xl tabular-nums text-[#EDEFF0]">
                <Zap className="size-4 text-[#d12f27]" />
                {t("hud.watts", { watts: Math.round(liveWatts) })}
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.5, reduceMotion)} className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/pc-builder/parts"
              className="group inline-flex h-11 items-center gap-1.5 rounded-md border border-white/12 bg-white/4 px-4 text-sm font-semibold text-[#EDEFF0] transition-colors duration-200 hover:border-white/25"
            >
              {t("browseAllParts")}
              <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <Link
              href="/pc-builder/ready-made"
              className="group inline-flex h-11 items-center gap-1.5 rounded-md bg-[#9e1d20] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#7a1618]"
            >
              {t("browseReadyMade")}
              <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </motion.div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="order-2 min-w-0 flex-1 space-y-4 lg:order-1">
            <PreferencesRow buildId={initialBuild.id} />
            <AutoBuilderControls buildId={initialBuild.id} />

            <SlotSection
              title={t("sections.core")}
              subtitle={t("sections.coreHint")}
              slots={CORE_SLOTS}
              filledMap={items}
              buildId={initialBuild.id}
              onOpenPicker={setActiveSlot}
              indexOffset={0}
            />

            <SlotSection
              title={t("sections.peripherals")}
              subtitle={t("sections.peripheralsHint")}
              slots={ACCESSORY_SLOTS}
              filledMap={items}
              buildId={initialBuild.id}
              onOpenPicker={setActiveSlot}
              indexOffset={CORE_SLOTS.length}
              optional
            />
          </div>

          <SummarySidebar buildId={initialBuild.id} onBrowseSlot={setActiveSlot} />
        </div>
      </div>

      <PartPickerSheet slot={activeSlot} buildId={initialBuild.id} onClose={() => setActiveSlot(null)} />
    </BuilderPageShell>
  );
}

function SlotSection({
  title,
  subtitle,
  slots,
  filledMap,
  buildId,
  onOpenPicker,
  indexOffset,
  optional,
}: {
  title: string;
  subtitle: string;
  slots: PCSlot[];
  filledMap: Partial<Record<PCSlot, unknown>>;
  buildId: string;
  onOpenPicker: (slot: PCSlot) => void;
  indexOffset: number;
  optional?: boolean;
}) {
  const t = useTranslations("PCBuilder");
  const filled = slots.filter((s) => filledMap[s]).length;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card/60">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-chillax text-sm font-semibold tracking-wide text-foreground uppercase">
              {title}
            </h2>
            {optional ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                {t("sections.optional")}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {t("hud.slotsFilled", { filled, total: slots.length })}
        </p>
      </div>

      <div className="hidden grid-cols-[minmax(0,9rem)_minmax(0,1fr)_6.5rem_auto] gap-4 border-b border-border bg-muted/20 px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:grid">
        <span>{t("table.component")}</span>
        <span>{t("table.selection")}</span>
        <span className="text-end">{t("table.price")}</span>
        <span className="text-end">{t("table.action")}</span>
      </div>

      <div>
        {slots.map((slot, i) => (
          <SlotRow
            key={slot}
            slot={slot}
            buildId={buildId}
            onOpenPicker={onOpenPicker}
            index={indexOffset + i}
          />
        ))}
      </div>
    </section>
  );
}

function HudMeter({
  label,
  value,
  progress,
  rtl,
}: {
  label: string;
  value: string;
  progress: number;
  rtl: boolean;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/30 px-3 py-2.5">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#d12f27"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{label}</p>
        <p className={cn("mt-0.5 text-xl tabular-nums text-[#EDEFF0]", rtl ? "font-cairo font-bold" : "font-beckman")}>
          {value}
        </p>
      </div>
    </div>
  );
}
