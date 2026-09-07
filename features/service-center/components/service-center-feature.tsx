import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowDownRight, BadgeCheck, Clock, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceOurStory } from "./service-our-story";
import { ServiceProcess } from "./service-process";
import { GetInTouch } from "./get-in-touch";

const CHIPS = [
  { icon: Wrench, key: "repairs" as const },
  { icon: ShieldCheck, key: "parts" as const },
  { icon: Clock, key: "turnaround" as const },
  { icon: BadgeCheck, key: "warranty" as const },
];

export async function ServiceCenterFeature() {
  const [t, locale] = await Promise.all([
    getTranslations("ServiceCenter"),
    getLocale(),
  ]);
  const rtl = locale === "ar";

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 80% at 70% 40%, #000000 18%, transparent 72%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-24 end-0 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 start-0 h-px w-full bg-linear-to-r from-transparent via-primary/60 to-transparent"
          aria-hidden
        />

        <div className="relative layout-page layout-gutter-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:py-20">
          <div>
            <p className="bm-kicker">{t("hero.kicker")}</p>
            <h1
              className={cn(
                "mt-4 max-w-[12ch] leading-[0.9] text-foreground",
                "text-[clamp(2.6rem,7vw,5.4rem)]",
                !rtl && "font-beckman uppercase tracking-wide",
                rtl && "font-cairo font-bold"
              )}
            >
              {t("pageTitle")}
            </h1>
            <p
              className={cn(
                "mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]",
                rtl && "font-cairo"
              )}
            >
              {t("hero.subtitle")}
            </p>

            <a
              href="#service-contact"
              className={cn(
                "group mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#EB0B1A]",
                rtl && "font-cairo"
              )}
            >
              {t("hero.cta")}
              <ArrowDownRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5 rtl:group-hover:-translate-x-0.5" />
            </a>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:max-w-lg">
              {CHIPS.map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2.5"
                >
                  <Icon className="size-4 shrink-0 text-[#EB0B1A]" strokeWidth={1.75} />
                  <span className={cn("text-[12px] font-medium text-foreground/80", rtl && "font-cairo")}>
                    {t(`hero.chips.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg border border-border bg-card">
              <span className="pointer-events-none absolute start-3 top-3 z-10 h-7 w-7 border-s border-t border-[#EB0B1A]" />
              <span className="pointer-events-none absolute end-3 top-3 z-10 h-7 w-7 border-e border-t border-[#EB0B1A]" />
              <span className="pointer-events-none absolute start-3 bottom-3 z-10 h-7 w-7 border-s border-b border-[#EB0B1A]" />
              <span className="pointer-events-none absolute end-3 bottom-3 z-10 h-7 w-7 border-e border-b border-[#EB0B1A]" />
              <Image
                src="/Service-Center.svg"
                alt=""
                width={720}
                height={640}
                className="aspect-[5/4] w-full object-cover object-center lg:aspect-[4/3]"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/15" />
              <div className="service-scan pointer-events-none absolute inset-x-[8%] top-0 h-1/4" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      <ServiceOurStory />
      <ServiceProcess />
      <GetInTouch />
    </div>
  );
}
