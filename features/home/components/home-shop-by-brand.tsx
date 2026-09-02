import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeBrand } from "../types";
import { getShopByBrands } from "../actions/queries";
import { HomeSlider } from "./home-slider";

export async function HomeShopByBrand({
  locale,
  brands: brandsProp,
}: {
  locale: string;
  brands?: HomeBrand[];
}) {
  const [fetched, t] = await Promise.all([
    brandsProp ? Promise.resolve(brandsProp) : getShopByBrands(),
    getTranslations("Home"),
  ]);
  const brands = brandsProp ?? fetched;
  if (!brands.length) return null;

  const rtl = locale === "ar";

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-y border-border bg-muted/60 py-7 sm:py-9">
      <div className="layout-page layout-gutter-x">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="bm-kicker mb-1.5">{t("shopByBrandKicker")}</p>
            <h2
              className={cn(
                "leading-none font-semibold text-foreground",
                "text-[clamp(1.5rem,2.8vw,2.25rem)]",
                !rtl && "font-chillax tracking-wide",
                rtl && "font-cairo font-bold"
              )}
            >
              {t("shopByBrand")}
            </h2>
          </div>

          <Link
            href="/products"
            className={cn(
              "hidden shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex",
              rtl && "font-cairo"
            )}
          >
            {t("viewAll")}
            {rtl ? (
              <ArrowLeft size={14} strokeWidth={2.25} />
            ) : (
              <ArrowRight size={14} strokeWidth={2.25} />
            )}
          </Link>
        </div>

        <HomeSlider
          rtl={rtl}
          autoPlay={false}
          loop={brands.length > 6}
          arrowVariant="light"
          itemClassName="basis-[42%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[14.28%]"
        >
          {brands.map((brand) => {
            const name = rtl ? brand.name_ar || brand.name : brand.name;
            const logo = brand.logo_url || brand.logo;
            const isShowcase = brand.id.startsWith("showcase-");
            const href = isShowcase
              ? `/products?search=${encodeURIComponent(brand.name)}`
              : `/brand/${brand.slug}`;

            return (
              <Link
                key={brand.id}
                href={href}
                aria-label={rtl ? `تسوق ${name}` : `Shop ${name}`}
                className={cn(
                  "group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card",
                  "transition-[border-color,transform,box-shadow] duration-200",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                )}
              >
                <div className="relative flex aspect-5/4 items-center justify-center bg-[#edeff0] px-4 py-5">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={name}
                      width={140}
                      height={56}
                      className="h-10 w-auto max-w-[78%] object-contain transition-transform duration-300 group-hover:scale-[1.05] sm:h-11"
                      unoptimized
                    />
                  ) : (
                    <span
                      className={cn(
                        "px-2 text-center text-[15px] font-bold tracking-wide text-[#1a1c1e]",
                        rtl ? "font-cairo" : "font-chillax"
                      )}
                    >
                      {name}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
                  <p
                    className={cn(
                      "truncate text-[13px] font-semibold text-foreground",
                      rtl && "font-cairo"
                    )}
                  >
                    {name}
                  </p>
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    {rtl ? (
                      <ArrowLeft size={12} strokeWidth={2.5} />
                    ) : (
                      <ArrowRight size={12} strokeWidth={2.5} />
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </HomeSlider>
      </div>
    </section>
  );
}
