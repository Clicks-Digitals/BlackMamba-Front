import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    raw && (locales as readonly string[]).includes(raw) ? (raw as Locale) : defaultLocale;

  // Static imports per locale — Turbopack-safe (no dynamic template literals)
  const files =
    locale === "ar"
      ? await Promise.all([
          import("../messages/ar/auth.json"),
          import("../messages/ar/header.json"),
          import("../messages/ar/service-center.json"),
          import("../messages/ar/profile.json"),
          import("../messages/ar/home.json"),
          import("../messages/ar/products.json"),
          import("../messages/ar/single-product.json"),
          import("../messages/ar/wishlist.json"),
          import("../messages/ar/footer.json"),
          import("../messages/ar/cart.json"),
          import("../messages/ar/checkout.json"),
          import("../messages/ar/not-found.json"),
          import("../messages/ar/order-success.json"),
          import("../messages/ar/common.json"),
          import("../messages/ar/pc-builder.json")
        ])
      : await Promise.all([
          import("../messages/en/auth.json"),
          import("../messages/en/header.json"),
          import("../messages/en/service-center.json"),
          import("../messages/en/profile.json"),
          import("../messages/en/home.json"),
          import("../messages/en/products.json"),
          import("../messages/en/single-product.json"),
          import("../messages/en/wishlist.json"),
          import("../messages/en/footer.json"),
          import("../messages/en/cart.json"),
          import("../messages/en/checkout.json"),
          import("../messages/en/not-found.json"),
          import("../messages/en/order-success.json"),
          import("../messages/en/common.json"),
          import("../messages/en/pc-builder.json")
        ]);

  const messages = files.reduce<Record<string, unknown>>(
    (acc, m) => ({ ...acc, ...m.default }),
    {}
  );

  return { locale, messages };
});
