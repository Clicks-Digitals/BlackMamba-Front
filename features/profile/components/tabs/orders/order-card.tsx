"use client";
import { useTransition, useState } from "react";
import {
  Calendar,
  Package,
  CreditCard,
  MapPin,
  Eye,
  Trash2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/stores";
import { cancelOrderAction } from "@/features/profile";
import type { Order } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onRefresh: () => void;
}

const STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING:   { bg: "bg-primary/15",   text: "text-primary",  dot: "bg-primary"  },
  CONFIRMED: { bg: "bg-primary/15",     text: "text-[#EB0B1A]",  dot: "bg-primary"   },
  SHIPPED:   { bg: "bg-primary/15",  text: "text-primary", dot: "bg-primary" },
  DELIVERED: { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary" },
  CANCELLED: { bg: "bg-primary/15",     text: "text-primary",     dot: "bg-primary"    },
};

const PAYMENT_MAP: Record<string, { bg: string; text: string }> = {
  PAID:   { bg: "bg-primary/15", text: "text-primary" },
  UNPAID: { bg: "bg-primary/15",  text: "text-primary"  },
  FAILED: { bg: "bg-primary/15",    text: "text-primary"    },
};

export function OrderCard({ order, onViewDetails, onRefresh }: OrderCardProps) {
  const [isCancelling, startCancel] = useTransition();
  const [copied, setCopied] = useState(false);
  const { open: openConfirm } = useConfirm();
  const locale = useLocale();
  const t = useTranslations("Profile.OrdersTab");

  function copyId() {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCancel() {
    openConfirm({
      title: t("cancelOrder"),
      description: t("cancelOrderDesc", { orderNumber: order.order_number }),
      confirmLabel: t("cancelOrder"),
      variant: "destructive",
      onConfirm: () =>
        startCancel(async () => {
          const res = await cancelOrderAction(order.id);
          if (res.status === "success") { toast.success(res.message); onRefresh(); }
          else toast.error(res.message);
        }),
    });
  }

  const statusStyle  = STATUS_MAP[order.status]  ?? { bg: "bg-white/8",  text: "text-white/50", dot: "bg-white/40" };
  const paymentStyle = PAYMENT_MAP[order.payment_status] ?? { bg: "bg-white/8", text: "text-white/50" };
  const statusLabel  = t(`status${order.status.charAt(0) + order.status.slice(1).toLowerCase()}` as never, { defaultValue: order.status } as never);
  const paymentLabel = t(`payment${order.payment_status.charAt(0) + order.payment_status.slice(1).toLowerCase()}` as never, { defaultValue: order.payment_status } as never);
  const canCancel    = order.status === "PENDING" || order.status === "CONFIRMED";
  const currencySymbol =
    typeof order.currency_info === "string"
      ? order.currency_info
      : (order.currency_info as { symbol?: string; code?: string } | undefined)?.symbol ||
        (order.currency_info as { symbol?: string; code?: string } | undefined)?.code ||
        "";

  return (
    <div className="overflow-hidden rounded-xl border border-[#000000] bg-[#000000] transition hover:border-[#EB0B1A]/30">
      {/* ── Header stripe ── */}
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/3 px-5 py-3.5">
        <span className="text-[14px] font-semibold text-foreground">{order.order_number}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            statusStyle.bg, statusStyle.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
          {statusLabel}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-2.5 px-5 py-4">
        {/* Order ID row */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-white/35 truncate flex-1">{order.id}</span>
          <button
            type="button"
            onClick={copyId}
            title="Copy order ID"
            className="shrink-0 text-white/35 transition hover:text-[#FFFFFF]"
          >
            {copied ? <Check size={13} className="text-foreground" /> : <Copy size={13} />}
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-white/50">
          <Calendar size={14} className="shrink-0 text-foreground/40" />
          <span className="text-[13px]">{formatDate(order.created_at, locale)}</span>
        </div>

        <div className="flex items-center gap-2.5 text-white/50">
          <Package size={14} className="shrink-0 text-foreground/40" />
          <span className="text-[13px]">
            {order.items.length} {order.items.length === 1 ? t("item") : t("items")}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-white/50">
          <CreditCard size={14} className="shrink-0 text-foreground/40" />
          <span className="text-[13px]">{order.payment_method}</span>
          <span
            className={cn(
              "ms-auto rounded-full px-2 py-0.5 text-[10.5px] font-medium",
              paymentStyle.bg, paymentStyle.text
            )}
          >
            {paymentLabel}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-white/50">
          <MapPin size={14} className="shrink-0 text-foreground/40" />
          <span className="text-[13px]">{order.shipping_address.city}</span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-white/8 px-5 py-3.5">
        <button
          type="button"
          disabled={isCancelling}
          onClick={() => onViewDetails(order)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-foreground transition hover:opacity-65 disabled:opacity-40"
        >
          <Eye size={13} />
          {t("viewDetails")}
        </button>

        <div className="flex items-center gap-4">
          {canCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-[12px] font-medium text-primary transition hover:text-primary disabled:opacity-40"
            >
              {isCancelling ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {t("cancelOrder")}
            </button>
          )}
          <span className="text-[14px] font-semibold text-[#EB0B1A]">
            {order.total_amount} {currencySymbol}
          </span>
        </div>
      </div>
    </div>
  );
}
