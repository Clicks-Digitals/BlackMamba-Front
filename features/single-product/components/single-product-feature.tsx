import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";
import {
  getProduct,
  ProductGallery,
  ProductActions,
  ProductComparisonTable,
  ProductOverview,
  ProductTabs,
  RelatedProducts
} from "@/features/single-product";

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const isHexColor = (s: string) => HEX_RE.test(s.trim());

function ColorSwatch({ hex, title, active }: { hex: string; title: string; active: boolean }) {
  return (
    <span
      title={title}
      className={cn(
        "relative inline-flex size-8 shrink-0 rounded-md border transition-all duration-200",
        active
          ? "border-[#d12f27] ring-1 ring-[#d12f27]/50 ring-offset-2 ring-offset-[#101112]"
          : "border-white/15 hover:border-white/40"
      )}
      style={{ backgroundColor: hex.trim() }}
    >
      {active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
          ? "border-[#d12f27] bg-[#9e1d20] text-white"
          : "border-white/12 bg-transparent text-foreground/80 hover:border-white/30 hover:text-foreground"
      )}
    >
      {label}
    </span>
  );
}

function ProductTitle({ name, rtl }: { name: string; rtl: boolean }) {
  const parts = name.split(/\s*\/\/\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2 && !rtl) {
    return (
      <h1 className="text-foreground">
        <span className="block font-beckman text-[clamp(1.85rem,4.2vw,3.2rem)] leading-[0.95] tracking-wide uppercase">
          {parts[0]}
        </span>
        <span className="mt-2 block font-chillax text-[clamp(1.05rem,2vw,1.35rem)] leading-snug text-white/80">
          {parts[1]}
        </span>
        {parts.length > 2 && (
          <span className="mt-2 block font-chillax text-sm leading-relaxed text-white/45">
            {parts.slice(2).join(" · ")}
          </span>
        )}
      </h1>
    );
  }

  return (
    <h1
      className={cn(
        "text-[clamp(1.45rem,3.2vw,2.2rem)] leading-[1.12] text-foreground",
        rtl ? "font-cairo font-bold" : "font-chillax tracking-wide"
      )}
    >
      {name}
    </h1>
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
  const hasOverview = !!(
    overviewHtml ||
    product.table ||
    (Array.isArray(product.features) && product.features.length > 0) ||
    (Array.isArray(product.features_ar) && product.features_ar.length > 0)
  );
  const brandName = product.brand
    ? (isAr && product.brand.name_ar ? product.brand.name_ar : product.brand.name)
    : null;

  return (
    <div className="bg-background">
      <div className="relative overflow-hidden border-b border-white/8 bg-[#080809]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 80% at 28% 40%, #000 18%, transparent 72%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 start-0 h-[28rem] w-[28rem] rounded-full bg-primary/18 blur-[110px]"
          aria-hidden
        />

        <nav
          className="relative layout-page layout-gutter-x flex h-11 items-center gap-1.5 font-chillax text-xs text-white/40"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-white">
            {t("home")}
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
          <Link href="/products" className="transition-colors hover:text-white">
            {t("products")}
          </Link>
          {categories.length > 0 && (
            <>
              <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
              <Link
                href={`/products?category_slug=${categories[0].slug}`}
                className="max-w-28 truncate transition-colors hover:text-white"
              >
                {categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
          <span className="truncate font-medium text-white/70">{name}</span>
        </nav>

        <div className="relative layout-page layout-gutter-x pb-10 pt-2 md:pb-14 md:pt-4">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12">
            <div className="lg:sticky lg:top-[calc(var(--layout-chrome-top)+1rem)]">
              <ProductGallery
                images={product.gallery}
                thumbnail={product.thumbnail}
                productName={name}
              />
            </div>

            <Reveal>
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#101112]/90 p-5 sm:p-7">
                <span
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-[#d12f27]/70 to-transparent"
                  aria-hidden
                />

                <p className="bm-kicker">{t("kicker")}</p>

                {brandName && product.brand && (
                  <Link
                    href={`/brand/${product.brand.slug}`}
                    className="group mt-3 inline-flex items-center gap-1.5"
                  >
                    {isAr ? (
                      <>
                        <span className="font-cairo text-[13px] text-white/45 transition-colors group-hover:text-white/70">
                          {t("visitThe")}
                        </span>
                        <span className="font-cairo text-[13px] font-semibold text-foreground underline decoration-primary/30 underline-offset-2 transition-all group-hover:decoration-primary">
                          {brandName}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-chillax text-[13px] text-white/45 transition-colors group-hover:text-white/70">
                          {t("visitThe")}
                        </span>
                        <span className="font-chillax text-[13px] font-semibold text-foreground underline decoration-primary/30 underline-offset-2 transition-all group-hover:decoration-primary">
                          {brandName}
                        </span>
                        <span className="font-chillax text-[13px] text-white/45 transition-colors group-hover:text-white/70">
                          {t("store")}
                        </span>
                      </>
                    )}
                  </Link>
                )}

                {categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/products?category_slug=${cat.slug}`}
                        className="inline-flex h-6 items-center rounded-md border border-white/10 bg-white/4 px-2.5 font-chillax text-[10px] font-semibold tracking-[0.16em] text-white/70 uppercase transition-colors hover:border-primary/40 hover:text-white"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <ProductTitle name={name} rtl={isAr} />
                </div>

                {product.variants && product.variants.length > 0 && (() => {
                  const groupLabel = product.variant_group?.display_label || product.variant_group?.name;
                  const currentLabel = product.variant_label || (isAr ? product.name_ar ?? product.name : product.name);
                  const allHex = isHexColor(currentLabel) && product.variants.every(v => isHexColor(v.variant_label || v.name));

                  return (
                    <div className="mt-5 space-y-2.5">
                      <div className="flex items-baseline gap-2">
                        {groupLabel && (
                          <span className="font-chillax text-[11px] font-black tracking-widest text-white/40 uppercase">
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

                <div className="mt-5 h-px bg-white/8" />

                <div className="mt-5">
                  <ProductActions product={product} description={description} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <ProductTabs
        locale={locale}
        productId={product.id}
        avgRating={product.avg_rating}
        reviewCount={product.review_count}
        hasOverview={hasOverview}
        overviewContent={
          <>
            <ProductOverview html={overviewHtml} locale={locale} />
            <ProductComparisonTable
              table={product.table}
              features={product.features}
              featuresAr={product.features_ar}
            />
          </>
        }
      />
      <RelatedProducts slug={productSlug} />
    </div>
  );
}
