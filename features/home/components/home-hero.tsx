"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Footprints,
  Gamepad2,
  Grid2X2,
  Headphones,
  Monitor,
  Package,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { addToCartAction, updateCartItemAction } from "@/features/cart/actions/mutations";
import { useCartStore, buildCartItemKey } from "@/stores/cart-store";
import type { FeaturedCoupon } from "../actions/queries";
import type { HomeSwiperSlide } from "../types";

type HomeHeroProps = {
  slides: HomeSwiperSlide[];
  categories: Category[];
  highlightProducts: Product[];
  dealProduct: Product | null;
  featuredCoupon: FeaturedCoupon | null;
  locale: string;
  shopLabel: string;
};

const AUTOPLAY_MS = 7000;
const EASE = [0.22, 1, 0.36, 1] as const;
const SIDEBAR_LIMIT = 11;

function slideCopy(slide: HomeSwiperSlide, locale: string) {
  const rtl = locale === "ar";
  return {
    rtl,
    title: rtl ? slide.title_ar || slide.title : slide.title,
    subtitle: rtl ? slide.subtitle_ar || slide.subtitle : slide.subtitle,
    btn: rtl ? slide.button_text_ar || slide.button_text : slide.button_text,
    href: slide.link || "/products",
  };
}

function slideCover(slide: HomeSwiperSlide) {
  return slide.image_url || slide.image;
}

function productThumb(product: Product) {
  return (
    product.thumbnail ||
    product.gallery?.find((g) => g.is_primary)?.file ||
    product.gallery?.[0]?.file ||
    null
  );
}

function productPrices(product: Product) {
  const hasCampaign = !!product.campaign_price;
  const hasDiscount = product.has_discount && !!product.discount_price;
  const finalPrice = hasCampaign
    ? product.campaign_price!
    : hasDiscount
      ? product.discount_price!
      : product.base_price;
  const origPrice = hasCampaign || hasDiscount ? product.base_price : null;
  return { finalPrice, origPrice, sym: product.currency_info?.symbol ?? "" };
}

function categoryLucideIcon(cat: Category): LucideIcon {
  const key = `${cat.slug} ${cat.name} ${cat.name_ar ?? ""}`.toLowerCase();
  if (/camera|photo|تصوير/.test(key)) return Camera;
  if (/phone|mobile|tablet|جوال|هاتف/.test(key)) return Smartphone;
  if (/monitor|display|شاشة/.test(key)) return Monitor;
  if (/head|audio|ear|سماعة/.test(key)) return Headphones;
  if (/accessor|peripher|mouse|keyboard|ملحق/.test(key)) return CircuitBoard;
  if (/gaming|game|ألعاب/.test(key)) return Gamepad2;
  if (/custom|pc|computer|كمبيوتر|gaming pc/.test(key)) return Cpu;
  if (/foot|shoe|حذاء/.test(key)) return Footprints;
  if (/apparel|cloth|shirt|wear|ملابس/.test(key)) return Shirt;
  if (/new|release|جديد/.test(key)) return Sparkles;
  return Package;
}

