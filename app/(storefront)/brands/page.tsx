import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getBrands } from "@/features/home/actions/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const rtl = (await getLocale()) === "ar";
  return {
    title: rtl ? "الماركات" : "Brands",
    description: rtl
      ? "كل الماركات المتوفرة في مامبا غيرز."
      : "Every brand stocked at Mamba Gears.",
    alternates: { canonical: "/brands" },
  };
}

/**
 * S8: "View All" under Shop by Brand pointed at /brands, which was a 404,
 * so it fell back to the unfiltered product list like everything else.
 */
export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const brands = await getBrands();

  return (
    <div className="bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{rtl ? "تسوق حسب" : "Shop by"}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {rtl ? "الماركات" : "Brands"}
          </h1>
          <p className={cn("mt-3 text-[13px] text-muted-foreground", rtl && "font-cairo")}>
            {brands.length} {rtl ? "ماركة" : brands.length === 1 ? "brand" : "brands"}
          </p>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-20 pt-8">
        {brands.length === 0 ? (
          <p className={cn("py-16 text-center text-sm text-muted-foreground", rtl && "font-cairo")}>
            {rtl ? "لا توجد ماركات بعد." : "No brands yet."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="group flex flex-col items-center gap-3 border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="relative flex h-14 w-full items-center justify-center">
                  {brand.logo_url || brand.logo ? (
                    <Image
                      src={(brand.logo_url || brand.logo) as string}
                      alt={brand.name}
                      fill
                      sizes="160px"
                      className="object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className={cn(
                        "text-[15px] font-semibold text-muted-foreground",
                        rtl && "font-cairo"
                      )}
                    >
                      {rtl ? brand.name_ar || brand.name : brand.name}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-center text-[12.5px] font-medium text-foreground",
                    rtl && "font-cairo"
                  )}
                >
                  {rtl ? brand.name_ar || brand.name : brand.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
