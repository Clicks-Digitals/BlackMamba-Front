"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { Category } from "@/types/category";
import { subscribeToNewsletter } from "./subscribe";

const navItems = [
  { key: "home" as const, href: "/" },
  { key: "categories" as const, href: "/categories" },
  { key: "products" as const, href: "/products" },
  { key: "cart" as const, href: "/cart" }
];

const blackMambaItems = [
  { key: "buildPc" as const, href: "/pc-builder" },
  { key: "browseParts" as const, href: "/pc-builder/parts" },
  { key: "readyMade" as const, href: "/pc-builder/ready-made" }
];

const offerItems = [
  { key: "bestDeals" as const, href: "/products" },
  { key: "bestSeller" as const, href: "/products" },
  { key: "latestProducts" as const, href: "/products" }
];

const companyItems = [
  { key: "account" as const, href: "/profile" },
  { key: "wishlist" as const, href: "/favourites" },
  { key: "serviceCenter" as const, href: "/service-center" }
];

const socialItems = [
  { key: "instagram" as const, href: "#", initials: "IG" },
  { key: "facebook" as const, href: "#", initials: "FB" }
];

function Column({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold tracking-wide text-white/50 uppercase">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[13px] font-normal text-white/70 transition-colors duration-150 hover:text-white"
    >
      {children}
    </Link>
  );
}

function NewsletterForm() {
  const t = useTranslations("Footer");
  const [state, action, isPending] = useActionState(subscribeToNewsletter, {
    status: "idle",
    message: ""
  });

  useEffect(() => {
    if (state.status === "success") toast.success(t("brand.newsletterSuccess"));
    else if (state.status === "error" && state.message) toast.error(state.message);
  }, [state.status, state.message, t]);

  return (
    <form action={action} className="mt-3 flex w-full max-w-md gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder={t("brand.newsletterPlaceholder")}
        className="h-9 min-w-0 flex-1 rounded-[4px] border border-white/12 bg-white/5 px-3 text-[13px] text-white placeholder:text-white/35 transition-colors duration-150 focus:border-white/30 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-9 shrink-0 rounded-[4px] bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-[var(--blue-hover)] disabled:opacity-60"
      >
        {isPending ? t("brand.newsletterSubmitting") : t("brand.newsletterButton")}
      </button>
    </form>
  );
}

function FooterBrandReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className={cn("bm-footer-line mx-auto mb-4 max-w-3xl", on && "is-on")} aria-hidden />;
}

export function Footer({ categories = [], locale = "en" }: { categories?: Category[]; locale?: string }) {
  const t = useTranslations("Footer");
  const rtl = locale === "ar";
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/8 bg-store-footer text-store-footer-link">

      <div className="layout-page layout-gutter-x relative grid gap-8 pt-8 pb-6 md:grid-cols-12 md:gap-8 md:pt-10 md:pb-8">
        <div className="md:col-span-4">
          <Link href="/" aria-label="Black Mamba" className="inline-flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/50">
            {t("brand.tagline")}
          </p>
          <p className="mt-5 flex items-center gap-2 text-[12px] font-medium text-white/45">
            <Mail size={13} /> {t("brand.newsletterTitle")}
          </p>
          <NewsletterForm />
        </div>

        <div className="grid gap-0 sm:grid-cols-2 md:col-span-8 md:grid-cols-4 md:gap-8">
          <Column title={t("columns.discover")}>
            {categories.map((cat) => (
              <FooterLink key={cat.id} href={`/products?category_slug=${cat.slug}`}>
                <span className="capitalize">{rtl && cat.name_ar ? cat.name_ar : cat.name}</span>
              </FooterLink>
            ))}
          </Column>

          <Column title={t("columns.blackMamba")}>
            {blackMambaItems.map((item) => (
              <FooterLink key={item.key} href={item.href}>
                {t(`blackMambaLinks.${item.key}`)}
              </FooterLink>
            ))}
          </Column>

          <Column title={t("columns.offers")}>
            {offerItems.map((item) => (
              <FooterLink key={item.key} href={item.href}>
                {t(`offerLinks.${item.key}`)}
              </FooterLink>
            ))}
          </Column>

          <Column title={t("columns.company")}>
            {companyItems.map((item) => (
              <FooterLink key={item.key} href={item.href}>
                {t(`companyLinks.${item.key}`)}
              </FooterLink>
            ))}
            {navItems.map((item) => (
              <FooterLink key={item.key} href={item.href}>
                {t(`navLinks.${item.key}`)}
              </FooterLink>
            ))}
            <div className="mt-2 flex items-center gap-2.5">
              {socialItems.map(({ key, href, initials }) => (
                <Link
                  key={key}
                  href={href}
                  aria-label={t(`companyLinks.${key}`)}
                  className="flex size-9 items-center justify-center rounded-md border border-white/12 text-[10px] font-bold text-white/70 transition-colors duration-200 hover:border-primary/50 hover:text-white"
                >
                  {initials}
                </Link>
              ))}
            </div>
          </Column>
        </div>
      </div>

      <div className="layout-page layout-gutter-x relative z-10 flex flex-wrap items-center gap-3 border-t border-white/8 py-5 text-[12px] text-white/40">
        <span>{t("copyright", { year })}</span>
        <div className={cn("flex flex-wrap gap-2", rtl ? "mr-auto" : "ml-auto")}>
          {(["cod", "visa", "mastercard", "cliq"] as const).map((badge) => (
            <span
              key={badge}
              className="rounded-[4px] border border-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/50"
            >
              {t(`payBadges.${badge}`)}
            </span>
          ))}
        </div>
      </div>

      <FooterBrandReveal />

      <div className="pointer-events-none overflow-hidden pb-4 pt-2 text-center md:pb-8">
        <p
          className="inline-block bg-linear-to-t from-store-nav to-white/50 bg-clip-text font-beckman leading-[0.85] font-normal uppercase text-transparent opacity-80"
          style={{ fontSize: "clamp(2rem, 10vw, 6.5rem)" }}
        >
          {t("wordmark")}
        </p>
      </div>
    </footer>
  );
}
