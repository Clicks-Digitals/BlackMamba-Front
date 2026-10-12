"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api";
import { formDataToObject, validateData } from "@/lib/utils";
import {
  createCheckoutSchema,
  getCheckoutLocaleFromCookieValue
} from "@/features/checkout/schema/checkout.schema";
import type { CheckoutData, CheckoutResponse } from "@/features/checkout/types";
import { ActionState } from "@/types";
import { summarise, toIssues } from "@/features/checkout/lib/checkout-errors";

export async function placeOrderAction(
  _prev: ActionState<CheckoutData, { orderId: string; orderNumber: string }>,
  formData: FormData
): Promise<ActionState<CheckoutData, { orderId: string; orderNumber: string }>> {
  const rawData = formDataToObject(formData);

  const cookieStore = await cookies();
  const locale = getCheckoutLocaleFromCookieValue(cookieStore.get("NEXT_LOCALE")?.value);
  const checkoutSchema = createCheckoutSchema(locale);

  const validated = validateData(checkoutSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: locale === "ar" ? "يرجى تصحيح الأخطاء أدناه." : "Please fix the errors below.",
      fieldErrors: validated.errors as Partial<Record<string, string[]>>,
      inputs: rawData as unknown as Partial<CheckoutData>
    };
  }

  const data = validated.data;
  const isLoggedIn = data.is_logged_in === "true";

  // The API field is `shipping_option`. Sending `shipping_option_id` meant DRF
  // dropped it as an unknown key, so every order was saved with zero shipping
  // while the customer had been shown — and agreed to — a delivery fee.
  const payload = isLoggedIn
    ? {
        address_id: data.address_id,
        shipping_option: data.shipping_option_id,
        payment_method: data.payment_method,
        coupon_code: data.coupon_code || undefined
      }
    : {
        shipping_address: data.shipping_address,
        guest_email: data.guest_email,
        shipping_option: data.shipping_option_id,
        payment_method: data.payment_method,
        coupon_code: data.coupon_code || undefined
      };

  const res = await apiClient<CheckoutResponse>("/orders/checkout/", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    revalidatePath("/cart");
    return {
      status: "success",
      message: locale === "ar" ? "تم تأكيد الطلب بنجاح." : "Order placed successfully.",
      data: {
        // orderId is the internal UUID, used for links. orderNumber is the
        // reference the customer sees - it must match the one in their email.
        orderId: res.data.id,
        orderNumber: res.data.order_number ?? ""
      }
    };
  }

  // The response's `errors` object is what says *which* part of the address
  // (or the shipping option, or the coupon) was rejected. Dropping it left the
  // shopper with DRF's bare "Bad request." and nothing to act on.
  const issues = toIssues(res.fieldErrors, locale);
  const fallback =
    res.message ??
    (locale === "ar" ? "تعذر إتمام الطلب. حاول مرة أخرى." : "Failed to place order. Please try again.");

  return {
    status: "error",
    message: summarise(issues, fallback),
    fieldErrors: res.fieldErrors as Partial<Record<string, string[]>> | undefined,
    inputs: rawData as unknown as Partial<CheckoutData>
  };
}