export function HomeHero({
  slides,
  categories = [],
  highlightProducts = [],
  dealProduct = null,
  featuredCoupon = null,
  locale,
  shopLabel,
}: HomeHeroProps) {
  const t = useTranslations("Home");
  const reduce = useReducedMotion();
  const valid = useMemo(() => slides.filter((s) => s.image_url || s.image), [slides]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  const rtl = locale === "ar";
  const n = valid.length;
  const sidebarCats = (categories ?? []).slice(0, SIDEBAR_LIMIT);
  const picks = (highlightProducts ?? []).slice(0, 2);

  const goTo = (newIdx: number) => {
    if (!n || newIdx === idxRef.current) return;
    setIdx(newIdx);
  };

  useEffect(() => {
    if (n < 2 || paused || reduce) return;
    const id = window.setInterval(() => {
      setIdx((p) => (p + 1) % n);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [n, idx, paused, reduce]);

  if (n === 0 && sidebarCats.length === 0) return null;

  const active = valid[idx] ?? null;
  const copy = active ? slideCopy(active, locale) : null;
  const cover = active ? slideCover(active) : null;

  return (
    <section className="relative border-b border-white/6 bg-background pt-3 pb-4 sm:pt-4 sm:pb-5">
      <div className="layout-page layout-gutter-x">
        <div
          className={cn(
            "grid items-stretch gap-3",
            sidebarCats.length > 0 &&
              "lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]"
          )}
        >
          {sidebarCats.length > 0 && (
            <>
              <nav
                aria-label={t("categoriesTitle")}
                className="relative hidden overflow-hidden rounded-xl border border-white/10 bg-[#16181a] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.8)] lg:flex lg:flex-col"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary via-[#d12f27] to-transparent" />
                <div className="border-b border-white/8 px-4 py-3">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    {t("categoriesTitle")}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col py-1">
                  {sidebarCats.map((cat) => {
                    const name = rtl ? cat.name_ar || cat.name : cat.name;
                    const Icon = categoryLucideIcon(cat);
                    const thumb = cat.image_url || cat.image;
                    return (
                      <li key={cat.id} className="border-b border-white/[0.04] last:border-b-0">
                        <Link
                          href={`/products?category_slug=${cat.slug}`}
                          className="group flex min-h-11 items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium text-white/85 transition-colors hover:bg-primary/15 hover:text-white"
                        >
                          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#0f1112] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt=""
                                width={32}
                                height={32}
                                className="size-full object-contain p-1 opacity-90 transition-opacity group-hover:opacity-100"
                                unoptimized
                              />
                            ) : (
                              <Icon
                                className="size-4 text-white/55 transition-colors group-hover:text-[#ff8a8e]"
                                strokeWidth={1.75}
                              />
                            )}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 text-[13px] leading-snug line-clamp-2",
                              rtl && "font-cairo"
                            )}
                            title={name}
                          >
                            {name}
                          </span>
                          <ChevronRight
                            className={cn(
                              "size-3.5 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-[#ff8a8e]",
                              rtl && "rotate-180 group-hover:-translate-x-0.5"
                            )}
                            strokeWidth={2}
                          />
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <Link
                      href="/categories"
                      className="group flex min-h-11 items-center gap-3 px-3.5 py-2.5 text-[13px] font-semibold text-white/90 transition-colors hover:bg-primary/20"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                        <Grid2X2 className="size-4" strokeWidth={2} />
                      </span>
                      <span className={cn("min-w-0 flex-1", rtl && "font-cairo")}>{t("more")}</span>
                      <ChevronRight
                        className={cn("size-3.5 shrink-0 text-white/40", rtl && "rotate-180")}
                      />
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 lg:hidden">
                {sidebarCats.slice(0, 8).map((cat) => {
                  const name = rtl ? cat.name_ar || cat.name : cat.name;
                  const Icon = categoryLucideIcon(cat);
                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category_slug=${cat.slug}`}
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-[#16181a] px-3 text-[12px] font-semibold text-white/80 whitespace-nowrap transition-colors hover:border-primary/45 hover:text-white",
                        rtl && "font-cairo"
                      )}
                    >
                      <Icon className="size-3.5 text-[#ff8a8e]" strokeWidth={1.75} />
                      {name}
                    </Link>
                  );
                })}
                <Link
                  href="/categories"
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center rounded-full border border-primary/45 bg-primary/20 px-3.5 text-[12px] font-semibold text-white whitespace-nowrap",
                    rtl && "font-cairo"
                  )}
                >
                  {t("more")}
                </Link>
              </div>
            </>
          )}

          <div className="flex min-w-0 flex-col gap-3">
            {active && copy && (
              <div
                className="group/hero relative overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d] shadow-[0_16px_48px_-28px_rgba(0,0,0,0.85)]"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="relative min-h-[13rem] sm:min-h-[17rem] lg:min-h-[18.5rem] xl:min-h-[20.5rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active.id}
                      initial={reduce ? false : { opacity: 0.6, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                      className="absolute inset-0"
                    >
                      {cover ? (
                        <Image
                          src={cover}
                          alt={copy.title || ""}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 75vw"
                          className="object-cover object-center"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#141516]" />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/75 via-black/25 to-black/10 rtl:bg-linear-to-l" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/50 to-transparent" />

                  <div className="relative z-10 flex h-full min-h-[13rem] flex-col justify-end p-5 sm:min-h-[17rem] sm:p-7 lg:min-h-[18.5rem] xl:min-h-[20.5rem]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={active.id + "-copy"}
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                        className="max-w-lg"
                      >
                        {copy.title && (
                          <h1
                            className={cn(
                              "line-clamp-2 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]",
                              "text-[clamp(1.75rem,4vw,3.1rem)] leading-[0.94]",
                              !rtl && "font-letterman uppercase tracking-wide",
                              rtl && "font-cairo font-bold"
                            )}
                          >
                            {copy.title}
                          </h1>
                        )}
                        {copy.subtitle && (
                          <p
                            className={cn(
                              "mt-2 line-clamp-2 max-w-[38ch] text-[13px] leading-relaxed text-white/75 sm:text-[14px]",
                              rtl && "font-cairo"
                            )}
                          >
                            {copy.subtitle}
                          </p>
                        )}
                        <Link
                          href={copy.href}
                          className={cn(
                            "mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-[13px] font-bold text-white shadow-[0_8px_24px_-10px_rgba(209,47,39,0.9)] transition-colors hover:bg-[#d12f27]",
                            rtl && "font-cairo"
                          )}
                        >
                          {copy.btn || shopLabel}
                          <ChevronRight
                            className={cn("size-4", rtl && "rotate-180")}
                            strokeWidth={2.25}
                          />
                        </Link>
                      </motion.div>
                    </AnimatePresence>

                    {n > 1 && (
                      <div className="absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5">
                        {valid.map((slide, i) => (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={t("slideOf", { current: i + 1, total: n })}
                            aria-current={i === idx}
                            onClick={() => goTo(i)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-200",
                              i === idx
                                ? "w-5 bg-primary"
                                : "w-1.5 bg-white/40 hover:bg-white/70"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((product) => (
                <HeroProductCard key={product.id} product={product} locale={locale} />
              ))}
              <HeroDealCard
                product={dealProduct}
                coupon={featuredCoupon}
                locale={locale}
                shopLabel={shopLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductMedia({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative aspect-square w-[6.75rem] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#1e2023] sm:w-[7.5rem]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.08), transparent 62%)",
        }}
        aria-hidden
      />
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="120px"
          className="object-contain p-2.5 transition-transform duration-300 group-hover/card:scale-[1.04]"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-[#1e2023]" />
      )}
    </div>
  );
}

function HeroProductCard({ product, locale }: { product: Product; locale: string }) {
  const t = useTranslations("Home");
  const rtl = locale === "ar";
  const name = rtl ? product.name_ar || product.name : product.name;
  const img = productThumb(product);
  const { finalPrice, origPrice, sym } = productPrices(product);
  const brand = product.brand
    ? rtl
      ? product.brand.name_ar || product.brand.name
      : product.brand.name
    : null;

  const { setCount, getItemRef, upsertItemRef } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const itemKey = buildCartItemKey({ product: product.id, variation: null, combination: null });
  const needsVariations = product.inventory_mode === "TRACK_VARIATIONS";
  const outOfStock = product.inventory_mode === "TRACK" && (product.product_stock ?? 0) <= 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (needsVariations || outOfStock) return;

    const existing = getItemRef(itemKey);
    if (existing) {
      const newQty = existing.quantity + 1;
      startTransition(async () => {
        const res = await updateCartItemAction(existing.itemId, newQty);
        if (res.status === "success") {
          upsertItemRef(itemKey, { itemId: existing.itemId, quantity: newQty });
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      });
      return;
    }

    startTransition(async () => {
      const res = await addToCartAction({ product: product.id, quantity: 1 });
      if (res.status === "success") {
        if (res.data?.count !== undefined) setCount(res.data.count);
        if (res.data?.itemId) {
          upsertItemRef(itemKey, { itemId: res.data.itemId, quantity: res.data.itemQuantity ?? 1 });
        }
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#17191b] shadow-[0_10px_32px_-22px_rgba(0,0,0,0.85)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-center justify-between gap-2 border-b border-white/8 bg-[#1c1e21] px-3.5 py-2.5">
        <div className="min-w-0">
          <p className={cn("truncate text-[11px] font-bold tracking-[0.14em] text-[#ff8a8e] uppercase", rtl && "font-cairo tracking-normal")}>
            {brand || t("featuredPick")}
          </p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            "shrink-0 text-[11px] font-semibold text-white/45 transition-colors hover:text-white",
            rtl && "font-cairo"
          )}
        >
          {t("seeAll")}
          <ChevronRight className={cn("ms-0.5 inline size-3", rtl && "rotate-180")} />
        </Link>
      </div>

      <Link href={`/products/${product.slug}`} className="flex flex-1 gap-3 p-3.5">
        <ProductMedia src={img} alt={name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className={cn(
              "line-clamp-3 text-[13px] leading-snug font-medium text-white/90",
              rtl && "font-cairo"
            )}
          >
            {name}
          </p>
          <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-3">
            {finalPrice && (
              <span className={cn("text-[1.2rem] font-bold tabular-nums text-white", rtl && "font-cairo")}>
                {sym}
                {finalPrice}
              </span>
            )}
            {origPrice && (
              <span className="text-[12px] tabular-nums text-white/35 line-through">
                {sym}
                {origPrice}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-auto flex gap-2 border-t border-white/8 p-3">
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            "inline-flex h-9 flex-1 items-center justify-center rounded-full border border-white/14 text-[12px] font-semibold text-white/75 transition-colors hover:border-white/30 hover:bg-white/4 hover:text-white",
            rtl && "font-cairo"
          )}
        >
          {t("viewProduct")}
        </Link>
        {needsVariations ? (
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[12px] font-bold text-white transition-colors hover:bg-[#d12f27]",
              rtl && "font-cairo"
            )}
          >
            <ShoppingCart className="size-3.5" strokeWidth={2} />
            {t("addToCart")}
          </Link>
        ) : (
          <button
            type="button"
            disabled={outOfStock || isPending}
            onClick={handleAddToCart}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[12px] font-bold text-white transition-colors hover:bg-[#d12f27] disabled:cursor-not-allowed disabled:opacity-45",
              rtl && "font-cairo"
            )}
          >
            <ShoppingCart className="size-3.5" strokeWidth={2} />
            {outOfStock ? t("outOfStock") : t("addToCart")}
          </button>
        )}
      </div>
    </article>
  );
}

function HeroDealCard({
  product,
  coupon,
  locale,
  shopLabel,
}: {
  product: Product | null;
  coupon: FeaturedCoupon | null;
  locale: string;
  shopLabel: string;
}) {
  const t = useTranslations("Home");
  const rtl = locale === "ar";

  if (product) {
    const name = rtl ? product.name_ar || product.name : product.name;
    const img = productThumb(product);
    const { finalPrice, origPrice, sym } = productPrices(product);

    return (
      <article className="group/card flex h-full flex-col overflow-hidden rounded-xl border border-primary/30 bg-[#17191b] shadow-[0_10px_32px_-22px_rgba(158,29,32,0.45)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/55 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between gap-2 border-b border-primary/25 bg-linear-to-r from-[#3a1518] to-[#1c1e21] px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-deal text-[#1a1c1e] shadow-[0_0_12px_rgba(255,122,26,0.45)]">
              <Zap className="size-3.5" fill="currentColor" strokeWidth={0} />
            </span>
            <p className={cn("truncate text-[13px] font-bold text-white", rtl && "font-cairo")}>
              {t("deal")}
            </p>
          </div>
          <Link
            href="/products?has_discount=true"
            className={cn(
              "shrink-0 text-[11px] font-semibold text-white/45 transition-colors hover:text-white",
              rtl && "font-cairo"
            )}
          >
            {t("seeAll")}
            <ChevronRight className={cn("ms-0.5 inline size-3", rtl && "rotate-180")} />
          </Link>
        </div>

        <Link href={`/products/${product.slug}`} className="flex flex-1 gap-3 p-3.5">
          <ProductMedia src={img} alt={name} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p
              className={cn(
                "line-clamp-3 text-[13px] leading-snug font-medium text-white/90",
                rtl && "font-cairo"
              )}
            >
              {name}
            </p>
            <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-3">
              {finalPrice && (
                <span className={cn("text-[1.35rem] font-bold tabular-nums text-deal", rtl && "font-cairo")}>
                  {sym}
                  {finalPrice}
                </span>
              )}
              {origPrice && (
                <span className="text-[12px] tabular-nums text-white/35 line-through">
                  {sym}
                  {origPrice}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="border-t border-white/8 p-3">
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[12px] font-bold text-white transition-colors hover:bg-[#d12f27]",
              rtl && "font-cairo"
            )}
          >
            {shopLabel}
            <ChevronRight className={cn("size-3.5", rtl && "rotate-180")} />
          </Link>
        </div>
      </article>
    );
  }

  if (coupon) {
    const valueLabel =
      coupon.discount_type === "PERCENTAGE"
        ? `${coupon.discount_value}%`
        : coupon.discount_value;

    return (
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-primary/30 bg-[#17191b] sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 border-b border-primary/25 bg-linear-to-r from-[#3a1518] to-[#1c1e21] px-3.5 py-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-deal text-[#1a1c1e]">
            <Zap className="size-3.5" fill="currentColor" strokeWidth={0} />
          </span>
          <p className={cn("text-[13px] font-bold text-white", rtl && "font-cairo")}>{t("deal")}</p>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3 p-4">
          <p className={cn("text-[12px] text-white/55", rtl && "font-cairo")}>{t("couponDeal")}</p>
          <p className={cn("text-[1.75rem] font-bold text-deal", rtl && "font-cairo")}>
            {valueLabel} {t("off")}
          </p>
          <p className="font-mono text-[13px] tracking-wide text-[#ff8a8e]">{coupon.code}</p>
          <Link
            href="/products"
            className={cn(
              "mt-1 inline-flex h-10 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white hover:bg-[#d12f27]",
              rtl && "font-cairo"
            )}
          >
            {shopLabel}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-primary/30 bg-[#17191b] sm:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-2 border-b border-primary/25 bg-linear-to-r from-[#3a1518] to-[#1c1e21] px-3.5 py-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-deal text-[#1a1c1e]">
          <Zap className="size-3.5" fill="currentColor" strokeWidth={0} />
        </span>
        <p className={cn("text-[13px] font-bold text-white", rtl && "font-cairo")}>{t("deal")}</p>
      </div>
      <div className="flex flex-1 flex-col items-start justify-center gap-3 p-4">
        <p className={cn("text-[14px] leading-relaxed text-white/70", rtl && "font-cairo")}>
          {t("dealFallback")}
        </p>
        <Link
          href="/products"
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-[13px] font-bold text-white hover:bg-[#d12f27]",
            rtl && "font-cairo"
          )}
        >
          {shopLabel}
          <ChevronRight className={cn("size-4", rtl && "rotate-180")} />
        </Link>
      </div>
    </article>
  );
}
