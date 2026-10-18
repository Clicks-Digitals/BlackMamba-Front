import { getMyCart, EmptyCart, YourCart } from "@/features/cart";
import { getProducts } from "@/features/products";
import { purchasableRecommendations } from "@/features/cart/lib/recommendations";

async function CartFeature() {
  const [cart, related] = await Promise.all([
    getMyCart(),
    getProducts(1, {})
  ]);

  const items = cart?.items ?? [];
  const relatedProducts = purchasableRecommendations(related.results, { cartItems: items }).slice(0, 4);

  return items.length > 0 ? (
    <YourCart items={items} totalAmount={cart!.total_amount} relatedProducts={relatedProducts} />
  ) : (
    <EmptyCart />
  );
}

export default CartFeature;
