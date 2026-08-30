import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { getSponsors } from "../actions/queries";

export async function HomeTopBrands({ locale }: { locale: string }) {
  const [t, sponsors] = await Promise.all([
    getTranslations("Home"),
    getSponsors(),
  ]);

  if (!sponsors.length) return null;

  const rtl = locale === "ar";

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 py-8 md:py-12">
      {/*
        Tilted teal band — positioned at the section level so it genuinely spans
        the full viewport width. top-[63%] places it over the marquee strip.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[63%] hidden h-16 -translate-y-1/2 rotate-[-3.5deg] bg-primary/80 md:block"
        aria-hidden
      />

      <div className="layout-page layout-gutter-x">
        <h2
          className={cn(
            "flex items-center gap-3 leading-none uppercase text-foreground",
            "text-[clamp(1.6rem,3vw,2.25rem)]",
            !rtl && "font-chillax tracking-wide",
            rtl && "font-cairo font-semibold normal-case"
          )}
        >
          <span className="h-1 w-9 shrink-0 rounded-full bg-primary" aria-hidden />
          {t("topBrands")}
        </h2>
      </div>

      {/* Full-bleed white strip — spans the entire viewport, independent of the page gutters */}
      <div className="relative left-1/2 mt-7 w-screen max-w-[100vw] -translate-x-1/2 md:mt-9">
        <div className="relative overflow-hidden border-y border-white/8 bg-[#121314] py-6 md:py-8">
          <div className="overflow-hidden mask-[linear-gradient(to_right,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)] rtl:mask-[linear-gradient(to_left,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)]">
            <div className={cn("banner-track", rtl && "direction-[reverse]")}>
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="banner-wrapper gap-3 px-3 md:gap-5 md:px-5"
                  aria-hidden={copy === 1}
                >
                  {sponsors.map((sponsor, i) => {
                    const altText = rtl ? sponsor.name_ar || sponsor.name : sponsor.name;

                    const img = (
                      <div className="group inline-flex h-18 min-w-28 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-[#EDEFF0] px-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_rgba(158,29,32,0.18)] md:h-20 md:min-w-32">
                        <Image
                          src={sponsor.image_url}
                          alt={altText}
                          width={110}
                          height={52}
                          className="max-h-11 w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-100 md:max-h-12"
                          unoptimized
                        />
                      </div>
                    );

                    return (
                      <div key={`${copy}-${sponsor.id}`} className="flex shrink-0 items-center gap-3 md:gap-5">
                        {sponsor.link ? (
                          <Link href={sponsor.link} target="_blank" rel="noopener noreferrer">
                            {img}
                          </Link>
                        ) : (
                          img
                        )}
                        {i < sponsors.length - 1 && (
                          <span className="h-10 w-px shrink-0 bg-primary/8 md:h-12" aria-hidden />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
