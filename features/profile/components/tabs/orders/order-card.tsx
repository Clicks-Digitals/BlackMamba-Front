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
  PENDING:   { bg: "bg-amber-500/15",   text: "text-amber-300",  dot: "bg-amber-400"  },
  CONFIRMED: { bg: "bg-primary/15",     text: "text-[#d12f27]",  dot: "bg-primary"   },
  SHIPPED:   { bg: "bg-violet-500/15",  text: "text-violet-300", dot: "bg-violet-400" },
  DELIVERED: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  CANCELLED: { bg: "bg-red-500/15",     text: "text-red-400",     dot: "bg-red-400"    },
};

const PAYMENT_MAP: Record<string, { bg: string; text: string }> = {
  PAID:   { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  UNPAID: { bg: "bg-amber-500/15",  text: "text-amber-300"  },
  FAILED: { bg: "bg-red-500/15",    text: "text-red-400"    },
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
    <div className="overflow-hidden rounded-xl border border-[#26292C] bg-[#17181B] transition hover:border-[#9e1d20]/30">
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
            className="shrink-0 text-white/35 transition hover:text-[#EDEFF0]"
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
              className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 transition hover:text-red-700 disabled:opacity-40"
            >
              {isCancelling ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {t("cancelOrder")}
            </button>
          )}
          <span className="text-[14px] font-semibold text-[#9e1d20]">
            {order.total_amount} {currencySymbol}
          </span>
        </div>
      </div>
    </div>
  );
}
