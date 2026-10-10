export function formatCurrency(amount: number, currency: string = "JOD", locale: string = "en") {
  const tag = locale === "ar" ? "ar-JO" : "en-US";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency
  }).format(amount);
}

export type CurrencyInfo = { code?: string | null; symbol?: string | null } | null | undefined;

const FALLBACK = { code: "JOD", symbol: "د.أ" };

/**
 * What to print next to a price.
 *
 * English uses the ISO code ("JOD"), because the Arabic glyph "د.أ" collides
 * with Latin digits and renders as mojibake ("175i.د"). Arabic uses the symbol.
 */
export function currencyLabel(info: CurrencyInfo, locale: string = "en"): string {
  if (locale === "ar") return info?.symbol?.trim() || FALLBACK.symbol;
  return info?.code?.trim() || FALLBACK.code;
}

/** Two decimals, grouped, Latin digits in both locales so prices stay scannable. */
function formatAmount(amount: string | number | null | undefined): string {
  const n = typeof amount === "number" ? amount : Number.parseFloat(String(amount ?? ""));
  if (!Number.isFinite(n)) return String(amount ?? "");
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * A complete price string: "JOD 175.00" in English, "175.00 د.أ" in Arabic.
 * Render it inside an element with `dir="ltr"` in English and `dir="auto"` in
 * Arabic, or simply use the shared `<Price>` component.
 */
export function formatPrice(
  amount: string | number | null | undefined,
  info: CurrencyInfo,
  locale: string = "en"
): string {
  const label = currencyLabel(info, locale);
  const value = formatAmount(amount);
  return locale === "ar" ? `${value} ${label}` : `${label} ${value}`;
}
