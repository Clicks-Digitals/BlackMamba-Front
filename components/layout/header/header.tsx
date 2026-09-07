import { cookies } from "next/headers";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { HeaderIcons, HeaderUserMenu, NavDrawerOpenButton } from "@/components/layout/";
import { HeaderSearch } from "@/components/layout/header/header-search";
import { HeaderNav } from "@/components/layout/header/header-nav";
import { LocaleSwitcher, CurrencySwitcher } from "@/components/shared";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getCurrencies, DEFAULT_CURRENCY } from "@/actions/getCurrencies";

export async function Header() {
  const cookieStore = await cookies();
  const currentCurrency = cookieStore.get("NEXT_CURRENCY")?.value ?? DEFAULT_CURRENCY;

  const [t, locale, currencies] = await Promise.all([
    getTranslations("Header"),
    getLocale(),
    getCurrencies(),
  ]);

  const rtl = locale === "ar";
  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.categories"), href: "/categories" },
    { label: t("nav.serviceCenter"), href: "/service-center" },
    { label: t("nav.products"), href: "/products" },
  ];

  return (
    <header
      className="relative w-full border-b border-white/8 bg-store-nav text-store-nav-fg"
      style={{ height: "var(--layout-header-bar-height)" }}
    >
      <div className="layout-page layout-gutter-x flex h-full items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div className="flex xl:hidden">
            <NavDrawerOpenButton
              label={t("openMenu")}
              className="flex size-10 items-center justify-center text-store-nav-fg/80 transition-colors duration-150 hover:bg-white/10 hover:text-store-nav-fg"
            />
          </div>
          <Link href="/" aria-label="Black Mamba" className="flex shrink-0 items-center">
            <BrandLogo size="xs" priority />
          </Link>
        </div>

        <HeaderNav navLinks={navLinks} pcBuilderLabel={t("nav.pcBuilder")} rtl={rtl} />

        <HeaderSearch variant="desktop" />

        <div className="ms-auto flex shrink-0 items-center gap-1">
          <HeaderSearch variant="mobile" />
          <div className="hidden items-center divide-x divide-white/15 xl:flex">
            <LocaleSwitcher currentLocale={locale} variant="storeNav" />
            <CurrencySwitcher currencies={currencies} currentCurrency={currentCurrency} />
            <ThemeToggle />
          </div>
          <div className="xl:hidden">
            <ThemeToggle />
          </div>
          <HeaderIcons />
          <div className="hidden xl:block">
            <HeaderUserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
