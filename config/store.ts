/**
 * Store contact details, in one place.
 *
 * These appear in the privacy policy, the footer and the WhatsApp links, so
 * they are defined here rather than hardcoded in each component. Anything
 * still reading "TODO" has not been supplied yet and shows as a placeholder on
 * the page — fill these in before launch.
 */
export const STORE = {
  name: "Black Mamba",
  nameAr: "بلاك مامبا",
  domain: "mambagears.com",

  /** Digits only, international format, no "+" — used to build wa.me links. */
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "",
  /** Human-readable, e.g. "+962 7 9999 9999". */
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
  addressAr: process.env.NEXT_PUBLIC_STORE_ADDRESS_AR ?? "",
} as const;

/** True when a detail has actually been supplied. */
export function hasValue(value: string): boolean {
  return value.trim().length > 0;
}

/** What to render when a contact detail is still missing. */
export function orPlaceholder(value: string, label: string): string {
  return hasValue(value) ? value : `[${label}]`;
}
