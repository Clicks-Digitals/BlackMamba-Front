import { getMyCart, EmptyCart, YourCart } from "@/features/cart";
import { getProducts } from "@/features/products";

async function CartFeature() {
  const [cart, related] = await Promise.all([
    getMyCart(),
    getProducts(1, {})
  ]);

  const items = cart?.items ?? [];
  const relatedProducts = related.results.slice(0, 4);

  return items.length > 0 ? (
    <YourCart items={items} totalAmount={cart!.total_amount} relatedProducts={relatedProducts} />
  ) : (
    <EmptyCart />
  );
}

export default CartFeature;
