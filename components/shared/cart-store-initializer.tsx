"use client";

import { useEffect } from "react";
import { useCartStore, buildCartItemKey, type CartItemRef } from "@/stores/cart-store";

type CartItem = {
  id: string;
  quantity: number;
  product: string | null;
  variation: string | null;
  combination: string | null;
  build?: string | null;
};

export function CartStoreInitializer({ items }: { items: CartItem[] }) {
  const setItems = useCartStore((s) => s.setItems);
  const itemsKey = items.map((i) => `${i.id}:${i.quantity}`).join(",");

  useEffect(() => {
    const refs: Record<string, CartItemRef> = {};
    for (const item of items) {
      refs[buildCartItemKey({
        product: item.product,
        variation: item.variation,
        combination: item.combination,
        build: item.build,
      })] = { itemId: item.id, quantity: item.quantity };
    }
    setItems(items.length, refs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, setItems]);

  return null;
}
