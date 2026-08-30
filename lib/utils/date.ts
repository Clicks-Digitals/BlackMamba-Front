const LOCALE_MAP: Record<string, string> = {
  ar: "ar-JO",
  en: "en-US"
};

function formatWithLocale(
  iso: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag = LOCALE_MAP[locale] ?? "en-US";
  return new Intl.DateTimeFormat(tag, options).format(d);
}

/** e.g. 11 May 2026 — long month name */
export function formatDate(iso: string | null | undefined, locale: string): string {
  return formatWithLocale(iso, locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/** e.g. 11 May 2026 — compact (cards, lists) */
export function formatDateShort(iso: string | null | undefined, locale: string): string {
  return formatWithLocale(iso, locale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

/** e.g. 11 May, 2:30 PM — date + time */
export function formatDateTime(iso: string | null | undefined, locale: string): string {
  return formatWithLocale(iso, locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}
