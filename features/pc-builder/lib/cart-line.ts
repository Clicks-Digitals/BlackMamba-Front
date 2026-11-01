import type { PCBuild } from "@/features/pc-builder/types";

/** "1 part" / "8 parts", and the Arabic forms for one, two, a few and many. */
export function partsLabel(count: number, locale: string): string {
  if (locale === "ar") {
    if (count === 1) return "قطعة واحدة";
    if (count === 2) return "قطعتان";
    if (count >= 3 && count <= 10) return `${count} قطع`;
    return `${count} قطعة`;
  }
  return count === 1 ? "1 part" : `${count} parts`;
}

/**
 * The bundle discount on one build in the cart, or null when there is none.
 *
 * The line showed the discounted price while the parts listed under it added
 * up to more (1,437.75 against 1,308.35), with nothing saying why. This is the
 * difference, from the same pricing the line's price comes from.
 */
export function buildDiscount(build: PCBuild | null | undefined): { amount: number; percent: string } | null {
  const amount = Number(build?.pricing?.discount_amount ?? 0);
  if (!build || !Number.isFinite(amount) || amount <= 0) return null;
  const percent = Number(build.pricing?.discount_percent ?? 0);
  return { amount, percent: String(Number(percent.toFixed(2))) };
}
