"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Clock, Hash, FolderOpen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/useDebounce";
import { searchProducts, searchProductsByTag } from "@/features/products";
import { searchCategories } from "@/features/categories";
import type { Product } from "@/types";
import type { Category } from "@/types/category";

// ─── Recent searches (localStorage) ──────────────────────────────────────────

const RECENT_KEY = "josouk_recent_searches";
const MAX_RECENT = 6;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { setRecent(readRecent()); }, []);

  const add = useCallback((q: string) => {
    const t = q.trim();
    if (!t) return;
    setRecent(prev => {
      const next = [t, ...prev.filter(s => s !== t)].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const remove = useCallback((q: string) => {
    setRecent(prev => {
      const next = prev.filter(s => s !== q);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  }, []);

  return { recent, add, remove, clearAll };
}

// ─── Smart search state ───────────────────────────────────────────────────────

export interface SmartSearchState {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  hasSearched: boolean;
  isTagSearch: boolean;
  recent: string[];
  addRecent: (q: string) => void;
  removeRecent: (q: string) => void;
  clearRecent: () => void;
  reset: () => void;
}

export function useSmartSearch(): SmartSearchState {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { recent, add: addRecent, remove: removeRecent, clearAll: clearRecent } = useRecentSearches();

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const raw = debouncedQuery.trim();
    if (!raw) {
      setProducts([]);
      setCategories([]);
      setHasSearched(false);
      return;
    }

    const isTag = raw.startsWith("#");
    const searchQ = isTag ? raw.slice(1).trim() : raw;

    if (!searchQ) {
      setProducts([]);
      setCategories([]);
      setHasSearched(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      if (cancelled) return;
      setIsLoading(true);
      setHasSearched(true);
      try {
        if (isTag) {
          const [cats, prods] = await Promise.all([
            searchCategories(searchQ),
            searchProductsByTag(searchQ),
          ]);
          if (!cancelled) { setCategories(cats); setProducts(prods); }
        } else {
          // Normal search: products only
          const prods = await searchProducts(searchQ);
          if (!cancelled) { setProducts(prods); setCategories([]); }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const reset = () => {
    setQuery("");
    setProducts([]);
    setCategories([]);
    setHasSearched(false);
    setIsLoading(false);
  };

  const activeRaw = debouncedQuery.trim();
  const isActive = activeRaw.length > 0;

  return {
    query,
    setQuery,
    products: isActive ? products : [],
    categories: isActive ? categories : [],
    isLoading: isActive ? isLoading : false,
    hasSearched: isActive ? hasSearched : false,
    isTagSearch: query.trim().startsWith("#"),
    recent,
    addRecent,
    removeRecent,
    clearRecent,
    reset,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(product: Product): string {
  const price =
    product.has_discount && product.discount_price ? product.discount_price : product.base_price;
  if (!price) return "";
  const symbol = product.currency_info?.symbol || product.currency_info?.code || "";
  return `${price} ${symbol}`.trim();
}

function productTitle(p: Product, locale: string) {
  return locale === "ar" && p.name_ar ? p.name_ar : p.name;
}

function categoryName(c: Category, locale: string) {
  return locale === "ar" && c.name_ar ? c.name_ar : c.name;
}

// Highlight matched text in a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/30 text-foreground not-italic font-semibold rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── UI sub-components ────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-3 h-px bg-primary/6" />;
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-px p-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/7" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-3/5 rounded-full bg-primary/8" />
            <div className="h-2 w-2/5 rounded-full bg-primary/5" />
          </div>
          <div className="h-3 w-14 rounded-full bg-primary/6" />
        </div>
      ))}
    </div>
  );
}

interface RecentProps {
  recent: string[];
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onClearAll: () => void;
  t: ReturnType<typeof useTranslations<"Header.searchUi">>;
}

function RecentSearchesList({ recent, onSelect, onRemove, onClearAll, t }: RecentProps) {
  if (!recent.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-1 pt-3">
        <span className="font-chillax text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/40">
          {t("recent")}
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="font-chillax text-[10px] font-medium text-foreground/40 transition-colors hover:text-foreground"
        >
          {t("clearAll")}
        </button>
      </div>
      <ul className="px-2 pb-1">
        {recent.map((q) => (
          <li key={q} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(q)}
              className="flex flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-primary/5"
            >
              <Clock size={13} className="shrink-0 text-foreground/35" />
              <span className="font-chillax text-sm text-foreground/70">{q}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(q)}
              aria-label="Remove"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground/25 transition-colors hover:bg-primary/8 hover:text-foreground"
            >
              <X size={11} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CategoryCardsProps {
  categories: Category[];
  tagQuery: string;
  locale: string;
  onSelect: () => void;
  t: ReturnType<typeof useTranslations<"Header.searchUi">>;
}

function CategoryCards({ categories, tagQuery, locale, onSelect }: CategoryCardsProps) {
  if (!categories.length) return null;
  return (
    <div className="px-2 pb-1 pt-2">
      <div className="mb-1.5 flex items-center gap-2 px-2">
        <div className="h-3 w-0.5 rounded-full bg-primary" />
        <span className="font-chillax text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">
          Browse category
        </span>
      </div>
      <ul className="space-y-px">
        {categories.map((cat) => {
          const img = cat.image_url || cat.image;
          const name = categoryName(cat, locale);
          return (
            <li key={cat.id}>
              <Link
                href={`/products?category_slug=${cat.slug}`}
                onClick={onSelect}
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-primary/5"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-primary/7 ring-1 ring-primary/8">
                  {img ? (
                    <Image src={img} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FolderOpen size={16} className="text-foreground/35" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-chillax text-sm font-semibold text-foreground">
                    <Highlight text={name} query={tagQuery} />
                  </p>
                  {cat.description && (
                    <p className="mt-0.5 truncate font-chillax text-[11px] text-foreground/40">{cat.description}</p>
                  )}
                </div>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/25">
                  <Search size={11} className="text-foreground/40" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ProductsListProps {
  products: Product[];
  query: string;
  locale: string;
  onSelect: () => void;
  t: ReturnType<typeof useTranslations<"Header.searchUi">>;
  viewAllHref?: string;
}

function ProductsList({ products, query, locale, onSelect, t, viewAllHref }: ProductsListProps) {
  if (!products.length) return null;
  const q = encodeURIComponent(query.trim());
  const allHref = viewAllHref ?? `/products?search=${q}`;

  return (
    <div className="pb-2">
      <div className="mb-1 flex items-center gap-2 px-3 pt-2">
        <div className="h-3 w-0.5 rounded-full bg-primary" />
        <span className="font-chillax text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">
          {t("products")}
        </span>
      </div>
      <ul className="space-y-px px-2">
        {products.map((product) => {
          const title = productTitle(product, locale);
          const price = formatPrice(product);
          const catLabel = product.categories?.length > 0
            ? product.categories.map(c => locale === "ar" && c.name_ar ? c.name_ar : c.name).join(" · ")
            : null;
          return (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                onClick={onSelect}
                className="group relative flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-primary/5"
              >
                {/* Left accent bar on hover */}
                <span className="absolute inset-s-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#000000] bg-[#000000]">
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={title}
                      fill
                      sizes="48px"
                      className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Search size={14} className="text-foreground/20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-chillax text-[13px] font-semibold leading-snug text-foreground">
                    <Highlight text={title} query={query} />
                  </p>
                  {catLabel && (
                    <p className="mt-0.5 truncate font-chillax text-[11px] text-foreground/40">{catLabel}</p>
                  )}
                </div>

                {/* Price */}
                {price && (
                  <div className="flex shrink-0 flex-col items-end">
                    {product.has_discount && product.discount_price && (
                      <span className="font-chillax text-[10px] text-foreground/35 line-through" dir="ltr">
                        {`${product.base_price} ${product.currency_info?.symbol ?? ""}`}
                      </span>
                    )}
                    <span className="font-chillax text-sm tracking-wide text-foreground" dir="ltr">{price}</span>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* View all button */}
      <div className="mx-2 mt-2">
        <Link
          href={allHref}
          onClick={onSelect}
          className="group flex items-center justify-center gap-2 rounded-xl bg-primary/5 py-2.5 font-chillax text-xs font-semibold text-foreground/60 transition-all duration-150 hover:bg-primary hover:text-white"
        >
          <Search size={12} className="transition-transform group-hover:scale-110" />
          {t("viewAll")}
        </Link>
      </div>
    </div>
  );
}

// ─── Main results panel ───────────────────────────────────────────────────────

interface ResultsPanelProps {
  search: SmartSearchState;
  onSelect: (addToRecent?: boolean) => void;
}

function ResultsPanel({ search, onSelect }: ResultsPanelProps) {
  const t = useTranslations("Header.searchUi");
  const locale = useLocale();
  const trimmed = search.query.trim();
  const isTag = search.isTagSearch;
  const tagQuery = isTag ? trimmed.slice(1).trim() : "";

  const handleSelect = (addToRecent = true) => {
    if (addToRecent && trimmed && !trimmed.startsWith("#")) search.addRecent(trimmed);
    onSelect();
  };

  // ── Empty state: show recent searches + hint ──
  if (!trimmed) {
    const hasRecent = search.recent.length > 0;
    return (
      <div className="py-1">
        {hasRecent ? (
          <>
            <RecentSearchesList
              recent={search.recent}
              onSelect={(q) => { search.setQuery(q); }}
              onRemove={search.removeRecent}
              onClearAll={search.clearRecent}
              t={t}
            />
            <Divider />
          </>
        ) : null}
        <div className="flex items-center gap-2 px-4 py-3">
          <Hash size={13} className="shrink-0 text-primary" />
          <span className="font-chillax text-xs text-foreground/45">{t("categoryTip")}</span>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (search.isLoading && !search.hasSearched) {
    return <LoadingSkeleton rows={4} />;
  }

  // ── Tag search (#category) ──
  if (isTag) {
    if (search.isLoading) return <LoadingSkeleton rows={4} />;
    const hasTagCategories = search.categories.length > 0;
    const hasTagProducts = search.products.length > 0;
    const firstCatSlug = search.categories[0]?.slug ?? "";

    if (!hasTagCategories && !hasTagProducts && search.hasSearched) {
      return (
        <div className="px-4 py-10 text-center">
          <FolderOpen className="mx-auto mb-3 text-foreground/15" size={32} />
          <p className="font-chillax text-sm font-medium text-foreground/50">
            {t("noResults", { query: tagQuery })}
          </p>
          <Link
            href="/categories"
            onClick={() => handleSelect(false)}
            className="mt-3 inline-block font-chillax text-xs text-foreground/50 underline underline-offset-2 hover:text-foreground"
          >
            {t("exploreCategories")}
          </Link>
        </div>
      );
    }

    return (
      <div>
        {hasTagProducts && (
          <ProductsList
            products={search.products}
            query={tagQuery}
            locale={locale}
            onSelect={() => handleSelect(false)}
            t={t}
            viewAllHref={firstCatSlug ? `/products?category_slug=${firstCatSlug}` : "/products"}
          />
        )}
        {hasTagCategories && (
          <>
            {hasTagProducts && <Divider />}
            <CategoryCards
              categories={search.categories}
              tagQuery={tagQuery}
              locale={locale}
              onSelect={() => handleSelect(false)}
              t={t}
            />
          </>
        )}
      </div>
    );
  }

  // ── Normal product search ──
  if (search.isLoading && !search.products.length) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!search.products.length && search.hasSearched && !search.isLoading) {
    return (
      <div className="px-4 py-10 text-center">
        <Search className="mx-auto mb-3 text-foreground/15" size={32} />
        <p className="font-chillax text-sm font-medium text-foreground/50">
          {t("noResults", { query: trimmed })}
        </p>
        <p className="mt-1 font-chillax text-xs text-foreground/35">{t("tryCategory")}</p>
      </div>
    );
  }

  return (
    <ProductsList
      products={search.products}
      query={trimmed}
      locale={locale}
      onSelect={() => handleSelect(true)}
      t={t}
    />
  );
}

// ─── Desktop search ───────────────────────────────────────────────────────────

interface DesktopSearchProps {
  search: SmartSearchState;
}

function DesktopHeaderSearch({ search }: DesktopSearchProps) {
  const t = useTranslations("Header");
  const tUi = useTranslations("Header.searchUi");
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showPanel = isOpen && (search.query.trim().length > 0 || search.recent.length > 0);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { search.reset(); setIsOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, search]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        search.reset();
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [isOpen, search]);

  const goSearch = () => {
    const q = search.query.trim();
    if (!q) return;
    if (q.startsWith("#")) {
      router.push(`/categories`);
    } else {
      search.addRecent(q);
      router.push(`/products?search=${encodeURIComponent(q)}`);
    }
    search.reset();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goSearch();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        className="flex h-10 w-full items-stretch overflow-hidden bg-white"
        onClick={() => setIsOpen(true)}
        onSubmit={(e) => {
          e.preventDefault();
          goSearch();
        }}
      >
        <input
          ref={inputRef}
          type="search"
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tUi("placeholder")}
          autoComplete="off"
          dir={locale === "ar" ? "rtl" : "ltr"}
          aria-busy={search.isLoading}
          aria-label={t("search")}
          className="min-w-0 flex-1 bg-transparent px-3 font-chillax text-[13px] text-[#000000] placeholder:text-[#000000]/40 focus:outline-none"
        />
        {search.isLoading && <Loader2 size={14} className="my-auto shrink-0 animate-spin text-[#000000]/40" />}
        {(search.query || isOpen) && (
          <button
            type="button"
            onClick={() => { search.reset(); setIsOpen(false); }}
            aria-label={tUi("close")}
            className="shrink-0 px-2 text-[#000000]/40 transition-colors hover:text-[#000000]"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          aria-label={t("search")}
          className="flex h-full w-11 shrink-0 items-center justify-center bg-primary text-white transition-colors duration-150 hover:bg-[var(--blue-hover)]"
        >
          <Search size={18} strokeWidth={2.25} />
        </button>
      </form>

      {showPanel && (
        <div className="dark scrollbar-thin absolute start-0 top-[calc(100%+8px)] z-50 max-h-[26rem] w-full overflow-y-auto rounded-lg border border-white/10 bg-[#000000] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-top-1 duration-150">
          <ResultsPanel
            search={search}
            onSelect={() => { search.reset(); setIsOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Mobile overlay ───────────────────────────────────────────────────────────

interface MobileOverlayProps {
  search: SmartSearchState;
  isOpen: boolean;
  onClose: () => void;
}

function MobileHeaderSearchOverlay({ search, isOpen, onClose }: MobileOverlayProps) {
  const tUi = useTranslations("Header.searchUi");
  const locale = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { search.reset(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, search]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = search.query.trim();
      if (!q) return;
      if (!q.startsWith("#")) search.addRecent(q);
      router.push(q.startsWith("#")
        ? `/categories`
        : `/products?search=${encodeURIComponent(q)}`
      );
      search.reset();
      onClose();
    }
  };

  const showPanel = search.query.trim().length > 0 || search.recent.length > 0;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        aria-label={tUi("close")}
        className="absolute inset-0 bg-black/40"
        onClick={() => { search.reset(); onClose(); }}
      />
      <div
        className="relative border-b border-white/10 bg-store-nav px-4 pb-3 shadow-lg"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        {/* Input */}
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <form
            className="flex h-10 min-w-0 flex-1 items-stretch overflow-hidden bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              const q = search.query.trim();
              if (!q) return;
              if (!q.startsWith("#")) search.addRecent(q);
              router.push(q.startsWith("#") ? `/categories` : `/products?search=${encodeURIComponent(q)}`);
              search.reset();
              onClose();
            }}
          >
            <input
              ref={inputRef}
              type="search"
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tUi("placeholder")}
              autoComplete="off"
              dir={locale === "ar" ? "rtl" : "ltr"}
              className="min-w-0 flex-1 bg-transparent px-3 font-chillax text-sm text-[#000000] placeholder:text-[#000000]/40 focus:outline-none"
            />
            {search.isLoading && <Loader2 size={13} className="my-auto me-2 shrink-0 animate-spin text-[#000000]/40" />}
            <button
              type="submit"
              aria-label={tUi("close")}
              className="flex h-full w-11 shrink-0 items-center justify-center bg-primary text-white"
            >
              <Search size={18} strokeWidth={2.25} />
            </button>
          </form>
          <button
            type="button"
            onClick={() => { search.reset(); onClose(); }}
            className="shrink-0 p-2 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            aria-label={tUi("close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Panel */}
        {showPanel && (
          <div className="dark scrollbar-thin mx-auto mt-2 max-h-[min(26rem,calc(100svh-9rem))] max-w-xl overflow-y-auto rounded-lg border border-white/10 bg-[#000000] shadow-xl">
            <ResultsPanel
              search={search}
              onSelect={() => { search.reset(); onClose(); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function HeaderSearch({
  variant = "all",
}: {
  variant?: "all" | "desktop" | "mobile";
}) {
  const search = useSmartSearch();
  const t = useTranslations("Header");
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktop = (
    <div className="hidden min-w-0 flex-1 xl:block xl:max-w-2xl 2xl:max-w-3xl">
      <DesktopHeaderSearch search={search} />
    </div>
  );

  const mobile = (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label={t("search")}
        className="inline-flex size-9 shrink-0 items-center justify-center text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
      >
        <Search className="size-5 shrink-0" strokeWidth={1.75} />
      </button>
      <MobileHeaderSearchOverlay
        search={search}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </div>
  );

  if (variant === "desktop") return desktop;
  if (variant === "mobile") return mobile;

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
