import type { PCPartSpec } from "@/features/pc-builder/types";

type SpecTranslator = (key: string) => string;

/** Human-readable, non-null spec rows for a part — used on the detail page's specs grid. */
export function getSpecRows(spec: PCPartSpec | null, t: SpecTranslator): { label: string; value: string }[] {
  if (!spec) return [];
  const rows: { label: string; value: string }[] = [];

  if (spec.socket) rows.push({ label: t("socket"), value: spec.socket });
  if (spec.tdp_watts != null) rows.push({ label: t("tdp"), value: `${spec.tdp_watts}W` });
  if (spec.memory_type) rows.push({ label: t("memoryType"), value: spec.memory_type });
  if (spec.form_factor) rows.push({ label: t("formFactor"), value: spec.form_factor });
  if (spec.max_form_factor) rows.push({ label: t("maxFormFactor"), value: spec.max_form_factor });
  if (spec.rated_tdp_watts != null) rows.push({ label: t("ratedTdp"), value: `${spec.rated_tdp_watts}W` });
  if (spec.power_draw_watts != null) rows.push({ label: t("powerDraw"), value: `${spec.power_draw_watts}W` });
  if (spec.wattage != null) rows.push({ label: t("wattage"), value: `${spec.wattage}W` });
  if (spec.processor_brand) rows.push({ label: t("processorBrand"), value: spec.processor_brand });
  if (spec.graphics_brand) rows.push({ label: t("graphicsBrand"), value: spec.graphics_brand });
  if (spec.color) rows.push({ label: t("colour"), value: spec.color });
  if (spec.is_dual_channel_kit != null) {
    rows.push({ label: t("kitType"), value: spec.is_dual_channel_kit ? t("dualChannel") : t("singleStick") });
  }

  return rows;
}
