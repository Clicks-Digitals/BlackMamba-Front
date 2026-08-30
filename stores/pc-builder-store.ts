import { create } from "zustand";
import type {
  PCBuild,
  PCBuildItemData,
  PCSlot,
  CompatibilityIssue,
  BuildPricing,
  BrandPreference,
  GraphicsPreference,
  ColorPreference
} from "@/features/pc-builder";

interface PCBuilderState {
  buildId: string | null;
  items: Partial<Record<PCSlot, PCBuildItemData>>;
  preferences: {
    preference_processor_brand: BrandPreference;
    preference_graphics_brand: GraphicsPreference;
    preference_color: ColorPreference;
  };
  compatibility: { red_issues: CompatibilityIssue[]; yellow_issues: CompatibilityIssue[] };
  pricing: BuildPricing | null;
  totalPowerDrawWatts: number;
  hasBlockingIssues: boolean;
  setBuild: (build: PCBuild) => void;
  reset: () => void;
}

function itemsBySlot(build: PCBuild): Partial<Record<PCSlot, PCBuildItemData>> {
  return build.items.reduce<Partial<Record<PCSlot, PCBuildItemData>>>((acc, item) => {
    acc[item.slot] = item;
    return acc;
  }, {});
}

export const usePCBuilderStore = create<PCBuilderState>((set) => ({
  buildId: null,
  items: {},
  preferences: {
    preference_processor_brand: "ANY",
    preference_graphics_brand: "ANY",
    preference_color: "ANY"
  },
  compatibility: { red_issues: [], yellow_issues: [] },
  pricing: null,
  totalPowerDrawWatts: 0,
  hasBlockingIssues: false,
  setBuild: (build) =>
    set({
      buildId: build.id,
      items: itemsBySlot(build),
      preferences: {
        preference_processor_brand: build.preference_processor_brand,
        preference_graphics_brand: build.preference_graphics_brand,
        preference_color: build.preference_color
      },
      compatibility: build.compatibility,
      pricing: build.pricing,
      totalPowerDrawWatts: build.total_power_draw_watts,
      hasBlockingIssues: build.has_blocking_issues
    }),
  reset: () =>
    set({
      buildId: null,
      items: {},
      compatibility: { red_issues: [], yellow_issues: [] },
      pricing: null,
      totalPowerDrawWatts: 0,
      hasBlockingIssues: false
    })
}));
