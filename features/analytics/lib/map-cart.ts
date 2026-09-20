import type { Product } from "@/types";
import type { Cart, CartItem } from "@/features/cart/types";
import type { AnalyticsItem } from "./types";

/**
 * Turn cart lines into analytics items.
 *
 * A PC-build line has no single product, so it is reported under its build id
 * with the build's name - otherwise it would vanish from cart and purchase
 * events and the reported value would not match what the customer paid.
 */
export function cartItemToAnalyticsItem(item: CartItem): AnalyticsItem {
  const product = item.product_details;
  const build = item.build_details;

  return {
    id: item.product ?? item.build ?? item.id,
    name: product?.name ?? build?.name ?? "Custom PC Build",
    price: parseFloat(item.price_at_time) || 0,
    quantity: item.quantity,
    category: product?.categories?.[0]?.name,
    brand: product?.brand?.name,
    variant: item.variation_details?.attribute_names ?? undefined,
  };
}

export function cartToAnalyticsItems(cart: Cart | null): AnalyticsItem[] {
  return (cart?.items ?? []).map(cartItemToAnalyticsItem);
}

/** Effective unit price: campaign beats clearance/discount beats base. */
export function productPrice(product: Product): number {
  const price = product.campaign_price ?? product.discount_price ?? product.base_price;
  return parseFloat(price ?? "0") || 0;
}

export function productToAnalyticsItem(product: Product, quantity = 1): AnalyticsItem {
  return {
    id: product.id,
    name: product.name,
    price: productPrice(product),
    quantity,
    category: product.categories?.[0]?.name,
    brand: product.brand?.name,
  };
}

/** Single-product payload shared by view / add-to-cart / wishlist events. */
export function productPayload(product: Product, quantity = 1) {
  const item = productToAnalyticsItem(product, quantity);
  return {
    items: [item],
    value: item.price * quantity,
    currency: product.currency_info?.code ?? "JOD",
  };
}
