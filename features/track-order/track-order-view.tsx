"use client";

import { useActionState } from "react";
import { PackageSearch } from "lucide-react";
import { Input } from "@/components/forms/Input";
import { Button } from "@/components/ui/button";
import { trackOrderAction } from "./track-order-action";
import { cn } from "@/lib/utils";

/**
 * S2: an order placed as a guest belongs to nobody, so there is no list to
 * find it in. Its number and the email it was placed with are the two
 * things the shopper has.
 */
export function TrackOrderView({ rtl }: { rtl: boolean }) {
  const [state, action] = useActionState(trackOrderAction, {
    status: "idle" as const,
    message: "",
    order: null,
  });

  const copy = rtl
    ? {
        kicker: "طلبك",
        title: "تتبع طلبك",
        intro: "أدخل رقم الطلب والبريد الإلكتروني الذي استخدمته عند الشراء.",
        number: "رقم الطلب",
        email: "البريد الإلكتروني",
        submit: "ابحث عن طلبي",
        status: "الحالة",
        payment: "الدفع",
        total: "الإجمالي",
        placed: "تاريخ الطلب",
        items: "المنتجات",
      }
    : {
        kicker: "Your order",
        title: "Track your order",
        intro: "Enter your order number and the email you used at checkout.",
        number: "Order number",
        email: "Email",
        submit: "Find my order",
        status: "Status",
        payment: "Payment",
        total: "Total",
        placed: "Placed",
        items: "Items",
      };

  const order = state.order;

  // The page showed the database's own words - "PENDING", "UNPAID" - and a
  // total of "5.9" with nothing to say what that was in.
  const STATUS: Record<string, [string, string]> = {
    PENDING: ["Pending", "قيد الانتظار"],
    CONFIRMED: ["Confirmed", "مؤكد"],
    SHIPPED: ["Shipped", "تم الشحن"],
    DELIVERED: ["Delivered", "تم التوصيل"],
    CANCELLED: ["Cancelled", "ملغي"],
  };
  const PAYMENT: Record<string, [string, string]> = {
    UNPAID: ["Unpaid", "غير مدفوع"],
    PAID: ["Paid", "مدفوع"],
    FAILED: ["Failed", "فشل"],
  };

  const pick = (map: Record<string, [string, string]>, key: string) =>
    map[key]?.[rtl ? 1 : 0] ?? key;
  const statusLabel = (value: string) => pick(STATUS, value);
  const paymentLabel = (value: string) => pick(PAYMENT, value);

  const money = (value: string | number) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return String(value);
    const shown = amount.toFixed(2);
    return rtl ? `${shown} د.أ` : `JOD ${shown}`;
  };

  return (
    <div className="bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{copy.kicker}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {copy.title}
          </h1>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-20 pt-8">
        <div className={cn("max-w-xl", rtl && "font-cairo")}>
          <p className="mb-6 text-[14px] leading-relaxed text-muted-foreground">{copy.intro}</p>

          <form action={action} className="space-y-4">
            <Input
              label={copy.number}
              name="order_number"
              placeholder="ORD-20261015-A1B2C3D4"
              required
            />
            <Input
              label={copy.email}
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full rounded-lg py-6 font-bold uppercase tracking-wider">
              {copy.submit}
            </Button>
          </form>

          {state.status === "error" ? (
            <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-[13.5px] text-destructive">
              {state.message}
            </p>
          ) : null}

          {order ? (
            <div className="mt-8 rounded-lg border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <PackageSearch className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
                <p className="text-[15px] font-semibold text-foreground">{order.order_number}</p>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13.5px]">
                <dt className="text-muted-foreground">{copy.status}</dt>
                <dd className="text-end font-medium text-foreground">
                  {statusLabel(order.status)}
                </dd>

                <dt className="text-muted-foreground">{copy.payment}</dt>
                <dd className="text-end font-medium text-foreground">
                  {paymentLabel(order.payment_status)}
                </dd>

                <dt className="text-muted-foreground">{copy.placed}</dt>
                <dd className="text-end font-medium text-foreground">
                  {new Date(order.created_at).toLocaleDateString(rtl ? "ar-JO" : "en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>

                <dt className="text-muted-foreground">{copy.total}</dt>
                <dd className="text-end font-semibold text-foreground">
                  {money(order.total_amount)}
                </dd>
              </dl>

              <p className="mt-5 mb-2 text-[11.5px] uppercase tracking-widest text-muted-foreground">
                {copy.items}
              </p>
              <ul className="space-y-2">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 text-[13.5px]">
                    <span className="text-foreground">
                      {item.quantity} &times; {item.product_name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {money(item.total_price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
