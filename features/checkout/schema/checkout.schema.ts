import { z } from "zod";

const copy = {
  en: {
    selectAddress: "Please select an address",
    selectShipping: "Please select a shipping method",
    titleRequired: "Title is required",
    fullNameRequired: "Full name is required",
    phoneRequired: "Phone is required",
    addressRequired: "Address is required",
    cityRequired: "City is required",
    stateRequired: "State is required",
    postalRequired: "Postal code is required",
    countryRequired: "Country is required",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email address"
  },
  ar: {
    selectAddress: "يرجى اختيار عنوان",
    selectShipping: "يرجى اختيار طريقة الشحن",
    titleRequired: "العنوان مطلوب",
    fullNameRequired: "الاسم الكامل مطلوب",
    phoneRequired: "رقم الهاتف مطلوب",
    addressRequired: "العنوان مطلوب",
    cityRequired: "المدينة مطلوبة",
    stateRequired: "المحافظة مطلوبة",
    postalRequired: "الرمز البريدي مطلوب",
    countryRequired: "البلد مطلوب",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "البريد الإلكتروني غير صالح"
  }
} as const;

export type CheckoutLocale = keyof typeof copy;

export function createCheckoutSchema(locale: CheckoutLocale) {
  const m = copy[locale];

  const loggedInCheckoutSchema = z.object({
    address_id: z.string().trim().min(1, m.selectAddress),
    shipping_option_id: z.string().trim().min(1, m.selectShipping),
    coupon_code: z.string().trim().optional(),
    payment_method: z.literal("CASH_ON_DELIVERY"),
    is_logged_in: z.literal("true")
  });

  const guestCheckoutSchema = z.object({
    shipping_address: z.object({
      title: z.string().trim().min(1, m.titleRequired),
      full_name: z.string().trim().min(1, m.fullNameRequired),
      phone: z.string().trim().min(1, m.phoneRequired),
      address_line: z.string().trim().min(1, m.addressRequired),
      city: z.string().trim().min(1, m.cityRequired),
      // The store delivers in Jordan only and the server requires neither.
      // Demanding a governorate and a postal code to buy a keyboard loses
      // the sale; the country is filled in rather than asked for.
      state: z.string().trim().optional().default(""),
      postal_code: z.string().trim().optional().default(""),
      country: z.string().trim().optional().default("Jordan")
    }),
    guest_email: z.string().trim().min(1, m.emailRequired).email(m.emailInvalid),
    shipping_option_id: z.string().trim().min(1, m.selectShipping),
    coupon_code: z.string().trim().optional(),
    payment_method: z.literal("CASH_ON_DELIVERY"),
    is_logged_in: z.literal("false")
  });

  return z.discriminatedUnion("is_logged_in", [loggedInCheckoutSchema, guestCheckoutSchema]);
}

export function getCheckoutLocaleFromCookieValue(raw: string | undefined): CheckoutLocale {
  return raw === "ar" ? "ar" : "en";
}
