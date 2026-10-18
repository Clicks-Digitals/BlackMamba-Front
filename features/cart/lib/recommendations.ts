import type { Product } from "@/types";
import type { CartItem } from "../types";

/**
 * Trim a "You may also like" list to products someone can actually buy.
 *
 * The lists are cached, so a product withdrawn in the panel can still be in
 * them for a moment after the cart has started flagging it as not
 * purchasable. Anything the cart says can't be bought, anything marked
 * unavailable, and the product being viewed are left out.
 */
export function purchasableRecommendations(
  products: Product[],
  { cartItems = [], excludeSlug }: { cartItems?: CartItem[]; excludeSlug?: string } = {}
): Product[] {
  const blocked = new Set(
    cartItems
      .filter((item) => item.is_purchasable === false && item.product)
      .map((item) => item.product as string)
  );

  return products.filter(
    (product) =>
      product.is_available !== false &&
      !blocked.has(product.id) &&
      (!excludeSlug || product.slug !== excludeSlug)
  );
}
