"use client";

import { isGaEnabled, isPixelEnabled } from "./config";
import type {
  AnalyticsItem,
  ItemsPayload,
  PurchasePayload,
  SearchPayload,
  SignUpPayload,
} from "./types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void };
  }
}

/** Both SDKs are no-ops until their script loads, so every call is guarded. */
function gtag(...args: unknown[]) {
  if (!isGaEnabled || typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

function fbq(...args: unknown[]) {
  if (!isPixelEnabled || typeof window === "undefined" || !window.fbq) return;
  window.fbq(...args);
}

// -- Payload mapping ---------------------------------------------------------

function toGaItems(items: AnalyticsItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_category: item.category,
    item_brand: item.brand,
    item_variant: item.variant,
  }));
}

function toPixelContents(items: AnalyticsItem[]) {
  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity ?? 1,
    item_price: item.price,
  }));
}

// -- Events ------------------------------------------------------------------

export function trackPageView(url: string) {
  gtag("event", "page_view", { page_path: url, page_location: window.location.href });
  fbq("track", "PageView");
}

export function trackViewItem({ items, value, currency }: ItemsPayload) {
  gtag("event", "view_item", { currency, value, items: toGaItems(items) });
  fbq("track", "ViewContent", {
    currency,
    value,
    content_type: "product",
    content_ids: items.map((i) => i.id),
    contents: toPixelContents(items),
  });
}

export function trackAddToCart({ items, value, currency }: ItemsPayload) {
  gtag("event", "add_to_cart", { currency, value, items: toGaItems(items) });
  fbq("track", "AddToCart", {
    currency,
    value,
    content_type: "product",
    content_ids: items.map((i) => i.id),
    contents: toPixelContents(items),
  });
}

export function trackRemoveFromCart({ items, value, currency }: ItemsPayload) {
  gtag("event", "remove_from_cart", { currency, value, items: toGaItems(items) });
  // Meta has no standard event for this; a custom one keeps it available for audiences.
  fbq("trackCustom", "RemoveFromCart", { currency, value, content_ids: items.map((i) => i.id) });
}

export function trackAddToWishlist({ items, value, currency }: ItemsPayload) {
  gtag("event", "add_to_wishlist", { currency, value, items: toGaItems(items) });
  fbq("track", "AddToWishlist", {
    currency,
    value,
    content_type: "product",
    content_ids: items.map((i) => i.id),
  });
}

export function trackBeginCheckout({ items, value, currency }: ItemsPayload) {
  gtag("event", "begin_checkout", { currency, value, items: toGaItems(items) });
  fbq("track", "InitiateCheckout", {
    currency,
    value,
    num_items: items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
    content_type: "product",
    content_ids: items.map((i) => i.id),
    contents: toPixelContents(items),
  });
}

export function trackPurchase({
  orderId,
  items,
  value,
  currency,
  shipping,
  tax,
  coupon,
}: PurchasePayload) {
  gtag("event", "purchase", {
    transaction_id: orderId,
    currency,
    value,
    shipping,
    tax,
    coupon,
    items: toGaItems(items),
  });

  // eventID must match the backend's Conversions API event_id
  // (apps/core/meta_capi.py -> `order-<order_number>`) so Meta counts the
  // browser and server reports as one Purchase.
  fbq(
    "track",
    "Purchase",
    {
      currency,
      value,
      order_id: orderId,
      num_items: items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
      content_type: "product",
      content_ids: items.map((i) => i.id),
      contents: toPixelContents(items),
    },
    { eventID: `order-${orderId}` }
  );
}

export function trackSearch({ term }: SearchPayload) {
  gtag("event", "search", { search_term: term });
  fbq("track", "Search", { search_string: term });
}

export function trackSignUp({ method }: SignUpPayload) {
  gtag("event", "sign_up", { method });
  fbq("track", "CompleteRegistration", { status: method });
}

export function trackLogin({ method }: SignUpPayload) {
  gtag("event", "login", { method });
}
