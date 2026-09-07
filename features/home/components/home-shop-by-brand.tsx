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
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2
              className={cn(
                "store-heading",
                !rtl && "font-chillax",
                rtl && "font-cairo"
              )}
            >
              {t("shopByBrand")}
            </h2>
          </div>

          <Link
            href="/products"
            className={cn(
              "store-view-all hidden shrink-0 items-center gap-1 sm:inline-flex",
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
            const href = `/brand/${brand.slug}`;

            return (
              <Link
                key={brand.id}
                href={href}
                aria-label={rtl ? `تسوق ${name}` : `Shop ${name}`}
                className={cn(
                  "group flex h-full w-full flex-col overflow-hidden rounded-[6px] border border-border bg-card",
                  "transition-colors duration-150 hover:border-primary/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                )}
              >
                <div className="relative flex aspect-5/4 items-center justify-center bg-white px-3 py-4 dark:bg-[#FFFFFF]">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={name}
                      width={140}
                      height={56}
                      className="h-9 w-auto max-w-[72%] object-contain sm:h-10"
                      unoptimized
                    />
                  ) : (
                    <span
                      className={cn(
                        "px-2 text-center text-[13px] font-semibold text-[#000000]",
                        rtl ? "font-cairo" : "font-chillax"
                      )}
                    >
                      {name}
                    </span>
                  )}
                </div>

                <div className="border-t border-border px-2.5 py-2">
                  <p
                    className={cn(
                      "truncate text-center text-[12px] font-medium text-foreground",
                      rtl && "font-cairo"
                    )}
                  >
                    {name}
                  </p>
                </div>
              </Link>
            );
          })}
        </HomeSlider>
      </div>
    </section>
  );
}
