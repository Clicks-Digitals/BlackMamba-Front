import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProduct,
  ProductGallery,
  ProductActions,
  ProductComparisonTable,
  ProductOverview,
  ProductFeatureShowcase,
  ProductReviewsSection,
  RelatedProducts,
} from "@/features/single-product";
import { DEMO_PRODUCT_TABLE } from "@/features/single-product/data/demo-specs-table";

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const isHexColor = (s: string) => HEX_RE.test(s.trim());

function ColorSwatch({ hex, title, active }: { hex: string; title: string; active: boolean }) {
  return (
    <span
      title={title}
      className={cn(
        "relative inline-flex size-8 shrink-0 rounded-md border transition-all duration-200",
        active
          ? "border-primary ring-1 ring-primary/50 ring-offset-2 ring-offset-background"
          : "border-border hover:border-muted-foreground"
      )}
      style={{ backgroundColor: hex.trim() }}
    >
      {active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 7L5.5 10L11.5 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
}

function TextChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-md border px-3 font-chillax text-[12px] font-semibold tracking-wide transition-all duration-150",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-muted/40 text-foreground/80 hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </span>
  );
}

export async function SingleProductFeature({ productSlug }: { productSlug: string }) {
  const res = await getProduct(productSlug);
  if (!res.ok) notFound();

  const [locale, t] = await Promise.all([getLocale(), getTranslations("SingleProduct")]);
  const isAr = locale === "ar";

  const product = res.data;
  const name = isAr && product.name_ar ? product.name_ar : product.name;
  const categories = (product.categories ?? [])
    .map((c) => ({ name: isAr && c.name_ar ? c.name_ar : c.name, slug: c.slug }))
    .filter((c) => c.name);
  const description = isAr && product.description_ar ? product.description_ar : product.description;
  const overviewHtml = isAr && product.overview_ar ? product.overview_ar : product.overview;
  const brandName = product.brand
    ? isAr && product.brand.name_ar
      ? product.brand.name_ar
      : product.brand.name
    : null;

  const featureBullets: string[] = (() => {
    const raw = isAr && product.features_ar ? product.features_ar : product.features;
    if (Array.isArray(raw)) return (raw as string[]).filter(Boolean).slice(0, 8);
    return [];
  })();

  const avgRating = product.avg_rating ?? null;
  const reviewCount = product.review_count ?? 0;
  const filledStars = avgRating != null ? Math.min(5, Math.max(0, Math.round(avgRating))) : 0;

  const inStockBadge =
    product.inventory_mode === "TOGGLE"
      ? product.in_stock
      : product.inventory_mode === "TRACK"
        ? (product.product_stock ?? 0) > 0
        : product.is_available;

  return (
    <div className="bg-background">
      <nav
        className="layout-page layout-gutter-x flex h-11 items-center gap-1.5 font-chillax text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          {t("home")}
        </Link>
        <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
        <Link href="/products" className="transition-colors hover:text-foreground">
          {t("products")}
        </Link>
        {categories.length > 0 && (
          <>
            <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
            <Link
              href={`/products?category_slug=${categories[0].slug}`}
              className="max-w-36 truncate transition-colors hover:text-foreground"
            >
              {categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
        <span className="truncate font-medium text-foreground/80">{name}</span>
      </nav>

      {/* Microless-style 3-column buy area */}
      <div className="layout-page layout-gutter-x pb-10 pt-2 md:pb-12 md:pt-3">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(16.5rem,0.72fr)] lg:gap-7 xl:gap-8">
          {/* Left — gallery */}
          <div className="min-w-0">
            <ProductGallery
              images={product.gallery}
              thumbnail={product.thumbnail}
              productName={name}
            />
          </div>

          {/* Center — title, rating, highlights, description, variants, brand */}
          <div className="min-w-0">
            <h1
              className={cn(
                "text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-foreground",
                isAr ? "font-cairo font-bold" : "font-chillax font-semibold"
              )}
            >
              {name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {inStockBadge && (
                <span className="inline-flex h-6 items-center gap-1.5 rounded border border-success/30 bg-success/10 px-2 font-chillax text-[11px] font-semibold text-success">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden />
                  {t("inStock")}
                </span>
              )}
              {avgRating != null && (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex gap-0.5 text-amber-400" aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn("size-3.5", i < filledStars ? "fill-current" : "fill-transparent")}
                        strokeWidth={1.5}
                      />
                    ))}
                  </span>
                  <span className="font-chillax text-xs">
                    {avgRating.toFixed(1)} ({reviewCount} {t("reviews")})
                  </span>
                </a>
              )}
            </div>

            {featureBullets.length > 0 && (
              <ul className="mt-5 space-y-2">
                {featureBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span
                      className={cn(
                        "text-[14px] leading-snug text-foreground/90",
                        isAr ? "font-cairo" : "font-chillax"
                      )}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {description && (
              <p
                className={cn(
                  "mt-5 text-[14px] leading-relaxed text-muted-foreground",
                  isAr ? "font-cairo" : "font-chillax"
                )}
              >
                {description}
              </p>
            )}

            {product.variants && product.variants.length > 0 && (() => {
              const groupLabel =
                product.variant_group?.display_label || product.variant_group?.name;
              const currentLabel =
                product.variant_label ||
                (isAr ? product.name_ar ?? product.name : product.name);
              const allHex =
                isHexColor(currentLabel) &&
                product.variants.every((v) => isHexColor(v.variant_label || v.name));

              return (
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-baseline gap-2">
                    {groupLabel && (
                      <span className="font-chillax text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                        {groupLabel}:
                      </span>
                    )}
                    {!allHex && (
                      <span className="font-chillax text-[13px] font-semibold text-foreground">
                        {currentLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allHex ? (
                      <ColorSwatch hex={currentLabel} title={name} active />
                    ) : (
                      <TextChip label={currentLabel} active />
                    )}
                    {product.variants.map((v) => {
                      const vLabel = v.variant_label || v.name;
                      return allHex ? (
                        <Link key={v.id} href={`/products/${v.slug}`} title={v.name}>
                          <ColorSwatch hex={vLabel} title={v.name} active={false} />
                        </Link>
                      ) : (
                        <Link key={v.id} href={`/products/${v.slug}`}>
                          <TextChip label={vLabel} active={false} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {brandName && product.brand && (
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-5">
                {product.brand.logo_url ? (
                  <Link
                    href={`/brand/${product.brand.slug}`}
                    className="relative flex h-12 w-28 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30 px-2"
                  >
                    <Image
                      src={product.brand.logo_url}
                      alt={brandName}
                      width={112}
                      height={48}
                      className="max-h-10 w-auto object-contain"
                      unoptimized
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/brand/${product.brand.slug}`}
                    className={cn(
                      "text-sm font-semibold text-foreground underline decoration-primary/30 underline-offset-2 hover:decoration-primary",
                      isAr ? "font-cairo" : "font-chillax"
                    )}
                  >
                    {brandName}
                  </Link>
                )}
                <Link
                  href={`/brand/${product.brand.slug}`}
                  className={cn(
                    "text-xs text-muted-foreground transition-colors hover:text-foreground",
                    isAr ? "font-cairo" : "font-chillax"
                  )}
                >
                  {isAr ? (
                    <>
                      {t("visitThe")} {brandName}
                    </>
                  ) : (
                    <>
                      {t("visitThe")} {brandName} {t("store")}
                    </>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Right — sticky buy box */}
          <div className="lg:sticky lg:top-[calc(var(--layout-chrome-top)+0.75rem)]">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {overviewHtml && <ProductOverview html={overviewHtml} locale={locale} />}

      {/* Demo marketing photos (Microless-style). Real content comes from overview HTML in CMS. */}
      <ProductFeatureShowcase locale={locale} />

      {/* Specs: real CMS table when present, otherwise demo for client preview */}
      <ProductComparisonTable
        table={product.table ?? DEMO_PRODUCT_TABLE}
        features={null}
        featuresAr={null}
      />

      <div id="reviews">
        <ProductReviewsSection
          productId={product.id}
          avgRating={product.avg_rating}
          reviewCount={product.review_count}
        />
      </div>

      <RelatedProducts slug={productSlug} />
    </div>
  );
}
