"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { addSharedCartAction, type SharedCart } from "@/features/cart/actions/share";
import { partsLabel } from "@/features/pc-builder/lib/cart-line";
import { cn, formatPrice, productHref } from "@/lib/utils";

/** A cart someone shared: what is in it, and one button to take it all. */
export function SharedCartView({ shared }: { shared: SharedCart }) {
  const locale = useLocale();
  const ar = locale === "ar";
  const router = useRouter();
  const setCount = useCartStore((s) => s.setCount);
  const [isAdding, startAdd] = useTransition();
  const currency = shared.items.find((i) => i.product_details)?.product_details?.currency_info ?? null;
  const price = (amount: string | number) => formatPrice(amount, currency, locale);

  function addAll() {
    startAdd(async () => {
      const res = await addSharedCartAction(shared.slug);
      if (res.status !== "success" || !res.data) {
        toast.error(res.message);
        return;
      }
      setCount(res.data.count);
      const { skipped } = res.data;
      if (skipped > 0) {
        toast.warning(
          ar
            ? `أُضيفت المنتجات إلى سلتك، باستثناء ${skipped} غير متوفرة حاليًا.`
            : `Added to your cart, except ${skipped} item(s) that are no longer available.`
        );
      } else {
        toast.success(ar ? "أُضيفت كل المنتجات إلى سلتك." : "Everything was added to your cart.");
      }
      router.push("/cart");
    });
  }

  return (
    <div className={cn("min-h-screen bg-background", ar && "font-cairo")}>
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{ar ? "سلة مشتركة" : "Shared cart"}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-foreground",
              ar ? "font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {ar ? "أرسل لك أحدهم هذه السلة" : "Someone shared this cart with you"}
          </h1>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <ul className="flex-1 divide-y divide-border rounded-lg border border-border bg-card px-3 sm:px-6">
            {shared.items.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                {ar ? "لم تعد هذه المنتجات متوفرة." : "These items are no longer available."}
              </li>
            )}
            {shared.items.map((item, index) => {
              const build = item.build_details;
              const product = item.product_details;
              const name = build
                ? (ar && build.name_ar) || build.name
                : (ar && product?.name_ar) || product?.name || "";
              const thumbnail = build ? build.thumbnail : product?.thumbnail ?? null;
              const href = product ? productHref(product) : null;
              const thumb = (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {thumbnail ? (
                    <Image src={thumbnail} alt={name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">PC</div>
                  )}
                </div>
              );
              return (
                <li key={index} className="flex items-center gap-3 py-4">
                  {href ? <Link href={href}>{thumb}</Link> : thumb}
                  <div className="min-w-0 flex-1">
                    {href ? (
                      <Link href={href} className="text-[15px] font-bold text-foreground hover:text-primary hover:underline">
                        {name}
                      </Link>
                    ) : (
                      <p className="text-[15px] font-bold text-foreground">{name}</p>
                    )}
                    <p className="text-[12px] text-muted-foreground">
                      {build ? `${partsLabel(build.items.length, locale)} · ` : ""}
                      {ar ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-[15px] font-semibold tabular-nums text-foreground" dir={ar ? "auto" : "ltr"}>
                    {price(item.total_price)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="w-full rounded-lg border border-border bg-card px-4 py-5 sm:px-6 lg:w-89.5 lg:shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-foreground">{ar ? "المجموع" : "Total"}</span>
              <span className="text-[15px] font-bold text-primary tabular-nums" dir={ar ? "auto" : "ltr"}>
                {price(shared.total_amount)}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {ar ? "بأسعار اليوم. تُحتسب رسوم التوصيل عند إتمام الطلب." : "At today's prices. Delivery is calculated at checkout."}
            </p>
            <button
              type="button"
              onClick={addAll}
              disabled={isAdding || shared.items.length === 0}
              className="mt-5 flex h-11.75 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-[#c40a16] disabled:opacity-50"
            >
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
              {ar ? "أضف الكل إلى سلتي" : "Add all to my cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
