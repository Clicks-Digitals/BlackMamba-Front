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

  const sectionProducts = orderedSections.flatMap((s) => s.products ?? []);
  const highlightProducts = (orderedSections[0]?.products ?? sectionProducts).slice(0, 2);
  const highlightIds = new Set(highlightProducts.map((p) => p.id));
  const dealProduct =
    sectionProducts.find(
      (p) => !highlightIds.has(p.id) && (p.clearance_sale || p.has_discount)
    ) ??
    sectionProducts.find((p) => p.clearance_sale || p.has_discount) ??
    null;

  const shopByBrand = <HomeShopByBrand locale={locale} />;

  // Build the slot map — each key maps to the React node to render.
  const slotMap: Record<HomeSectionKey, React.ReactNode> = {
    hero: (
      <HomeHero
        slides={swipers}
        categories={categories}
        highlightProducts={highlightProducts}
        dealProduct={dealProduct}
        featuredCoupon={featuredCoupon}
        locale={locale}
        shopLabel={t("shopNow")}
      />
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
        betweenSlot={shopByBrand}
        betweenAfterIndex={0}
      />
    ) : (
      shopByBrand
    ),
    promo_split: featuredCoupon ? <HomePromoSplit coupon={featuredCoupon} /> : null,
    black_mamba: <HomeBlackMamba />,
    promo_banner: <HomePromoBanner banners={banners} locale={locale} />,
    top_brands: <HomeTopBrands locale={locale} />,
    // Rendered inside product_sections (between first and second collection).
    shop_by_brand: null,
  };

  const keys: HomeSectionKey[] =
    layout.length > 0
      ? (layout
          .filter((s) => s.is_visible && s.key !== "shop_by_brand")
          .map((s) => s.key) as HomeSectionKey[])
      : DEFAULT_ORDER.filter((k) => k !== "shop_by_brand");

  // Ensure product sections (and thus Shop by Brand) still appear if CMS omitted them.
  const finalKeys = keys.includes("product_sections")
    ? keys
    : (() => {
        const next = [...keys];
        const after = next.indexOf("categories");
        next.splice(after >= 0 ? after + 1 : next.length, 0, "product_sections");
        return next;
      })();

  return (
    <>
      {finalKeys.map((key) => {
        const node = slotMap[key];
        return node ? <Fragment key={key}>{node}</Fragment> : null;
      })}
    </>
  );
}
