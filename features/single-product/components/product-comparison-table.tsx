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

  const isSimpleKeyValue = !!table && columns.length <= 1;

  return (
    <section className="bg-background py-10 sm:py-14" id="specifications">
      <div className="layout-page layout-gutter-x">
        <h2
          className={cn(
            "mb-6 text-[clamp(1.5rem,2.8vw,2rem)] leading-none text-foreground",
            isAr ? "font-cairo font-semibold" : "font-chillax font-semibold tracking-wide"
          )}
        >
          {title ?? t("specifications")}
        </h2>

        {table && isSimpleKeyValue && (
          <dl className="overflow-hidden rounded-md border border-border">
            {table.rows.map((row, rowIdx) => {
              const featureLabel = isAr && row.feature_ar ? row.feature_ar : row.feature;
              const value = (isAr && row.values_ar?.[0]) || row.values[0] || "";
              return (
                <div
                  key={row.id}
                  className={cn(
                    "grid grid-cols-1 gap-1 px-4 py-3.5 sm:grid-cols-[minmax(12rem,0.35fr)_minmax(0,0.65fr)] sm:gap-6",
                    rowIdx > 0 && "border-t border-border",
                    rowIdx % 2 === 1 && "bg-muted/25"
                  )}
                >
                  <dt
                    className={cn(
                      "text-[13px] font-medium text-muted-foreground",
                      isAr ? "font-cairo" : "font-chillax"
                    )}
                  >
                    {featureLabel}
                  </dt>
                  <dd
                    className={cn(
                      "text-[14px] font-semibold text-foreground",
                      isAr ? "font-cairo" : "font-chillax"
                    )}
                  >
                    {value || "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}

        {table && !isSimpleKeyValue && (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-96 overflow-hidden rounded-md border border-border">
              <div
                className="grid border-b border-border bg-muted/50"
                style={{
                  gridTemplateColumns: `minmax(10rem,1.4fr) repeat(${columns.length}, minmax(7rem,1fr))`,
                }}
              >
                <div className="px-4 py-3">
                  <span className="font-chillax text-[11px] tracking-widest text-muted-foreground uppercase">
                    {t("featureLabel")}
                  </span>
                </div>
                {columns.map((col, i) => (
                  <div key={i} className="border-s border-border px-4 py-3">
                    <span className="font-chillax text-[11px] tracking-widest text-foreground uppercase">
                      {col}
                    </span>
                  </div>
                ))}
              </div>
              {table.rows.map((row, rowIdx) => {
                const featureLabel = isAr && row.feature_ar ? row.feature_ar : row.feature;
                return (
                  <div
                    key={row.id}
                    className={cn(
                      "grid",
                      rowIdx > 0 && "border-t border-border",
                      rowIdx % 2 === 1 && "bg-muted/25"
                    )}
                    style={{
                      gridTemplateColumns: `minmax(10rem,1.4fr) repeat(${columns.length}, minmax(7rem,1fr))`,
                    }}
                  >
                    <div className="px-4 py-3.5 font-chillax text-sm font-semibold text-foreground">
                      {featureLabel}
                    </div>
                    {row.values.map((val, i) => {
                      const cellValue = (isAr && row.values_ar?.[i]) || val;
                      return (
                        <div
                          key={i}
                          className="border-s border-border px-4 py-3.5 font-chillax text-sm text-muted-foreground"
                        >
                          {cellValue || "—"}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {featuresList.length > 0 && (
          <div className={cn(table && "mt-10")}>
            <h3
              className={cn(
                "mb-4 text-lg text-foreground",
                isAr ? "font-cairo font-semibold" : "font-chillax font-semibold"
              )}
            >
              {t("featuresHeading")}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {featuresList.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-md border border-border bg-muted/20 px-4 py-3"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span
                    className={cn(
                      "text-sm leading-relaxed text-muted-foreground",
                      isAr ? "font-cairo" : "font-chillax"
                    )}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
