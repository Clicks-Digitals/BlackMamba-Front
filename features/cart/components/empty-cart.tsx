import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function EmptyCart() {
  const locale = await getLocale();
  const t = await getTranslations("Cart");
  const ar = locale === "ar";

  return (
    <div className="min-h-[70vh] bg-background bm-stage">
      <div className="layout-page layout-gutter-x flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 flex size-20 items-center justify-center rounded-lg border border-white/8 bg-[#141516] text-white/35">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h1
          className={cn(
            "text-[clamp(2rem,4vw,3rem)] leading-none text-foreground",
            ar ? "font-cairo font-semibold" : "font-chillax tracking-wide"
          )}
        >
          {t("emptyTitle")}
        </h1>
        <p
          className={cn(
            "mt-3 mb-8 max-w-md text-[15px] text-white/45",
            ar ? "font-cairo" : "font-chillax"
          )}
        >
          {t("emptyDescription")}
        </p>
        <Link
          href="/products"
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-md bg-primary px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#d12f27]",
            ar ? "font-cairo" : "font-chillax"
          )}
        >
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
