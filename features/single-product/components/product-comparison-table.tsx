import { getLocale, getTranslations } from "next-intl/server";
import type { ProductTable } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductSpecSectionProps {
  table: ProductTable | null;
  features: unknown;
  featuresAr: unknown;
}

export async function ProductComparisonTable({
  table,
  features,
  featuresAr,
}: ProductSpecSectionProps) {
  const locale = await getLocale();
  const t = await getTranslations("SingleProduct");
  const isAr = locale === "ar";

  const rawFeatures = isAr && featuresAr ? featuresAr : features;
  const featuresList: string[] = Array.isArray(rawFeatures)
    ? (rawFeatures as string[]).filter(Boolean)
    : [];

  if (!table && featuresList.length === 0) return null;

  const title = table
    ? isAr && table.title_ar
      ? table.title_ar
      : table.title
    : null;
  const columns = table
    ? isAr && table.columns_ar
      ? table.columns_ar
      : table.columns
    : [];

  const colCount = columns.length + 1;
  const gridCols =
    colCount === 2
      ? "grid-cols-[2fr_3fr]"
      : colCount === 3
        ? "grid-cols-[2fr_2fr_2fr]"
        : colCount === 4
          ? "grid-cols-[2fr_1.5fr_1.5fr_1.5fr]"
          : "grid-cols-[2fr_repeat(var(--cols),1fr)]";

  return (
    <section className="bg-[#0d0e0e] pb-10 sm:pb-14">
      <div className="layout-page layout-gutter-x">
        <div className="overflow-hidden rounded-lg border border-white/8 bg-[#101112]">
          <div className="h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {table && (
              <div className={featuresList.length > 0 ? "mb-10" : ""}>
                <p className="bm-kicker mb-3">{t("specifications")}</p>
                <h2
                  className={cn(
                    "mb-7 leading-none text-foreground",
                    "text-[clamp(1.45rem,2.8vw,2.25rem)]",
                    isAr ? "font-cairo font-semibold" : "font-chillax tracking-wide"
                  )}
                >
                  {title ?? t("featureLabel")}
                </h2>

                <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
                  <div className="min-w-96">
                    <div
                      className={`grid ${gridCols} overflow-hidden rounded-md border border-white/10 bg-white/[0.04]`}
                      style={colCount > 4 ? { "--cols": columns.length } as React.CSSProperties : undefined}
                    >
                      <div className="px-5 py-3.5">
                        <span className="font-chillax text-[11px] tracking-widest text-white/45 uppercase">
                          {t("featureLabel")}
                        </span>
                      </div>
                      {columns.map((col, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 border-s border-white/10 px-5 py-3.5"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                          <span className="font-chillax text-[11px] tracking-widest text-white uppercase">
                            {col}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-1.5 overflow-hidden rounded-md border border-white/8">
                      {table.rows.map((row, rowIdx) => {
                        const featureLabel =
                          isAr && row.feature_ar ? row.feature_ar : row.feature;
                        const isLast = rowIdx === table.rows.length - 1;

                        return (
                          <div
                            key={row.id}
                            className={`group grid ${gridCols} transition-colors duration-150 hover:bg-white/4 ${
                              !isLast ? "border-b border-white/8" : ""
                            } ${rowIdx % 2 === 1 ? "bg-white/3" : "bg-transparent"}`}
                            style={colCount > 4 ? { "--cols": columns.length } as React.CSSProperties : undefined}
                          >
                            <div className="flex items-center gap-3 px-5 py-4">
                              <span
                                className="h-5 w-0.5 shrink-0 rounded-full bg-white/20 transition-colors group-hover:bg-primary"
                                aria-hidden
                              />
                              <span className="font-chillax text-sm font-semibold text-foreground">
                                {featureLabel}
                              </span>
                            </div>

                            {row.values.map((val, i) => (
                              <div
                                key={i}
                                className="flex items-center border-s border-white/8 px-5 py-4"
                              >
                                {val ? (
                                  <span className="font-chillax text-sm text-white/70">
                                    {val}
                                  </span>
                                ) : (
                                  <span className="font-chillax text-sm text-white/25">
                                    —
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {featuresList.length > 0 && (
              <div className={table ? "border-t border-white/8 pt-8" : ""}>
                <p className="bm-kicker mb-3">{t("featuresHeading")}</p>
                <h2
                  className={cn(
                    "mb-6 leading-none text-foreground",
                    "text-[clamp(1.45rem,2.8vw,2.25rem)]",
                    isAr ? "font-cairo font-semibold" : "font-chillax tracking-wide"
                  )}
                >
                  {t("featuresHeading")}
                </h2>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {featuresList.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-md border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-primary/30"
                    >
                      <svg
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden
                      >
                        <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M5.25 8.25l1.75 1.75 3.75-3.75"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-chillax text-sm leading-relaxed text-white/70">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
