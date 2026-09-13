"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Order } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { formatDate } from "@/lib/utils/date";

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "PENDING":
      return { bg: "bg-primary/15", text: "text-primary" };
    case "CONFIRMED":
      return { bg: "bg-primary/15", text: "text-[#EB0B1A]" };
    case "SHIPPED":
      return { bg: "bg-primary/15", text: "text-primary" };
    case "DELIVERED":
      return { bg: "bg-primary/15", text: "text-primary" };
    case "CANCELLED":
      return { bg: "bg-primary/15", text: "text-primary" };
    default:
      return { bg: "bg-white/8", text: "text-white/70" };
  }
}

export function OrderDetailSheet({
  order,
  open,
  onClose,
}: OrderDetailSheetProps) {
  const t = useTranslations("Profile.OrdersTab");
  const locale = useLocale();

  if (!order) return null;

  const rtl = locale === "ar";
  const statusColor = getStatusColor(order.status);
  const statusLabel = ({
    PENDING: t("statusPending"),
    CONFIRMED: t("statusConfirmed"),
    SHIPPED: t("statusShipped"),
    DELIVERED: t("statusDelivered"),
    CANCELLED: t("statusCancelled"),
  } as Record<string, string>)[order.status] ?? order.status;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="font-chillax text-[18px] font-semibold">
                {order.order_number}
              </SheetTitle>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-chillax text-[11px] font-medium ${statusColor.bg} ${statusColor.text}`}
            >
              {statusLabel}
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="mb-3 font-chillax text-[14px] font-semibold text-[#FFFFFF]">
              {t("itemsCount", { count: order.items.length })}
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#000000] bg-[#000000] p-3"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <p className="flex-1 font-chillax text-[13px] font-medium text-[#FFFFFF]">
                      {rtl && item.product_name_ar ? item.product_name_ar : item.product_name}
                    </p>
                    <span className="font-chillax text-[12px] text-white/45">
                      x{item.quantity}
                    </span>
                  </div>
                  {item.sku && (
                    <p className="mb-1 font-chillax text-[11px] text-white/45">
                      SKU: {item.sku}
                    </p>
                  )}
                  {item.build_snapshot && item.build_snapshot.length > 0 && (
                    <div className="mb-2 space-y-1 rounded-lg bg-[#000000] p-2">
                      {item.build_snapshot.map((part, idx) => (
                        <div key={idx} className="flex items-center justify-between font-chillax text-[10px] text-white/55">
                          <span className="truncate">
                            <span className="text-white/35">{part.slot}:</span> {part.product_name}
                          </span>
                          <span className="shrink-0">{part.unit_price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
                    <span className="font-chillax text-[12px] text-white/55">
                      {item.unit_price}
                    </span>
                    <span className="font-chillax text-[12px] font-semibold text-[#FFFFFF]">
                      {item.total_price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-xl border border-[#000000] bg-[#000000] p-4">
            <h3 className="mb-3 font-chillax text-[14px] font-semibold text-[#FFFFFF]">
              {t("orderSummary")}
            </h3>
            <div className="space-y-2">
              {(() => {
                const info = order.currency_info as { symbol?: string; code?: string } | string | undefined;
                const currencySymbol =
                  typeof info === "string" ? info : info?.symbol || info?.code || "";

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-chillax text-[13px] text-white/55">
                        {t("subtotal")}
                      </span>
                      <span className="font-chillax text-[13px] text-[#FFFFFF]">
                        {order.subtotal} {currencySymbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-chillax text-[13px] text-white/55">
                        {t("shippingCost")}
                      </span>
                      <span className="font-chillax text-[13px] text-[#FFFFFF]">
                        {order.shipping_cost} {currencySymbol}
                      </span>
                    </div>
                    {order.coupon_code && (
                      <div className="flex items-center justify-between">
                        <span className="font-chillax text-[13px] text-white/55">
                          {t("discount")} ({order.coupon_code})
                        </span>
                        <span className="font-chillax text-[13px] text-primary">
                          -{order.discount_amount} {currencySymbol}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-[var(--border)] pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-chillax text-[14px] font-semibold text-[#FFFFFF]">
                          {t("total")}
                        </span>
                        <span className="font-chillax text-[14px] font-bold text-[#FFFFFF]">
                          {order.total_amount} {currencySymbol}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="mb-3 font-chillax text-[14px] font-semibold text-[#FFFFFF]">
              {t("shippingAddress")}
            </h3>
            <div className="rounded-xl border border-[#000000] bg-[#000000] p-4">
              <p className="font-chillax text-[13px] font-medium text-[#FFFFFF]">
                {order.shipping_address.full_name}
              </p>
              <p className="font-chillax text-[12px] text-white/55">
                {order.shipping_address.address_line}
              </p>
              <p className="font-chillax text-[12px] text-white/55">
                {order.shipping_address.city}
                {order.shipping_address.state &&
                  `, ${order.shipping_address.state}`}
              </p>
              <p className="font-chillax text-[12px] text-white/55">
                {order.shipping_address.phone}
              </p>
            </div>
          </div>

          {/* Shipping Option */}
          {order.shipping_option_details && (
            <div>
              <h3 className="mb-3 font-chillax text-[14px] font-semibold text-[#FFFFFF]">
                {t("shippingMethod")}
              </h3>
              <div className="rounded-xl border border-[#000000] bg-[#000000] p-4">
                <p className="font-chillax text-[13px] font-medium text-[#FFFFFF]">
                  {order.shipping_option_details.name}
                </p>
                <p className="font-chillax text-[12px] text-white/55">
                  {t("estimatedDelivery", {
                    min: order.shipping_option_details.estimated_days_min,
                    max: order.shipping_option_details.estimated_days_max,
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Order Dates */}
          <div className="rounded-xl border border-[#000000] bg-[#000000] p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-chillax text-[12px] text-white/55">
                  {t("orderDate")}
                </span>
                <span className="font-chillax text-[12px] text-[#FFFFFF]">
                  {formatDate(order.created_at, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-chillax text-[12px] text-white/55">
                  {t("lastUpdated")}
                </span>
                <span className="font-chillax text-[12px] text-[#FFFFFF]">
                  {formatDate(order.updated_at, locale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
