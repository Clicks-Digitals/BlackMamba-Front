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
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 py-8 md:py-10">
      <div className="layout-page layout-gutter-x">
        <h2
          className={cn(
            "store-heading",
            !rtl && "font-chillax",
            rtl && "font-cairo"
          )}
        >
          {t("topBrands")}
        </h2>
      </div>

      <div className="relative left-1/2 mt-4 w-screen max-w-[100vw] -translate-x-1/2">
        <div className="relative overflow-hidden border-y border-border bg-muted/60 py-4 md:py-5">
          <div className="overflow-hidden mask-[linear-gradient(to_right,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)] rtl:mask-[linear-gradient(to_left,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)]">
            <div className={cn("banner-track", rtl && "direction-[reverse]")}>
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="banner-wrapper gap-3 px-3 md:gap-4 md:px-4"
                  aria-hidden={copy === 1}
                >
                  {sponsors.map((sponsor, i) => {
                    const altText = rtl ? sponsor.name_ar || sponsor.name : sponsor.name;

                    const img = (
                      <div className="group inline-flex h-14 min-w-24 shrink-0 items-center justify-center rounded-[6px] border border-border bg-white px-4 transition-colors duration-150 hover:border-primary/40 md:h-16 md:min-w-28 dark:bg-[#FFFFFF]">
                        <Image
                          src={sponsor.image_url}
                          alt={altText}
                          width={110}
                          height={52}
                          className="max-h-8 w-auto object-contain opacity-80 transition-opacity duration-150 group-hover:opacity-100 md:max-h-9"
                          unoptimized
                        />
                      </div>
                    );

                    return (
                      <div key={`${copy}-${sponsor.id}`} className="flex shrink-0 items-center gap-3 md:gap-4">
                        {sponsor.link ? (
                          <Link href={sponsor.link} target="_blank" rel="noopener noreferrer">
                            {img}
                          </Link>
                        ) : (
                          img
                        )}
                        {i < sponsors.length - 1 && (
                          <span className="h-8 w-px shrink-0 bg-border md:h-10" aria-hidden />
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
