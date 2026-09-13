import { ClipboardList, Cpu, PackageCheck, ScanSearch, Wrench } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const STEP_ICONS: LucideIcon[] = [ClipboardList, ScanSearch, Wrench, Cpu, PackageCheck];

export async function ServiceProcess() {
  const [t, locale] = await Promise.all([
    getTranslations("ServiceCenter.process"),
    getLocale(),
  ]);
  const rtl = locale === "ar";

  const steps = STEP_ICONS.map((Icon, i) => ({
    Icon,
    index: String(i + 1).padStart(2, "0"),
    title: t(`steps.step${i + 1}.title` as never),
    description: t(`steps.step${i + 1}.description` as never),
  }));

  return (
    <section className="relative overflow-hidden bg-[#000000] py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />
      <div className="layout-page layout-gutter-x">
        <div className="max-w-2xl">
          <p className="bm-kicker">{t("kicker")}</p>
          <h2
            className={cn(
              "mt-3 leading-[1.05] text-white",
              "text-[clamp(1.7rem,3.4vw,2.6rem)]",
              !rtl && "font-chillax tracking-wide",
              rtl && "font-cairo font-semibold"
            )}
          >
            {t("heading")}
          </h2>
          <p
            className={cn(
              "mt-4 text-[15px] leading-relaxed text-white/50 sm:text-[16px]",
              rtl && "font-cairo"
            )}
          >
            {t("description")}
          </p>
        </div>

        <ol className="relative mt-12 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div
            className="pointer-events-none absolute start-[1.65rem] top-8 bottom-8 w-px bg-linear-to-b from-primary/70 via-white/10 to-transparent xl:hidden"
            aria-hidden
          />
          {steps.map((step) => (
            <li
              key={step.index}
              className={cn(
                "group relative rounded-lg border border-white/8 bg-[#000000] p-5 transition-colors duration-200",
                "hover:border-primary/40 hover:bg-[#000000]"
              )}
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[#EB0B1A]">
                  <step.Icon className="size-5" strokeWidth={1.7} />
                </span>
                <span className="font-mono text-[11px] tracking-[0.2em] text-white/30">{step.index}</span>
              </div>
              <h3
                className={cn(
                  "text-[15px] font-semibold leading-snug text-white sm:text-[16px]",
                  rtl && "font-cairo"
                )}
              >
                {step.title}
              </h3>
              <p
                className={cn(
                  "mt-2 text-[13px] leading-relaxed text-white/45",
                  rtl && "font-cairo"
                )}
              >
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
