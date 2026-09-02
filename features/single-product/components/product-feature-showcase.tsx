import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

/**
 * Microless-style marketing photo section before specs.
 * Demo imagery for client review — real products can replace this via overview HTML
 * (overview / overview_ar) with embedded images from the CMS/admin.
 */
const BANNERS = [
  {
    key: "lighting" as const,
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "performance" as const,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
  },
] as const;

const USE_CASES = [
  {
    key: "studio" as const,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "office" as const,
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "gaming" as const,
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "setup" as const,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
  },
] as const;

export async function ProductFeatureShowcase({ locale }: { locale: string }) {
  const t = await getTranslations("SingleProduct");
  const rtl = locale === "ar";

  return (
    <section className="border-y border-border bg-background" id="feature-showcase" aria-label={t("featureShowcaseLabel")}>
      <div className="space-y-0">
        {BANNERS.map((banner, i) => (
          <div
            key={banner.key}
            className={cn(
              "relative isolate overflow-hidden",
              i === 0 ? "min-h-[22rem] sm:min-h-[28rem]" : "min-h-[20rem] sm:min-h-[26rem]"
            )}
          >
            <Image
              src={banner.image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
              priority={i === 0}
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-black/80 via-black/45 to-black/20"
              aria-hidden
            />
            <div className="relative layout-page layout-gutter-x flex h-full min-h-[inherit] flex-col items-center justify-center px-6 py-14 text-center">
              <h2
                className={cn(
                  "max-w-3xl text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] text-white",
                  rtl ? "font-cairo font-bold" : "font-chillax font-semibold tracking-wide"
                )}
              >
                {t(`featureBanner.${banner.key}.title`)}
              </h2>
              <p
                className={cn(
                  "mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base",
                  rtl ? "font-cairo" : "font-chillax"
                )}
              >
                {t(`featureBanner.${banner.key}.body`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="layout-page layout-gutter-x py-10 sm:py-14">
        <h2
          className={cn(
            "mb-7 text-center text-[clamp(1.4rem,2.6vw,2rem)] text-foreground",
            rtl ? "font-cairo font-bold" : "font-chillax font-semibold tracking-wide"
          )}
        >
          {t("useCasesHeading")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {USE_CASES.map((item) => (
            <figure key={item.key} className="group overflow-hidden rounded-md border border-border bg-card">
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={item.image}
                  alt={t(`useCase.${item.key}.title`)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <figcaption
                className={cn(
                  "px-4 py-3.5 text-[15px] font-semibold text-foreground",
                  rtl ? "font-cairo" : "font-chillax"
                )}
              >
                {t(`useCase.${item.key}.title`)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
