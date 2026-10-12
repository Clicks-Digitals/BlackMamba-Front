/**
 * Turning the API's validation errors into something a shopper can act on.
 *
 * The checkout action used to drop the response's `errors` object and show
 * only its top-level message, which for a DRF validation failure is just
 * "Bad request." — so a rejected address said nothing about which part of it
 * was wrong. These helpers name the field and keep the server's own wording.
 */

type Locale = "en" | "ar";

const FIELD_LABELS: Record<string, { en: string; ar: string }> = {
  "shipping_address": { en: "Delivery address", ar: "عنوان التوصيل" },
  "shipping_address.title": { en: "Address title", ar: "اسم العنوان" },
  "shipping_address.full_name": { en: "Full name", ar: "الاسم الكامل" },
  "shipping_address.phone": { en: "Phone", ar: "رقم الهاتف" },
  "shipping_address.address_line": { en: "Address", ar: "العنوان" },
  "shipping_address.city": { en: "City", ar: "المدينة" },
  "shipping_address.state": { en: "State", ar: "المحافظة" },
  "shipping_address.postal_code": { en: "Postal code", ar: "الرمز البريدي" },
  "shipping_address.country": { en: "Country", ar: "الدولة" },
  address_id: { en: "Delivery address", ar: "عنوان التوصيل" },
  guest_email: { en: "Email", ar: "البريد الإلكتروني" },
  shipping_option: { en: "Shipping method", ar: "طريقة الشحن" },
  shipping_option_id: { en: "Shipping method", ar: "طريقة الشحن" },
  payment_method: { en: "Payment method", ar: "طريقة الدفع" },
  coupon_code: { en: "Promo code", ar: "كود الخصم" },
  non_field_errors: { en: "Order", ar: "الطلب" },
  detail: { en: "Order", ar: "الطلب" },
};

export function fieldLabel(key: string, locale: Locale): string {
  const known = FIELD_LABELS[key];
  if (known) return known[locale];
  // Unknown key: "shipping_address.door_number" → "Door number"
  const leaf = key.split(".").pop() ?? key;
  const words = leaf.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type CheckoutIssue = { key: string; label: string; messages: string[] };

/** One entry per failing field, labelled, in a stable order. */
export function toIssues(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  locale: Locale
): CheckoutIssue[] {
  if (!fieldErrors) return [];
  return Object.entries(fieldErrors)
    .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
    .map(([key, messages]) => ({
      key,
      label: fieldLabel(key, locale),
      messages: (messages ?? []).map(String),
    }));
}

/**
 * A single-line summary for the toast, e.g.
 * "City: This field is required. · Phone: Enter a valid Jordanian number."
 */
export function summarise(issues: CheckoutIssue[], fallback: string): string {
  if (issues.length === 0) return fallback;
  return issues
    .slice(0, 3)
    .map((issue) => `${issue.label}: ${issue.messages[0]}`)
    .join(" · ");
}
