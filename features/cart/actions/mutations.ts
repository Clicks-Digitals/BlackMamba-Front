"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api";
import type { ActionState } from "@/types";
import type { Cart } from "@/features/cart";

function findItem(
  items: Cart["items"],
  payload: { product: string; variation?: string; combination?: string }
) {
  return items.find((item) => {
    if (payload.combination) return item.combination === payload.combination;
    if (payload.variation) return item.variation === payload.variation;
    return item.product === payload.product && !item.variation && !item.combination;
  });
}

type AddToCartPayload = {
  product: string;
  variation?: string;
  combination?: string;
  quantity: number;
};

type AddToCartData = {
  count: number;
  itemId: string | null;
  itemQuantity: number;
  items: Cart["items"];
  totalAmount: string;
};
type CartMutationData = {
  count: number;
  items: Cart["items"];
  totalAmount: string;
};
type CouponScopeItem = { id: string; name: string };
type CouponScope = {
  categories: CouponScopeItem[];
  brands: CouponScopeItem[];
  products: CouponScopeItem[];
};
export type CouponData = {
  discountAmount: string;
  code: string;
  appliesToAll: boolean;
  scope: CouponScope;
};

export async function addToCartAction(
  payload: AddToCartPayload
): Promise<ActionState<never, AddToCartData>> {
  const res = await apiClient<Cart>("/cart/add-item/", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    revalidatePath("/cart");
    const addedItem = findItem(res.data.items, payload);
    return {
      status: "success",
      message: res.message ?? "Added to cart.",
      data: {
        count: res.data.items.length,
        itemId: addedItem?.id ?? null,
        itemQuantity: addedItem?.quantity ?? payload.quantity,
        items: res.data.items,
        totalAmount: res.data.total_amount
      }
    };
  }

  const cartRes = await apiClient<Cart>("/cart/my-cart/");

  if (cartRes.ok) {
    const existing = findItem(cartRes.data.items, payload);
    if (existing) {
      const newQty = existing.quantity + payload.quantity;
      const updateRes = await apiClient<Cart>("/cart/update-item/", {
        method: "POST",
        body: JSON.stringify({ item_id: existing.id, quantity: newQty })
      });
      if (updateRes.ok) {
        revalidatePath("/cart");
        return {
          status: "success",
          message: updateRes.message ?? "Cart updated.",
          data: {
            count: updateRes.data.items.length,
            itemId: existing.id,
            itemQuantity: newQty,
            items: updateRes.data.items,
            totalAmount: updateRes.data.total_amount
          }
        };
      }
    }
  }

  return { status: "error", message: res.message ?? "Could not add to cart." };
}

export async function updateCartItemAction(
  itemId: string,
  quantity: number
): Promise<ActionState<never, CartMutationData>> {
  const res = await apiClient<Cart>("/cart/update-item/", {
    method: "POST",
    body: JSON.stringify({ item_id: itemId, quantity })
  });

  if (res.ok) {
    revalidatePath("/cart");
    return {
      status: "success",
      message: res.message ?? "Cart item updated.",
      data: {
        count: res.data.items.length,
        items: res.data.items,
        totalAmount: res.data.total_amount
      }
    };
  }

  return { status: "error", message: res.message ?? "Could not update cart item." };
}

export async function removeCartItemAction(
  itemId: string
): Promise<ActionState<never, CartMutationData>> {
  const res = await apiClient<Cart>("/cart/remove-item/", {
    method: "POST",
    body: JSON.stringify({ item_id: itemId })
  });

  if (res.ok) {
    revalidatePath("/cart");
    return {
      status: "success",
      message: res.message ?? "Item removed from cart.",
      data: {
        count: res.data.items.length,
        items: res.data.items,
        totalAmount: res.data.total_amount
      }
    };
  }

  return { status: "error", message: res.message ?? "Could not remove item from cart." };
}

export async function clearCartAction(): Promise<ActionState<never, never>> {
  const res = await apiClient<Cart>("/cart/clear-cart/", {
    method: "POST",
    body: JSON.stringify({})
  });

  if (res.ok) {
    revalidatePath("/cart");
    return { status: "success", message: res.message ?? "Cart cleared." };
  }

  return { status: "error", message: res.message ?? "Could not clear cart." };
}

export async function validateCouponAction(
  code: string,
  subtotal: string,
  cartItems: { product_id: string; item_subtotal: string }[] = []
): Promise<ActionState<never, CouponData>> {
  const res = await apiClient<{
    code: string;
    discount_type: string;
    discount_value: string;
    discount_amount: string;
    minimum_order_amount: string | null;
    valid_until: string | null;
    applies_to_all: boolean;
    scope: CouponScope;
  }>("/promotions/coupons/validate/", {
    method: "POST",
    body: JSON.stringify({ code, subtotal, cart_items: cartItems })
  });

  if (res.ok) {
    return {
      status: "success",
      message: "",
      data: {
        discountAmount: res.data.discount_amount,
        code: res.data.code,
        appliesToAll: res.data.applies_to_all,
        scope: res.data.scope,
      }
    };
  }

  return { status: "error", message: res.message || "Invalid coupon code." };
}
