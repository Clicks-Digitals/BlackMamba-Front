import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  getFeaturedCategories,
  getFeaturedCoupon,
  getHomeBanners,
  getHomeLayout,
  getHomeSections,
  getHomeSwipers,
  getActiveCampaigns,
} from "../actions/queries";
import { HomeHero } from "./home-hero";
import { HomeTrustBar } from "./home-trust-bar";
import { HomeCategoryGrid } from "./home-category-grid";
import { HomeProductSections } from "./home-product-sections";
import { HomePromoSplit } from "./home-promo-split";
import { HomeBlackMamba } from "./home-black-mamba";
import { HomePromoBanner } from "./home-promo-banner";
import { HomeShopByBrand } from "./home-shop-by-brand";
import { HomeTopBrands } from "./home-top-brands";
import { CampaignCarousel } from "./campaign-carousel";
import type { HomeSectionKey } from "../types";

// Default order used as a fallback when the layout API returns nothing.
const DEFAULT_ORDER: HomeSectionKey[] = [
  "hero",
  "trust_bar",
  "campaigns",
  "categories",
  "product_sections",
  "promo_split",
  "black_mamba",
  "promo_banner",
  "top_brands",
  "shop_by_brand",
];

export async function HomeFeature() {
  const [locale, swipers, categories, sections, banners, t, layout, featuredCoupon, campaigns] =
    await Promise.all([
      getLocale(),
      getHomeSwipers(),
      getFeaturedCategories(),
      getHomeSections(),
      getHomeBanners(),
      getTranslations("Home"),
      getHomeLayout(),
      getFeaturedCoupon(),
      getActiveCampaigns(),
    ]);

  const isAr = locale === "ar";

  const orderedSections = sections
    .filter((s) => s.is_active && s.products?.length)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Build the slot map — each key maps to the React node to render.
  const slotMap: Record<HomeSectionKey, React.ReactNode> = {
    hero: (
      <HomeHero slides={swipers} locale={locale} shopLabel={t("shopNow")} />
    ),
    trust_bar: <HomeTrustBar />,
    campaigns: campaigns.length > 0
      ? <CampaignCarousel campaigns={campaigns} isAr={isAr} />
      : null,
    categories: (
      <HomeCategoryGrid
        categories={categories}
        locale={locale}
        title={t("categoriesTitle")}
        viewAllLabel={t("viewAll")}
        exploreLabel={t("exploreCollection")}
      />
    ),
    product_sections: orderedSections.length ? (
      <HomeProductSections
        sections={orderedSections}
        locale={locale}
        startIndex={0}
      />
    ) : null,
    promo_split: featuredCoupon ? <HomePromoSplit coupon={featuredCoupon} /> : null,
    black_mamba: <HomeBlackMamba />,
    promo_banner: <HomePromoBanner banners={banners} locale={locale} />,
    top_brands: <HomeTopBrands locale={locale} />,
    shop_by_brand: <HomeShopByBrand locale={locale} />,
  };

  // Resolve the ordered, visible keys to render.
  const keys: HomeSectionKey[] =
    layout.length > 0
      ? (layout
          .filter((s) => s.is_visible)
          .map((s) => s.key) as HomeSectionKey[])
      : DEFAULT_ORDER;

  return (
    <>
      {keys.map((key) => {
        const node = slotMap[key];
        return node ? <Fragment key={key}>{node}</Fragment> : null;
      })}
    </>
  );
}
