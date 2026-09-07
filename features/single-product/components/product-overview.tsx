import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

function loneImageFromHtml(html: string | null): string | null {
  if (!html?.trim()) return null;
  const src = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]?.trim();
  if (!src) return null;
  const leftover = html
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return leftover ? null : src;
}

export function resolveOverviewImage(opts: {
  overviewImage?: string | null;
  overviewImageUrl?: string | null;
  overviewImageAr?: string | null;
  overviewHtml?: string | null;
  isAr?: boolean;
}): string | null {
  const dedicated = opts.isAr
    ? opts.overviewImageAr || opts.overviewImageUrl || opts.overviewImage
    : opts.overviewImageUrl || opts.overviewImage || opts.overviewImageAr;
  if (dedicated?.trim()) return dedicated.trim();
  return loneImageFromHtml(opts.overviewHtml ?? null);
}

export async function ProductOverviewImage({
  src,
  alt,
  locale,
}: {
  src: string;
  alt: string;
  locale: string;
}) {
  const rtl = locale === "ar";
  const t = await getTranslations("SingleProduct");

  return (
    <section className="border-y border-border bg-background py-8 sm:py-12" id="overview">
      <div className="layout-page layout-gutter-x">
        <h2
          className={cn(
            "mb-6 text-[clamp(1.5rem,2.8vw,2rem)] leading-none text-foreground sm:mb-8",
            rtl ? "font-cairo font-semibold" : "font-chillax font-semibold tracking-wide"
          )}
        >
          {t("overviewHeading")}
        </h2>
        <div className="overflow-hidden bg-white">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={4800}
            className="block h-auto w-full object-contain object-top"
            sizes="(max-width: 1440px) 100vw, 1440px"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}

export async function ProductOverview({ html, locale }: { html: string | null; locale: string }) {
  if (!html) return null;
  const rtl = locale === "ar";
  const t = await getTranslations("SingleProduct");

  return (
    <section className="border-y border-border bg-card/40 py-10 sm:py-14" id="overview">
      <div className="layout-page layout-gutter-x">
        <h2
          className={cn(
            "mb-8 text-[clamp(1.5rem,2.8vw,2rem)] leading-none text-foreground",
            rtl ? "font-cairo font-semibold" : "font-chillax font-semibold tracking-wide"
          )}
        >
          {t("overviewHeading")}
        </h2>

        <div
          dir={rtl ? "rtl" : "ltr"}
          className={cn(
            "prose max-w-none dark:prose-invert",
            "prose-headings:font-chillax prose-headings:tracking-wide prose-headings:text-foreground",
            "prose-h2:text-[1.65rem] prose-h3:text-[1.25rem] prose-h4:text-[1.05rem]",
            "prose-p:font-chillax prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-muted-foreground",
            "prose-a:font-semibold prose-a:text-foreground prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-foreground",
            "prose-ul:font-chillax prose-ol:font-chillax prose-li:text-[15px] prose-li:text-muted-foreground prose-li:marker:text-primary",
            "prose-blockquote:border-primary prose-blockquote:font-chillax prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-muted-foreground",
            "prose-img:my-0 prose-img:w-full prose-img:rounded-md",
            "prose-hr:border-border",
            "prose-code:font-chillax prose-code:text-foreground",
            "[&_img]:mx-auto"
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
