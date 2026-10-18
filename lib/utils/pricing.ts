import type { Product } from "@/types/product";

type PricedProduct = Pick<Product, "base_price" | "discount_price" | "has_discount" | "campaign_price">;

export type ProductPricing = {
  /** What one unit costs before any variation extra. */
  price: string | null;
  /** The crossed-out price, or null when nothing is taken off. */
  original: string | null;
  /** Whole-number percentage off the base price, or null. */
  pct: number | null;
};

function toNumber(value: string | null | undefined): number | null {
  if (value == null) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * The price a shopper pays for one unit, the same way the cart works it out:
 * the lower of the campaign price and the product's own price (its discount
 * price if it has one, else its base price). Cards, the hero and the product
 * page all read from here so they can't drift apart again.
 */
export function productPricing(product: PricedProduct): ProductPricing {
  const base = toNumber(product.base_price);
  const discount = product.has_discount ? toNumber(product.discount_price) : null;
  const campaign = toNumber(product.campaign_price);

  let price = product.base_price;
  let value = base;
  if (discount != null && (value == null || discount < value)) {
    price = product.discount_price;
    value = discount;
  }
  if (campaign != null && (value == null || campaign < value)) {
    price = product.campaign_price;
    value = campaign;
  }

  const reduced = base != null && base > 0 && value != null && value < base;
  return {
    price,
    original: reduced ? product.base_price : null,
    pct: reduced ? Math.round(((base - value!) / base) * 100) : null,
  };
}
