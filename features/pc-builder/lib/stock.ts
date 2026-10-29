import type { PCPart } from "@/features/pc-builder/types";

/**
 * Can this part be put in a build?
 *
 * `product_stock` is a count, and it only means anything in TRACK mode.
 * Most of the catalogue is TOGGLE, where stock is the on/off switch and
 * the count sits at 0 whether or not the thing is in stock - so judging
 * by the count alone marked 566 of 684 parts sold out and disabled the
 * Add button on all of them.
 *
 * The server derives `in_stock` from the inventory mode and sends it.
 * The count is only consulted as a fallback, for a response old enough
 * not to carry the field, and then only where it means something.
 */
export function isPartInStock(part: Pick<PCPart, "in_stock" | "inventory_mode" | "product_stock">): boolean {
  if (typeof part.in_stock === "boolean") return part.in_stock;
  if (part.inventory_mode === "TRACK") return (part.product_stock ?? 0) > 0;
  return part.product_stock === null || (part.product_stock ?? 0) > 0;
}
