"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { updateBuildPreferencesAction } from "@/features/pc-builder/actions/mutations";
import type { BrandPreference, GraphicsPreference, ColorPreference } from "@/features/pc-builder/types";
import { useBuilderMotion, fadeUp } from "./builder-motion";

interface PreferencesRowProps {
  buildId: string;
}

const SWATCHES: Record<string, string> = {
  BLACK: "#000000",
  WHITE: "#FFFFFF",
};

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  groupId,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
  disabled?: boolean;
  groupId: string;
}) {
  const { reduceMotion } = useBuilderMotion();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</span>
      <div className="inline-flex rounded-md border border-white/10 bg-white/3 p-0.5">
        {options.map((opt) => {
          const swatch = SWATCHES[opt.value];
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative z-0 flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50",
                active ? "text-white" : "text-white/60 hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId={reduceMotion ? undefined : groupId}
                  className="absolute inset-0 -z-10 rounded-md bg-[#EB0B1A]"
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {swatch && (
                <span
                  className="h-2.5 w-2.5 rounded-full border border-white/20"
                  style={{ backgroundColor: swatch }}
                  aria-hidden
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PreferencesRow({ buildId }: PreferencesRowProps) {
  const t = useTranslations("PCBuilder");
  const preferences = usePCBuilderStore((s) => s.preferences);
  const setBuild = usePCBuilderStore((s) => s.setBuild);
  const [isPending, startTransition] = useTransition();
  const { reduceMotion } = useBuilderMotion();

  function update(patch: Partial<typeof preferences>) {
    startTransition(async () => {
      const res = await updateBuildPreferencesAction(buildId, patch);
      if (res.status === "success" && res.data) {
        setBuild(res.data);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <motion.div
      {...fadeUp(0.48, reduceMotion)}
      className="flex flex-wrap gap-5 rounded-lg border border-white/10 bg-black/25 p-3.5 sm:p-4"
    >
      <SegmentedControl<BrandPreference>
        label={t("preferences.processor")}
        value={preferences.preference_processor_brand}
        disabled={isPending}
        groupId="pref-processor"
        options={[
          { label: t("preferences.any"), value: "ANY" },
          { label: t("preferences.intel"), value: "INTEL" },
          { label: t("preferences.amd"), value: "AMD" },
        ]}
        onChange={(v) => update({ preference_processor_brand: v })}
      />
      <SegmentedControl<GraphicsPreference>
        label={t("preferences.graphics")}
        value={preferences.preference_graphics_brand}
        disabled={isPending}
        groupId="pref-graphics"
        options={[
          { label: t("preferences.any"), value: "ANY" },
          { label: t("preferences.nvidia"), value: "NVIDIA" },
          { label: t("preferences.amd"), value: "AMD" },
        ]}
        onChange={(v) => update({ preference_graphics_brand: v })}
      />
      <SegmentedControl<ColorPreference>
        label={t("preferences.buildColour")}
        value={preferences.preference_color}
        disabled={isPending}
        groupId="pref-color"
        options={[
          { label: t("preferences.any"), value: "ANY" },
          { label: t("preferences.black"), value: "BLACK" },
          { label: t("preferences.white"), value: "WHITE" },
        ]}
        onChange={(v) => update({ preference_color: v })}
      />
    </motion.div>
  );
}
