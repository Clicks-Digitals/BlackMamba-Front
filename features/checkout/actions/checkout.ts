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

export async function placeOrderAction(
  _prev: ActionState<CheckoutData, { orderId: string }>,
  formData: FormData
): Promise<ActionState<CheckoutData, { orderId: string }>> {
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

  const payload = isLoggedIn
    ? {
        address_id: data.address_id,
        shipping_option_id: data.shipping_option_id,
        payment_method: data.payment_method,
        coupon_code: data.coupon_code || undefined
      }
    : {
        shipping_address: data.shipping_address,
        guest_email: data.guest_email,
        shipping_option_id: data.shipping_option_id,
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
        orderId: res.data.id
      }
    };
  }

  return {
    status: "error",
    message:
      res.message ??
      (locale === "ar" ? "تعذر إتمام الطلب. حاول مرة أخرى." : "Failed to place order. Please try again."),
    inputs: rawData as unknown as Partial<CheckoutData>
  };
}
