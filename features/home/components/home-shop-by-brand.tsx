import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrands } from "../actions/queries";
import { HomeSlider } from "./home-slider";

export async function HomeShopByBrand({ locale }: { locale: string }) {
  const brands = await getBrands();
  if (!brands.length) return null;

  const rtl = locale === "ar";

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 py-12 md:py-16">
      <div className="layout-page layout-gutter-x">

        {/* ── Header row ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="bm-kicker mb-2">{rtl ? "شركاؤنا" : "Partners"}</p>
            <h2 className="flex flex-wrap items-baseline gap-x-2">
            <span
              className={cn(
                "font-medium leading-tight text-foreground/40",
                "text-[clamp(0.875rem,1.8vw,1.25rem)]",
                rtl && "font-cairo"
              )}
            >
              {rtl ? "تسوق حسب" : "Shop By"}
            </span>
            <span
              className={cn(
                "leading-tight text-foreground",
                "text-[clamp(1.5rem,2.8vw,2.25rem)]",
                !rtl && "font-chillax tracking-wide",
                rtl && "font-cairo font-bold"
              )}
            >
              {rtl ? "العلامة التجارية" : "Brand"}
            </span>
          </h2>
          </div>

          <Link
            href="/products"
            className={cn(
              "hidden sm:flex items-center gap-1.5 pb-0.5",
              "text-[13px] font-medium text-foreground/50 hover:text-foreground transition-colors",
              rtl && "font-cairo"
            )}
          >
            {rtl ? "عرض الكل" : "View all"}
            {rtl
              ? <ArrowLeft size={13} strokeWidth={2.5} />
              : <ArrowRight size={13} strokeWidth={2.5} />}
          </Link>
        </div>

        {/* ── Brand tiles ── */}
        <div className="mt-6 md:mt-8">
          <HomeSlider rtl={rtl}>
            {brands.map((brand) => {
              const name = rtl ? brand.name_ar || brand.name : brand.name;

              return (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  aria-label={rtl ? `تسوق ${name}` : `Shop ${name}`}
                  className={cn(
                    "group relative block overflow-hidden rounded-lg border border-white/8",
                    "aspect-square w-[44vw] sm:w-48 md:w-56 lg:w-60 xl:w-64",
                    "bg-[#141516] transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/35",
                    // Ring on focus (keyboard navigation)
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                  )}
                >
                  {/* Brand image */}
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width:640px) 44vw, (max-width:768px) 192px, (max-width:1024px) 224px, 256px"
                      unoptimized
                    />
                  ) : (
                    /* Placeholder when no image */
                    <div className="flex h-full items-center justify-center p-6">
                      <span
                        className={cn(
                          "text-center font-bold text-foreground text-[clamp(1rem,2vw,1.5rem)]",
                          rtl ? "font-cairo" : "font-chillax tracking-wide"
                        )}
                      >
                        {name}
                      </span>
                    </div>
                  )}

                  {/* Permanent bottom gradient so brand name is always legible */}
                  <div className="absolute inset-0 bg-linear-to-t from-[var(--ink)]/75 via-[var(--ink)]/15 to-transparent pointer-events-none" />

                  {/* Hover tint overlay */}
                  <div className="absolute inset-0 bg-[var(--ink)]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                  {/* Bottom info bar */}
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 p-4",
                      rtl && "text-right"
                    )}
                  >
                    {/* Brand name — always visible */}
                    <p
                      className={cn(
                        "font-semibold text-white leading-snug",
                        "text-[clamp(0.875rem,1.4vw,1.125rem)]",
                        rtl ? "font-cairo" : "font-chillax"
                      )}
                    >
                      {name}
                    </p>

                    {/* "Shop now" — fades in on hover */}
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-0.5",
                        "opacity-0 translate-y-1 transition-all duration-300",
                        "group-hover:opacity-100 group-hover:translate-y-0"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-widest text-white/80",
                          rtl && "font-cairo"
                        )}
                      >
                        {rtl ? "تسوق الآن" : "Shop now"}
                      </span>
                      {rtl
                        ? <ArrowLeft size={10} strokeWidth={2.5} className="text-white/80 shrink-0" />
                        : <ArrowRight size={10} strokeWidth={2.5} className="text-white/80 shrink-0" />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </HomeSlider>
        </div>

      </div>
    </section>
  );
}
