import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function ProductOverview({ html, locale }: { html: string | null; locale: string }) {
  if (!html) return null;
  const rtl = locale === "ar";
  const t = await getTranslations("SingleProduct");

  return (
    <section className="bg-[#0d0e0e] py-10 sm:py-14">
      <div className="layout-page layout-gutter-x">
        <p className="bm-kicker mb-3">{t("overviewTab")}</p>
        <h2
          className={cn(
            "mb-7 leading-none text-foreground",
            "text-[clamp(1.45rem,2.8vw,2.25rem)]",
            rtl ? "font-cairo font-semibold" : "font-chillax tracking-wide"
          )}
        >
          {t("overviewHeading")}
        </h2>

        <div className="overflow-hidden rounded-lg border border-white/8 bg-[#101112]">
          <div className="h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Sanitized server-side (nh3, allowlisted tags/attrs) before storage —
                safe to render as-is, see apps/products/models.py sanitize_overview_html. */}
            <div
              dir={rtl ? "rtl" : "ltr"}
              className={cn(
                "prose prose-neutral max-w-none",
                "prose-headings:font-chillax prose-headings:tracking-wide prose-headings:text-foreground",
                "prose-h2:text-[1.5rem] prose-h3:text-[1.2rem] prose-h4:text-[1.05rem]",
                "prose-p:font-chillax prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-foreground/70",
                "prose-a:font-semibold prose-a:text-foreground prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-foreground",
                "prose-ul:font-chillax prose-ol:font-chillax prose-li:text-[15px] prose-li:text-foreground/70 prose-li:marker:text-primary",
                "prose-blockquote:border-primary prose-blockquote:font-chillax prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-white/55",
                "prose-img:my-6 prose-img:rounded-md prose-img:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                "prose-hr:border-white/10",
                "prose-code:font-chillax prose-code:text-foreground"
              )}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
