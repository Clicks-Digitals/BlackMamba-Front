"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Order } from "@/types";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { formatDate } from "@/lib/utils/date";

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

function getStatusColor(status: string): { bg: string; text: string; lightBg: string } {
  switch (status) {
    case "PENDING":
      return { bg: "bg-amber-500", text: "text-amber-300", lightBg: "bg-amber-500/15" };
    case "CONFIRMED":
      return { bg: "bg-primary", text: "text-[#d12f27]", lightBg: "bg-primary/15" };
    case "SHIPPED":
      return { bg: "bg-violet-500", text: "text-violet-300", lightBg: "bg-violet-500/15" };
    case "DELIVERED":
      return { bg: "bg-emerald-500", text: "text-emerald-400", lightBg: "bg-emerald-500/15" };
    case "CANCELLED":
      return { bg: "bg-red-500", text: "text-red-400", lightBg: "bg-red-500/15" };
    default:
      return { bg: "bg-white/30", text: "text-white/55", lightBg: "bg-white/4" };
  }
}

export function OrderDetailDialog({
  order,
  open,
  onClose,
}: OrderDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("Profile.OrdersTab");
  const locale = useLocale();

  if (!order) return null;

  function copyId() {
    navigator.clipboard.writeText(order!.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const rtl = locale === "ar";
  const statusColor = getStatusColor(order.status);
  const statusLabel = ({
    PENDING: t("statusPending"),
    CONFIRMED: t("statusConfirmed"),
    SHIPPED: t("statusShipped"),
    DELIVERED: t("statusDelivered"),
    CANCELLED: t("statusCancelled"),
  } as Record<string, string>)[order.status] ?? order.status;
  const paymentLabel = ({
    PAID: t("paymentPaid"),
    UNPAID: t("paymentUnpaid"),
    FAILED: t("paymentFailed"),
  } as Record<string, string>)[order.payment_status] ?? order.payment_status;
  const currencySymbol =
    typeof order.currency_info === "string"
      ? order.currency_info
      : (order.currency_info as Record<string, string>)?.symbol ||
        (order.currency_info as Record<string, string>)?.code ||
        "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[10px] scrollbar-thin backdrop-blur-md bg-[#17181B] shadow-2xl border border-[#26292C]">
        <DialogHeader className="border-b border-white/8 pt-8 ">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="font-chillax text-[20px] sm:text-[24px] font-bold text-[#EDEFF0] truncate">
                {order.order_number}
              </DialogTitle>
              <p className="font-chillax text-[13px] text-white/45 mt-2">
                {t("orderedOn")}{" "}
                <span className="font-semibold text-white/70">
                  {formatDate(order.created_at, locale)}
                </span>
              </p>
              <div className="mt-2 flex items-center gap-2 min-w-0">
                <span className="font-mono text-[11px] text-white/35 truncate">{order.id}</span>
                <button
                  type="button"
                  onClick={copyId}
                  className="shrink-0 text-white/35 transition hover:text-white/55"
                  title="Copy order ID"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <div
              className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 font-chillax text-[12px] font-bold ${statusColor.lightBg} ${statusColor.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusColor.bg} me-2`}></span>
              {statusLabel}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Order Items */}
          <div>
            <h3 className="font-chillax text-[18px] font-bold text-[#EDEFF0] mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              {t("orderItems", { count: order.items.length })}
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[5px] border border-[#26292C] overflow-hidden hover:border-[#9e1d20]/30 transition-all duration-300 bg-[#17181B]"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                    {/* Product Image */}
                    <div className="shrink-0">
                      {item.product_details?.thumbnail ? (
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-[5px] overflow-hidden shadow-md">
                          <Image
                            src={item.product_details.thumbnail}
                            width={100}
                            height={100}
                            alt={item.product_name}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-[5px] bg-[#0B0F0E] flex items-center justify-center shadow-md">
                          <span className="text-xs text-white/45 font-medium">{t("noImage")}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-chillax text-[15px] font-bold text-[#EDEFF0] mb-1">
                            {rtl && item.product_name_ar ? item.product_name_ar : item.product_name}
                          </p>
                          {item.sku && (
                            <p className="font-chillax text-[11px] text-white/45 uppercase tracking-wide">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                        <span className="bg-primary/15 text-[#d12f27] px-3 py-1 rounded-full font-chillax text-[12px] font-semibold">
                          ×{item.quantity}
                        </span>
                      </div>

                      {(item.product_details?.description || item.product_details?.description_ar) && (
                        <p className="font-chillax text-[12px] text-white/55 mb-3 leading-relaxed line-clamp-2">
                          {rtl && item.product_details?.description_ar
                            ? item.product_details.description_ar
                            : item.product_details?.description}
                        </p>
                      )}

                      {/* Variation Info */}
                      {(item.variation_details ||
                        item.combination_details) && (
                        <div className="mb-4 p-3 bg-[#0B0F0E] rounded-lg border border-[#26292C]">
                          <p className="font-chillax text-[10px] text-white/45 mb-2 uppercase tracking-wide font-semibold">
                            {t("variantDetails")}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.variation_details && (
                              <span className="inline-flex items-center rounded-[5px] bg-violet-500/15 px-3 py-1.5 font-chillax text-[11px] font-semibold text-violet-300">
                                {item.variation_details.attribute_names || `SKU: ${item.variation_details.sku}`}
                              </span>
                            )}
                            {item.combination_details?.variations?.map((variation) => (
                              <span
                                key={variation.id}
                                className="inline-flex items-center rounded-[5px] bg-primary/15 px-3 py-1.5 font-chillax text-[11px] font-semibold text-[#d12f27]"
                              >
                                {variation.attribute_name}: {variation.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PC Build bundle contents */}
                      {item.build_snapshot && item.build_snapshot.length > 0 && (
                        <div className="mb-4 p-3 bg-[#0B0F0E] rounded-lg border border-[#26292C]">
                          <p className="font-chillax text-[10px] text-white/45 mb-2 uppercase tracking-wide font-semibold">
                            {t("bundleContents")}:
                          </p>
                          <div className="space-y-1.5">
                            {item.build_snapshot.map((part, idx) => (
                              <div key={idx} className="flex items-center justify-between font-chillax text-[11px] text-white/70">
                                <span className="truncate">
                                  <span className="text-white/35">{part.slot}:</span> {part.product_name}
                                </span>
                                <span className="shrink-0 font-semibold">{part.unit_price} {currencySymbol}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/8">
                        <span className="font-chillax text-[12px] text-white/55">
                          {item.unit_price}
                          {currencySymbol} {t("each")}
                        </span>
                        <span className="font-chillax text-[14px] font-bold text-[#9e1d20]">
                          {item.total_price}
                          {currencySymbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-[5px] border border-[#9e1d20]/20 bg-[#9e1d20]/8 p-6">
            <h3 className="font-chillax text-[16px] font-bold text-[#EDEFF0] mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              {t("orderSummary")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-chillax text-[13px] text-white/55">
                  {t("subtotal")}
                </span>
                <span className="font-chillax text-[13px] font-semibold text-[#EDEFF0]">
                  {order.subtotal}
                  {currencySymbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-chillax text-[13px] text-white/55">
                  {t("shippingCost")}
                </span>
                <span className="font-chillax text-[13px] font-semibold text-[#EDEFF0]">
                  {order.shipping_cost}
                  {currencySymbol}
                </span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-chillax text-[13px] text-white/55">
                    {t("discount")}
                    {order.coupon_code && (
                      <span className="ms-1 font-semibold text-emerald-400">
                        ({order.coupon_code})
                      </span>
                    )}
                  </span>
                  <span className="font-chillax text-[13px] font-bold text-emerald-400">
                    -{order.discount_amount}
                    {currencySymbol}
                  </span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-chillax text-[15px] font-bold text-[#EDEFF0]">
                    {t("totalAmount")}
                  </span>
                  <span className="font-chillax text-[18px] font-bold text-[#9e1d20]">
                    {order.total_amount}
                    {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="rounded-[5px] border border-emerald-500/20 bg-emerald-500/8 p-6">
            <h3 className="font-chillax text-[16px] font-bold text-[#EDEFF0] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
              {t("paymentInformation")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-chillax text-[13px] text-white/55">
                  {t("paymentMethod")}
                </span>
                <span className="font-chillax text-[13px] font-semibold text-[#EDEFF0]">
                  {order.payment_method.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-chillax text-[13px] text-white/55">
                  {t("paymentStatus")}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 font-chillax text-[12px] font-bold ${
                    order.payment_status === "PAID"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : order.payment_status === "UNPAID"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full me-2 ${
                    order.payment_status === "PAID"
                      ? "bg-emerald-500"
                      : order.payment_status === "UNPAID"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}></span>
                  {paymentLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-[5px] border border-amber-500/20 bg-amber-500/8 p-6">
            <h3 className="font-chillax text-[16px] font-bold text-[#EDEFF0] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
              {t("shippingAddress")}
            </h3>
            <div className="space-y-2">
              <p className="font-chillax text-[14px] font-bold text-[#EDEFF0]">
                {order.shipping_address.full_name}
              </p>
              <p className="font-chillax text-[13px] text-white/70 leading-relaxed">
                {order.shipping_address.address_line}
              </p>
              <p className="font-chillax text-[13px] text-white/70">
                {order.shipping_address.city}
                {order.shipping_address.state &&
                  `, ${order.shipping_address.state}`}
              </p>
              <p className="font-chillax text-[13px] font-semibold text-white/70">
                📞 {order.shipping_address.phone}
              </p>
            </div>
          </div>

          {/* Shipping Method */}
          {order.shipping_option_details && (
            <div className="rounded-[5px] border border-[#26292C] bg-[#17181B] p-6">
              <h3 className="font-chillax text-[16px] font-bold text-[#EDEFF0] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                {t("shippingMethod")}
              </h3>
              <div className="space-y-2">
                <p className="font-chillax text-[14px] font-bold text-[#EDEFF0]">
                  {order.shipping_option_details.name}
                </p>
                <p className="font-chillax text-[13px] text-white/70">
                  📦 {t("estimatedDelivery", {
                    min: order.shipping_option_details.estimated_days_min,
                    max: order.shipping_option_details.estimated_days_max,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
