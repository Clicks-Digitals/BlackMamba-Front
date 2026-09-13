"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Cpu, Heart, LogOut, Menu, ShoppingCart, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CurrencySwitcher, LocaleSwitcher } from "@/components/shared";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useStoreNavDrawer } from "@/stores/store-nav-drawer-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Currency } from "@/types/currency";

export type StoreNavLink = { label: string; href: string };

type StoreNavDrawerProps = {
  locale: "en" | "ar";
  currencies: Currency[];
  currentCurrency: string;
  currentLocale: string;
};

export function StoreNavDrawer({
  locale,
  currencies,
  currentCurrency,
  currentLocale,
}: StoreNavDrawerProps) {
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const open = useStoreNavDrawer((s) => s.open);
  const setOpen = useStoreNavDrawer((s) => s.setOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const loggedIn = isAuthenticated && !!user;

  const handleSignOut = async () => {
    await logout();
    setOpen(false);
    router.refresh();
    router.push("/");
  };

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.categories"), href: "/categories" },
    { label: t("nav.serviceCenter"), href: "/service-center" },
    { label: t("nav.products"), href: "/products" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const pcBuilderActive = isActive("/pc-builder");

  return (
    <Drawer direction={locale === "ar" ? "right" : "left"} open={open} onOpenChange={setOpen}>
      <DrawerContent className="flex h-svh max-h-svh max-w-sm flex-col overflow-hidden bg-[#000000]">
        <DrawerHeader className="shrink-0 border-b border-white/8 py-4">
          <DrawerTitle className="text-center font-letterman text-xl font-semibold tracking-widest text-white uppercase">
            {t("storeName")}
          </DrawerTitle>
        </DrawerHeader>

        <nav className="custom-no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          <div className="pt-4 pb-4">
            <DrawerClose asChild>
              <Link
                href="/pc-builder"
                aria-current={pcBuilderActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg bg-[#000000] px-3.5 py-3 transition-colors duration-200 hover:bg-[#000000]/80",
                  pcBuilderActive && "ring-2 ring-[#EB0B1A] ring-offset-2 ring-offset-[#000000]"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EB0B1A]/20">
                  <Cpu className="h-5 w-5 text-[#EB0B1A]" />
                </div>
                <div className="min-w-0">
                  <p className="leading-tight font-semibold text-[#EB0B1A]">{t("nav.pcBuilder")}</p>
                  <p className="text-xs leading-snug text-white/50">
                    {locale === "ar" ? "صمّم جهازك بنفسك" : "Design your custom rig"}
                  </p>
                </div>
              </Link>
            </DrawerClose>
          </div>

          <p className="mb-1 px-1 text-xs font-semibold tracking-widest text-white/45 uppercase">
            {t("shop")}
          </p>
          <ul className="flex flex-col border-b border-white/8 pb-4">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <DrawerClose asChild>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex py-3 text-base transition-colors",
                        active
                          ? "border-s-[3px] border-primary ps-3 font-semibold text-white"
                          : "font-medium text-white/80 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  </DrawerClose>
                </li>
              );
            })}
          </ul>

          <ul className="flex flex-col border-b border-white/8 pb-4">
            <li>
              <DrawerClose asChild>
                <Link
                  href="/favourites"
                  className="flex items-center justify-between py-3 text-base font-medium text-white/80 transition-colors hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="size-5" strokeWidth={2} />
                    {t("wishlist")}
                  </span>
                  {wishlistCount > 0 && (
                    <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-none font-bold">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
              </DrawerClose>
            </li>
            <li>
              <DrawerClose asChild>
                <Link
                  href="/cart"
                  className="flex items-center justify-between py-3 text-base font-medium text-white/80 transition-colors hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart className="size-5" strokeWidth={2} />
                    {t("cart")}
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-none font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </DrawerClose>
            </li>
            <li>
              <DrawerClose asChild>
                <Link
                  href={loggedIn ? "/profile" : "/login"}
                  className="flex items-center gap-3 py-3 text-base font-medium text-white/80 transition-colors hover:text-white"
                >
                  <UserIcon className="size-5" strokeWidth={2} />
                  {loggedIn ? t("myAccount") : t("login")}
                </Link>
              </DrawerClose>
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/8 pt-5">
            <LocaleSwitcher currentLocale={currentLocale} variant="drawer" />
            <CurrencySwitcher
              currencies={currencies}
              currentCurrency={currentCurrency}
              variant="drawer"
            />
            <ThemeToggle />
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/8 bg-[#000000] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {loggedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
            >
              <LogOut className="size-4" />
              <span>{t("signOut")}</span>
            </button>
          ) : (
            <DrawerClose asChild>
              <Link
                href="/login"
                className="flex min-h-11 w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#EB0B1A]"
              >
                {t("login")}
              </Link>
            </DrawerClose>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function NavDrawerOpenButton({ className, label }: { className?: string; label: string }) {
  const setOpen = useStoreNavDrawer((s) => s.setOpen);
  return (
    <button type="button" onClick={() => setOpen(true)} aria-label={label} className={className}>
      <Menu className="size-6 shrink-0 md:size-7" strokeWidth={2} />
    </button>
  );
}
