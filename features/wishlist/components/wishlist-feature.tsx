import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { getWishlist, EmptyWishlist, WishlistGrid } from "@/features/wishlist";

export async function WishlistFeature() {
  const [wishlist, locale, t] = await Promise.all([
    getWishlist(),
    getLocale(),
    getTranslations("Wishlist")
  ]);
  const rtl = locale === "ar";
  const products = wishlist.flatMap((w) => w.products);

  return (
    <div className="min-h-screen bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-10 md:py-12">
          <p className="bm-kicker mb-3">Black Mamba</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {t("title")}
          </h1>
        </div>
      </div>

      <div className="layout-page layout-gutter-x py-10">
        {products.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <WishlistGrid products={products} locale={locale} />
        )}
      </div>
    </div>
  );
}
