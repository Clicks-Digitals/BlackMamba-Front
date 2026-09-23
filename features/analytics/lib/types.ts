/**
 * One vocabulary for both destinations.
 *
 * Callers describe *what happened* in these shapes; the track() helpers map
 * each one to GA4's recommended event names and Meta's standard events, so a
 * component never has to know either vendor's field names.
 */

export type AnalyticsItem = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  brand?: string;
  variant?: string;
};

export type ItemsPayload = {
  items: AnalyticsItem[];
  value: number;
  currency: string;
};

export type PurchasePayload = ItemsPayload & {
  orderId: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
};

export type SearchPayload = {
  term: string;
};

export type SignUpPayload = {
  method: "email" | "google";
};
