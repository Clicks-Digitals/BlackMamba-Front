import Link from "next/link";
import { cookies } from "next/headers";
import { Heart } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function EmptyWishlist() {
  const [t, locale, cookieStore] = await Promise.all([
    getTranslations("Wishlist"),
    getLocale(),
    cookies(),
  ]);
  const rtl = locale === "ar";
  const signedIn = Boolean(cookieStore.get("token")?.value);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-lg border border-white/8 bg-[#141516] text-white/35">
        <Heart size={28} strokeWidth={1.5} />
      </div>
      <p className="bm-kicker mb-3">{t("title")}</p>
      <h2
        className={cn(
          "text-[clamp(1.6rem,3vw,2.2rem)] leading-none text-foreground",
          rtl ? "font-cairo font-semibold" : "font-chillax tracking-wide"
        )}
      >
        {t("empty")}
      </h2>
      <p
        className={cn(
          "mt-3 mb-8 max-w-md text-[15px] text-white/45",
          rtl ? "font-cairo" : "font-chillax"
        )}
      >
        {t("emptyDescription")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-md bg-primary px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#d12f27]",
            rtl ? "font-cairo" : "font-chillax"
          )}
        >
          {t("continueShopping")}
        </Link>
        {!signedIn && (
          <Link
            href="/login"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-md border border-white/12 px-7 text-[15px] font-semibold text-white/80 transition-colors duration-200 hover:border-white/25 hover:text-white",
              rtl ? "font-cairo" : "font-chillax"
            )}
          >
            {t("loginToSave")}
          </Link>
        )}
      </div>
    </div>
  );
}
