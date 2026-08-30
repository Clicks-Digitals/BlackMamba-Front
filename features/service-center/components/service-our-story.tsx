import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function ServiceOurStory() {
  const [t, locale] = await Promise.all([
    getTranslations("ServiceCenter.ourStory"),
    getLocale(),
  ]);
  const rtl = locale === "ar";
  const word2 = t("word2");
  const title = word2 ? `${t("word1")} ${word2}` : t("word1");

  const tags = [
    { n: "01", label: t("tags.technology") },
    { n: "02", label: t("tags.trust") },
    { n: "03", label: t("tags.performance") },
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/6">
        <div className="layout-page layout-gutter-x py-16 md:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
          <div>
            <p className="bm-kicker">{t("kicker")}</p>
            <h2
              className={cn(
                "mt-3 leading-[0.92] text-white",
                "text-[clamp(2.2rem,5vw,4rem)]",
                !rtl && "font-beckman uppercase tracking-wide",
                rtl && "font-cairo font-bold"
              )}
            >
              {title}
            </h2>
          </div>

          <div>
            <p
              className={cn(
                "max-w-xl text-[16px] leading-relaxed text-white/55 sm:text-[17px]",
                rtl && "font-cairo"
              )}
            >
              {t("paragraph1")}
            </p>
            <p
              className={cn(
                "mt-5 max-w-xl text-[16px] leading-relaxed text-white/55 sm:text-[17px]",
                rtl && "font-cairo"
              )}
            >
              {t("paragraph2")}
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
          {tags.map((tag) => (
            <div key={tag.label} className="bg-[#121314] px-5 py-5 sm:px-6">
              <p className="font-mono text-[11px] tracking-[0.18em] text-[#d12f27]">{tag.n}</p>
              <p
                className={cn(
                  "mt-2 text-[15px] font-semibold uppercase tracking-[0.12em] text-white",
                  rtl && "font-cairo tracking-normal"
                )}
              >
                {tag.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
