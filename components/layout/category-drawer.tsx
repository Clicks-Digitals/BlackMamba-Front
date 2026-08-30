"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, ChevronDown, X, LayoutGrid } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { buildCategoryTree, cn, type CategoryWithChildren } from "@/lib/utils";
import { useCategoryDrawer } from "@/stores/category-drawer-store";
import type { Category } from "@/types/category";

/* ─────────────────────────────────────────────────────────────────────────────
   Figma node 49:530 — Category sidebar
   Header: ink surface, "CATEGORIES" Chillax white centered
   Body: white, "ALL CATEGORIES" at top, then grouped parent → children list
───────────────────────────────────────────────────────────────────────────── */

type Props = { categories: Category[]; locale: string };

function CategorySubGroup({
  category, locale, onClose, depth,
}: {
  category: CategoryWithChildren;
  locale: string;
  onClose: () => void;
  depth: number;
}) {
  const rtl  = locale === "ar";
  const name = rtl ? category.name_ar || category.name : category.name;
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <li>
      <div className="flex items-center justify-between">
        <DrawerClose asChild>
          <Link
            href={`/products?category_slug=${category.slug}`}
            className="flex flex-1 items-center justify-between px-3 py-2.5 text-[15px] text-white/80 transition hover:text-white"
            onClick={onClose}
          >
            <span>{name}</span>
            {!hasChildren && <ChevronRight className="size-4 shrink-0 text-white/30 rtl:rotate-180" />}
          </Link>
        </DrawerClose>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-white/60 transition duration-200 hover:bg-white/8 hover:text-white"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4 rtl:rotate-180" />}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <ul className="flex flex-col ps-4">
          {category.children.map((child) => (
            <CategorySubGroup key={child.id} category={child} locale={locale} onClose={onClose} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function CategoryGroup({
  category, locale, onClose,
}: {
  category: CategoryWithChildren;
  locale: string;
  onClose: () => void;
}) {
  const rtl  = locale === "ar";
  const name = rtl ? category.name_ar || category.name : category.name;
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <div className="border-b border-white/8">
      <div className="flex items-center justify-between px-5 py-4">
        <DrawerClose asChild>
          <Link
            href={`/products?category_slug=${category.slug}`}
            className={cn(
              "font-chillax text-[15px] font-semibold uppercase tracking-wide text-white hover:text-white/80",
              rtl && "font-cairo font-bold text-[15px]"
            )}
            onClick={onClose}
          >
            {name}
          </Link>
        </DrawerClose>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex size-8 items-center justify-center rounded-md text-white/60 transition duration-200 hover:bg-white/8 hover:text-white"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4 rtl:rotate-180" />}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <ul className="flex flex-col pb-2 ps-8">
          {category.children.map((child) => (
            <CategorySubGroup key={child.id} category={child} locale={locale} onClose={onClose} depth={1} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function CategoryDrawer({ categories, locale }: Props) {
  const t      = useTranslations("Header");
  const rtl    = locale === "ar";
  const open   = useCategoryDrawer((s) => s.open);
  const setOpen = useCategoryDrawer((s) => s.setOpen);

  const tree     = buildCategoryTree(categories);
  const flatList = tree.length === 0 ? categories : [];
  const close    = () => setOpen(false);

  return (
    <Drawer direction={rtl ? "right" : "left"} open={open} onOpenChange={setOpen}>
      <DrawerContent className="flex max-h-svh w-[min(340px,92vw)] flex-col overflow-hidden bg-[#161718] p-0">

        <div className="relative flex items-center justify-center bg-primary px-4 py-3.5">
          <DrawerTitle
            className={cn(
              "text-center text-base uppercase text-white",
              !rtl && "font-chillax tracking-widest",
              rtl  && "font-cairo font-bold text-[15px]"
            )}
          >
            {t("allCategories")}
          </DrawerTitle>
          <DrawerClose className="absolute inset-e-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-md text-white/70 transition duration-200 hover:bg-white/15 hover:text-white">
            <X className="size-5" />
          </DrawerClose>
        </div>

        <div className="custom-no-scrollbar flex-1 overflow-y-auto overscroll-contain">
          <DrawerClose asChild>
            <Link
              href="/products"
              className="flex items-center gap-3 border-b border-white/8 px-5 py-4 transition hover:bg-white/5"
              onClick={close}
            >
              <LayoutGrid className="size-5 shrink-0 text-foreground" />
              <span
                className={cn(
                  "text-[15px] font-chillax font-semibold uppercase tracking-wide text-white",
                  rtl && "font-cairo font-bold text-[15px]"
                )}
              >
                {t("allCategories")}
              </span>
            </Link>
          </DrawerClose>

          {tree.map((cat) => (
            <CategoryGroup key={cat.id} category={cat} locale={locale} onClose={close} />
          ))}

          {flatList.map((cat) => {
            const name = rtl ? cat.name_ar || cat.name : cat.name;
            return (
              <div key={cat.id} className="border-b border-white/8">
                <DrawerClose asChild>
                  <Link
                    href={`/products?category_slug=${cat.slug}`}
                    className="flex items-center justify-between px-5 py-4 transition hover:bg-white/5"
                    onClick={close}
                  >
                    <span
                      className={cn(
                        "text-[15px] font-chillax font-semibold uppercase tracking-wide text-white",
                        rtl && "font-cairo font-bold text-[15px]"
                      )}
                    >
                      {name}
                    </span>
                    <ChevronRight className="size-4 text-white/30 rtl:rotate-180" />
                  </Link>
                </DrawerClose>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function CategoryDrawerOpenButton({
  className, label, children,
}: {
  className?: string;
  label: string;
  children?: ReactNode;
}) {
  const setOpen = useCategoryDrawer((s) => s.setOpen);
  return (
    <button type="button" onClick={() => setOpen(true)} aria-label={label} className={className}>
      <LayoutGrid className="size-3.5 shrink-0" strokeWidth={2} />
      {children}
    </button>
  );
}
