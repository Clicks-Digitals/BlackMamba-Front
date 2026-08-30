import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ChevronRight, Globe, BadgeCheck, ShoppingBag, LayoutGrid } from "lucide-react";
import { ProductCard } from "@/components/shared";
import { getProducts } from "@/features/products";
import { getBrandBySlugAction } from "../actions/queries";

export async function BrandStoreFeature({ slug }: { slug: string }) {
  const [brand, locale] = await Promise.all([getBrandBySlugAction(slug), getLocale()]);
  if (!brand) notFound();

  const isAr = locale === "ar";
  const name = isAr && brand.name_ar ? brand.name_ar : brand.name;
  const tagline = isAr && brand.tagline_ar ? brand.tagline_ar : brand.tagline;
  const description = isAr && brand.description_ar ? brand.description_ar : brand.description;

  const products = await getProducts(1, { brand_slug: brand.slug });

  return (
    <div className="bg-background">
      {/* ── Breadcrumb ── */}
      <div className="layout-gutter-x border-b border-primary/10">
        <nav
          className="layout-page flex h-11 items-center gap-1.5 font-chillax text-xs text-foreground/50"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
          <Link href="/products" className="transition-colors hover:text-foreground">
            {isAr ? "المنتجات" : "Products"}
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="shrink-0 rtl:rotate-180" />
          <span className="truncate font-medium text-foreground">{name}</span>
        </nav>
      </div>

      {/* ── Hero banner — Amazon brand-store style ── */}
      <div className="relative h-[clamp(180px,28vw,360px)] w-full overflow-hidden bg-[#121314]">
        {brand.banner_image_url && (
          <Image
            src={brand.banner_image_url}
            alt={name}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/35" />
        <div className="layout-page layout-gutter-x relative z-10 flex h-full items-center">
          <div className="flex items-center gap-4">
            {brand.logo_url && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#26292C] bg-[#0B0F0E] shadow-lg sm:h-20 sm:w-20">
                <Image src={brand.logo_url} alt={name} fill className="object-contain p-2" unoptimized />
              </div>
            )}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                <BadgeCheck size={13} /> {isAr ? "متجر رسمي" : "Official Store"}
              </span>
              <h1 className="mt-2 font-chillax text-[clamp(1.8rem,5vw,3.5rem)] uppercase leading-none text-white">
                {name}
              </h1>
              {tagline && (
                <p className="mt-1 max-w-lg font-chillax text-sm text-white/80 sm:text-base">{tagline}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="layout-page layout-gutter-x py-6 md:py-8">
        {/* ── About this brand ── */}
        <div className="mb-8 flex flex-col gap-5 border-b border-primary/10 pb-7 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="mb-2 font-chillax text-xl uppercase tracking-wide text-foreground">
              {isAr ? `عن ${name}` : `About ${name}`}
            </h2>
            <p className="font-chillax text-sm leading-relaxed text-foreground/70">
              {description || (isAr
                ? "لا يوجد وصف متاح لهذه الماركة حالياً."
                : "No description available for this brand yet.")}
            </p>

            {/* Quick stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70">
                <ShoppingBag size={15} className="text-foreground/40" />
                {isAr ? `${products.count} منتج` : `${products.count} Products`}
              </span>
              {brand.categories.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70">
                  <LayoutGrid size={15} className="text-foreground/40" />
                  {isAr ? `${brand.categories.length} فئة` : `${brand.categories.length} Categories`}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {brand.website && (
              <Link
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-primary/5"
              >
                <Globe size={14} /> {isAr ? "زيارة الموقع" : "Visit Website"}
              </Link>
            )}
            <Link
              href={`/products?brand_slug=${brand.slug}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d12f27]"
            >
              {isAr ? "عرض جميع المنتجات" : "See All Products"}
              <ChevronRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* ── Shop by category — image cards ── */}
        {brand.categories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-chillax text-xl uppercase tracking-wide text-foreground">
              {isAr ? "تصفح حسب الفئة" : "Shop by Category"}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {brand.categories.map((cat) => {
                const catName = isAr && cat.name_ar ? cat.name_ar : cat.name;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?brand_slug=${brand.slug}&category_slug=${cat.slug}`}
                    className="group flex flex-col items-center gap-2"
                  >
                    <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-primary/10 bg-[var(--muted)] transition-colors group-hover:border-primary/30">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={catName}
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <LayoutGrid size={22} className="text-foreground/25" />
                      )}
                    </span>
                    <span className="line-clamp-1 text-center text-[12.5px] font-medium text-foreground transition-colors group-hover:text-[var(--blue-hover)]">
                      {catName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Products grid ── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-chillax text-xl uppercase tracking-wide text-foreground">
            {isAr ? "منتجات الماركة" : `Products from ${name}`}
          </h2>
          {products.count > 0 && (
            <Link
              href={`/products?brand_slug=${brand.slug}`}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {isAr ? "عرض الكل" : "See all"} ({products.count})
            </Link>
          )}
        </div>

        {products.results.length === 0 ? (
          <p className="py-12 text-center text-sm text-foreground/40">
            {isAr ? "لا توجد منتجات حاليًا" : "No products available yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.results.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
