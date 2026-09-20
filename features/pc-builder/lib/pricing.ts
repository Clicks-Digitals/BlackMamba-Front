import type { BuildPricing, PCBuildItemData, PCSlot } from "../types";
import { ACCESSORY_SLOTS, CORE_SLOTS } from "../types";

/**
 * Client-side mirror of the server's bundle-discount ladder, used only for the
 * optimistic price shown between a click and the API response. The server
 * (apps/pc_builder/engine.price_build) remains the source of truth and its
 * reply overwrites this.
 *
 * Keep in sync with the BundleDiscountTier rows the backend seeds
 * (0002_seed_discount_tiers, retuned by 0005_retune_top_discount_tier). The
 * top tier is 8 - the number of core slots - so a fully specced build actually
 * reaches the best discount.
 *
 * A merchant who edits the tiers in the admin panel changes only the server's
 * ladder; these values drive the tier chips and the momentary optimistic price
 * before the API replies.
 */
export const DISCOUNT_TIERS = [
  { min: 3, pct: 5 },
  { min: 5, pct: 8 },
  { min: 7, pct: 12 },
  { min: 8, pct: 15 },
] as const;

function isAccessory(slot: PCSlot): boolean {
  return (ACCESSORY_SLOTS as string[]).includes(slot);
}

/** Highest tier reached by `corePartCount`, or 0 below the first tier. */
export function discountPercentFor(corePartCount: number): number {
  let pct = 0;
  for (const tier of DISCOUNT_TIERS) {
    if (corePartCount >= tier.min) pct = tier.pct;
  }
  return pct;
}

/**
 * Price a set of build items the same way the server does: the discount
 * applies to core parts only, and peripherals are added at full price.
 */
export function estimatePricing(items: Array<PCBuildItemData | undefined | null>): BuildPricing {
  const present = items.filter(Boolean) as PCBuildItemData[];
  const core = present.filter((item) => !isAccessory(item.slot));
  const accessories = present.filter((item) => isAccessory(item.slot));

  const sum = (list: PCBuildItemData[]) =>
    list.reduce((total, item) => total + (Number(item.unit_price) || 0), 0);

  const coreSubtotal = sum(core);
  const accessoriesSubtotal = sum(accessories);
  const discountPercent = discountPercentFor(core.length);
  const discountAmount = (coreSubtotal * discountPercent) / 100;

  // Never advertise a tier with more parts than there are core slots to fill.
  const nextTier = DISCOUNT_TIERS.find(
    (tier) => tier.min > core.length && tier.min <= CORE_SLOTS.length
  );

  return {
    subtotal: (coreSubtotal + accessoriesSubtotal).toFixed(2),
    core_subtotal: coreSubtotal.toFixed(2),
    accessories_subtotal: accessoriesSubtotal.toFixed(2),
    discount_percent: String(discountPercent),
    discount_amount: discountAmount.toFixed(2),
    total_price: (coreSubtotal + accessoriesSubtotal - discountAmount).toFixed(2),
    part_count: core.length,
    accessory_count: accessories.length,
    next_tier: nextTier
      ? {
          min_parts: nextTier.min,
          discount_percent: String(nextTier.pct),
          parts_needed: nextTier.min - core.length,
        }
      : null,
  };
}
