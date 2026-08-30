import type { ActionState } from "@/types";
import type { Cart } from "@/features/cart";
import type { Address } from "@/types";
import type { z } from "zod";
import type { createCheckoutSchema } from "@/features/checkout/schema/checkout.schema";

export type CheckoutData = z.infer<ReturnType<typeof createCheckoutSchema>>;

/* ============================================================================
   SHIPPING
   ============================================================================ */
export interface ShippingOption {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  price: string;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/* ============================================================================
   API / ACTIONS
   ============================================================================ */
export type CheckoutResponse = {
  id: string;
  order_number?: string;
};

export type OrderData = {
  orderId: string;
};

export type CheckoutState = ActionState<CheckoutData, OrderData>;

/* ============================================================================
   COMPONENTS
   ============================================================================ */
export interface CheckoutClientProps {
  cart: Cart | null;
  addresses: Address[];
  isLoggedIn: boolean;
  shippingOptions: ShippingOption[];
}

export type { PaginatedResponse } from "@/types";
