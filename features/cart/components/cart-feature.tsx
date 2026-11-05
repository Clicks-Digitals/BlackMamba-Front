import { getMyCart, EmptyCart, YourCart } from "@/features/cart";
import { getProducts } from "@/features/products";
import { purchasableRecommendations } from "@/features/cart/lib/recommendations";
import { getShippingOptions } from "@/features/checkout/actions/shipping";

async function CartFeature() {
  const [cart, related, shippingOptions] = await Promise.all([
    getMyCart(),
    getProducts(1, {}),
    getShippingOptions()
  ]);
  // Checkout preselects the first option, so its threshold is the one to show.
  const freeOver = Number(shippingOptions[0]?.free_over ?? NaN);

  const items = cart?.items ?? [];
  const relatedProducts = purchasableRecommendations(related.results, { cartItems: items }).slice(0, 4);

  return items.length > 0 ? (
    <YourCart
      items={items}
      totalAmount={cart!.total_amount}
      relatedProducts={relatedProducts}
      freeDeliveryOver={Number.isFinite(freeOver) && freeOver > 0 ? freeOver : null}
    />
  ) : (
    <EmptyCart />
  );
}

export default CartFeature;
