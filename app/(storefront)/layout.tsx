import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { Footer } from "@/components/layout/footer/footer";
import { Header } from "@/components/layout/header/header";
import { StoreNavDrawer } from "@/components/layout/store-nav-drawer";
import { CategoryDrawer } from "@/components/layout/category-drawer";
import { SubHeader } from "@/components/layout/header/sub-header";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartStoreInitializer, WishlistStoreInitializer } from "@/components/shared";
import { SupportTicketWidget } from "@/components/shared/support-ticket-widget";
import { HeaderChrome } from "@/components/layout/header/header-chrome";
import { RouteTransition } from "@/components/motion";
import { getCurrencies, DEFAULT_CURRENCY } from "@/actions/getCurrencies";
import { getFeaturedCategories, getNavCategories, getStorefrontCategories, getActiveOffers } from "@/features/home";
import { getMyCart } from "@/features/cart";
import { getWishlist } from "@/features/wishlist";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const currentCurrency = cookieStore.get("NEXT_CURRENCY")?.value ?? DEFAULT_CURRENCY;

  const [locale, featuredCategories, navCategories, allCategories, currencies, cart, wishlistData, offers] =
    await Promise.all([
      getLocale(),
      getFeaturedCategories(),
      getNavCategories(),
      getStorefrontCategories(),
      getCurrencies(),
      token ? getMyCart() : Promise.resolve(null),
      token ? getWishlist() : Promise.resolve([]),
      getActiveOffers()
    ]);

  const cartItems = cart?.items ?? [];
  const wishlistIds = wishlistData.flatMap((w) => w.product_ids);

  return (
      <div className="flex min-h-screen flex-col bg-background">
      <CartStoreInitializer items={cartItems} />
      <WishlistStoreInitializer ids={wishlistIds} />
      {/* Nav drawer — header hamburger → links, locale, currency */}
      <StoreNavDrawer
        locale={locale === "ar" ? "ar" : "en"}
        currencies={currencies}
        currentCurrency={currentCurrency}
        currentLocale={locale}
      />
      {/* Category drawer — sub-header grid icon → all categories tree */}
      <CategoryDrawer categories={allCategories} locale={locale} />
      <HeaderChrome>
        <AnnouncementBar offers={offers} />
        <Header />
        <SubHeader categories={navCategories} />
      </HeaderChrome>
      <main className="relative flex-1 overflow-x-clip">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <Footer categories={featuredCategories} locale={locale} />
      <SupportTicketWidget isGuest={!token} />
    </div>
  );
}
