import type { ShippingOption } from "@/features/checkout/types";

/**
 * What a delivery option charges on an order of `orderTotal` (after any
 * coupon). Mirrors ShippingOption.cost_for on the server, which is what the
 * order is actually charged.
 */
export function shippingCostFor(option: ShippingOption | undefined, orderTotal: number): number {
  if (!option) return 0;
  const freeOver = option.free_over == null ? NaN : Number(option.free_over);
  if (Number.isFinite(freeOver) && orderTotal >= freeOver) return 0;
  return Number(option.price) || 0;
}
