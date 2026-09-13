import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ChevronRight, Globe, BadgeCheck, ShoppingBag, LayoutGrid } from "lucide-react";
import { ProductCard } from "@/components/shared";
import { cn } from "@/lib/utils";
import { getProducts } from "@/features/products";
import { getBrandBySlugAction } from "../actions/queries";
import { findShowcaseBrand } from "../data/showcase";

export async function BrandStoreFeature({ slug }: { slug: string }) {
  const [brand, locale] = await Promise.all([getBrandBySlugAction(slug), getLocale()]);
  if (!brand) notFound();

  const isAr = locale === "ar";
  const name = isAr && brand.name_ar ? brand.name_ar : brand.name;
  const tagline = isAr && brand.tagline_ar ? brand.tagline_ar : brand.tagline;
  const description = isAr && brand.description_ar ? brand.description_ar : brand.description;
  const logo = brand.logo_url || brand.logo;
  const banner = brand.banner_image_url || brand.banner_image;
  const website = brand.website || findShowcaseBrand(brand.slug)?.website || null;
  const productsHref = `/products?search=${encodeURIComponent(brand.name)}`;

  const products = await getProducts(1, { search: brand.name });
  const preview = products.results.slice(0, 10);
  const categories =
    brand.categories.length > 0
      ? brand.categories
      : Array.from(
          new Map(
            products.results.flatMap((product) =>
              (product.categories ?? []).map((cat) => [
                cat.slug,
                {
                  id: String(cat.id),
                  name: cat.name,
                  name_ar: cat.name_ar,
                  slug: cat.slug,
                  image_url: null,
                },
              ])
            )
          ).values()
        );

  return (
    <div className="bg-background">
      <div className="layout-gutter-x border-b border-border">
        <nav
          className="layout-page flex h-11 items-center gap-1.5 text-xs text-muted-foreground"
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
          <span className={cn("truncate font-medium text-foreground", isAr && "font-cairo")}>{name}</span>
        </nav>
      </div>

      <section className="relative h-[clamp(200px,32vw,380px)] w-full overflow-hidden bg-[#1a1a1a]">
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-black/40" />
        <div className="layout-page layout-gutter-x relative z-10 flex h-full items-center">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            {logo ? (
              <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[10px] border border-white/20 bg-white shadow-lg sm:size-[96px] md:size-[108px]">
                <Image src={logo} alt={name} fill className="object-contain p-2.5" unoptimized />
              </div>
            ) : null}
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm sm:text-[11px]">
                <BadgeCheck size={13} />
                {isAr ? "متجر رسمي" : "Official Store"}
              </span>
              <h1
                className={cn(
                  "mt-2 truncate text-[clamp(1.75rem,5vw,3.25rem)] leading-none font-semibold tracking-wide text-white uppercase",
                  isAr && "font-cairo tracking-normal"
                )}
              >
                {name}
              </h1>
              {tagline ? (
                <p className={cn("mt-2 max-w-xl text-sm text-white/80 sm:text-[15px]", isAr && "font-cairo")}>
                  {tagline}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="layout-page layout-gutter-x py-8 md:py-10">
        <section className="mb-10 flex flex-col gap-6 border-b border-border pb-8 md:mb-12 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <h2 className={cn("store-heading uppercase", isAr && "font-cairo")}>
              {isAr ? `عن ${name}` : `About ${name}`}
            </h2>
            <p className={cn("mt-3 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]", isAr && "font-cairo")}>
              {description ||
                (isAr ? "لا يوجد وصف متاح لهذه الماركة حالياً." : "No description available for this brand yet.")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag size={15} />
                {isAr ? `${products.count} منتج` : `${products.count} Products`}
              </span>
              {categories.length > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid size={15} />
                  {isAr ? `${categories.length} فئة` : `${categories.length} Categories`}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {website ? (
              <Link
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-[4px] border border-border bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50",
                  isAr && "font-cairo"
                )}
              >
                <Globe size={15} />
                {isAr ? "زيارة الموقع الرسمي" : "Visit live site"}
              </Link>
            ) : null}
            <Link
              href={productsHref}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-[4px] bg-primary px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--blue-hover)]",
                isAr && "font-cairo"
              )}
            >
              {isAr ? "عرض جميع المنتجات" : "See All Products"}
              <ChevronRight size={15} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>

        {categories.length > 0 ? (
          <section className="mb-10 md:mb-12">
            <h2 className={cn("store-heading mb-4 uppercase", isAr && "font-cairo")}>
              {isAr ? "تسوق حسب الفئة" : "Shop by Category"}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {categories.map((cat) => {
                const catName = isAr && cat.name_ar ? cat.name_ar : cat.name;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?search=${encodeURIComponent(brand.name)}&category_slug=${cat.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[8px] border border-border bg-card transition-colors hover:border-primary/50"
                  >
                    <span className="relative aspect-square w-full overflow-hidden bg-white">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={catName}
                          fill
                          sizes="(max-width: 640px) 50vw, 220px"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          unoptimized
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center bg-muted">
                          <LayoutGrid size={28} className="text-muted-foreground/50" />
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "line-clamp-1 px-2 py-2.5 text-center text-[13px] font-medium text-foreground",
                        isAr && "font-cairo"
                      )}
                    >
                      {catName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className={cn("store-heading uppercase", isAr && "font-cairo")}>
              {isAr ? `منتجات ${name}` : `Products from ${name}`}
            </h2>
            {products.count > 0 ? (
              <Link
                href={productsHref}
                className={cn("store-view-all shrink-0", isAr && "font-cairo")}
              >
                {isAr ? "عرض الكل" : "See all"} ({products.count})
              </Link>
            ) : null}
          </div>

          {preview.length === 0 ? (
            <p className={cn("py-16 text-center text-sm text-muted-foreground", isAr && "font-cairo")}>
              {isAr ? "لا توجد منتجات حاليًا" : "No products available yet."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {preview.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
