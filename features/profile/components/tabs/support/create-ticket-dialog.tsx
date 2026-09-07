"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/forms";
import { FileUpload } from "@/components/forms/FileUpload";
import {
  ChevronDown,
  Headphones,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { createSupportTicketAction, type CreateSupportTicketValues } from "@/features/profile";
import { getOrders } from "@/features/profile/actions/orders/get-orders";
import type { ActionState, Order } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/date";

// Matches STATUS_MAP in order-card.tsx
const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING:   { bg: "bg-primary/15",  text: "text-primary",  dot: "bg-primary"  },
  CONFIRMED: { bg: "bg-primary/15",   text: "text-[#EB0B1A]",   dot: "bg-primary"   },
  SHIPPED:   { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary" },
  DELIVERED: { bg: "bg-primary/15",  text: "text-foreground",  dot: "bg-primary" },
  CANCELLED: { bg: "bg-primary/15",    text: "text-primary",    dot: "bg-primary"    },
};

const STATUS_LABEL_KEY: Record<string, string> = {
  PENDING: "statusPending",
  CONFIRMED: "statusConfirmed",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  CANCELLED: "statusCancelled",
};

function StatusBadge({ status }: { status: string }) {
  const tOrders = useTranslations("Profile.OrdersTab");
  const cfg = STATUS_BADGE[status] ?? { bg: "bg-white/8", text: "text-white/50", dot: "bg-white/40" };
  const labelKey = STATUS_LABEL_KEY[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", cfg.bg, cfg.text)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} />
      {labelKey ? tOrders(labelKey as never) : status}
    </span>
  );
}

/** Stacked product thumbnails — up to 3 with +N overflow */
function ThumbStack({ order, size = 40 }: { order: Order; size?: number }) {
  const thumbs = order.items.map((i) => i.product_details?.thumbnail).filter(Boolean) as string[];
  const visible = thumbs.slice(0, 3);
  const extra = order.items.length - visible.length;
  const px = size;
  const overlap = Math.round(px * 0.28);

  if (visible.length === 0) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-xl bg-white/8"
        style={{ width: px, height: px }}
      >
        <ShoppingBag className="text-white/40" style={{ width: px * 0.45, height: px * 0.45 }} />
      </div>
    );
  }

  const totalW = visible.length * px - (visible.length - 1) * overlap + (extra > 0 ? px - overlap : 0);

  return (
    <div className="relative shrink-0" style={{ width: totalW, height: px }}>
      {visible.map((src, idx) => (
        <div
          key={idx}
          className="absolute overflow-hidden rounded-xl border-2 border-[#000000] shadow-sm"
          style={{ width: px, height: px, insetInlineStart: idx * (px - overlap), zIndex: visible.length - idx }}
        >
          <Image src={src} alt="" fill className="object-cover" unoptimized />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="absolute flex items-center justify-center rounded-xl border-2 border-[#000000] bg-white/8 font-bold text-white/50 shadow-sm"
          style={{
            width: px,
            height: px,
            insetInlineStart: visible.length * (px - overlap),
            fontSize: px * 0.22,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/** Tiny overlapping thumbnails for the trigger */
function MiniThumbs({ order }: { order: Order }) {
  const thumbs = order.items.map((i) => i.product_details?.thumbnail).filter(Boolean) as string[];
  const visible = thumbs.slice(0, 4);
  if (visible.length === 0) return null;
  return (
    <div className="relative flex shrink-0 items-center" style={{ width: visible.length * 18 + 8 }}>
      {visible.map((src, idx) => (
        <div
          key={idx}
          className="absolute overflow-hidden rounded border-2 border-[#000000] shadow-sm"
          style={{ width: 24, height: 24, insetInlineStart: idx * 18 }}
        >
          <Image src={src} alt="" fill className="object-cover" unoptimized />
        </div>
      ))}
    </div>
  );
}

// ─── Order Picker ──────────────────────────────────────────────────────────────

interface OrderPickerProps {
  defaultValue?: string;
  error?: string;
  label: string;
  locale: string;
}

function OrderPicker({ defaultValue, error, label, locale }: OrderPickerProps) {
  const t = useTranslations("Profile.SupportTab");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrders(1, {}).then((res) => {
      setOrders(res.results);
      setLoading(false);
      if (defaultValue) {
        const match = res.results.find((o) => o.order_number === defaultValue || o.id === defaultValue);
        if (match) setSelected(match);
      }
    });
  }, [defaultValue]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  const filtered = query
    ? orders.filter((o) => o.order_number.toLowerCase().includes(query.toLowerCase()))
    : orders;

  function pick(order: Order) {
    setSelected(order);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    setSelected(null);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="dark relative">
      <input type="hidden" name="order" value={selected?.order_number ?? ""} />

      <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{label}</label>

      {/* Trigger — div (not button) to avoid nested <button> */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !loading && setOpen((v) => !v)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !loading) {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-[#000000] px-4 py-3 text-sm transition-all select-none",
          open ? "border-primary shadow-sm ring-2 ring-primary/15" : "border-[#000000] hover:border-primary/40",
          error && "border-primary/40 hover:border-primary/40"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/40" />
            <span className="flex-1 text-white/40">{t("loadingOrders")}</span>
          </>
        ) : selected ? (
          <>
            <MiniThumbs order={selected} />
            <span className="flex flex-1 flex-col gap-0.5 min-w-0 text-start">
              <span className="font-semibold text-[#FFFFFF] leading-none">{selected.order_number}</span>
              <span className="text-xs text-white/40">{formatDateShort(selected.created_at, locale)}</span>
            </span>
            <StatusBadge status={selected.status} />
            <span className="shrink-0 font-bold text-foreground">
              {Number(selected.total_amount).toFixed(2)} JOD
            </span>
            {/* X as a button inside a div — valid HTML */}
            <button
              type="button"
              aria-label="Clear selection"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="ms-1 shrink-0 rounded-full p-1 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            <Package className="h-4 w-4 shrink-0 text-white/35" />
            <span className="flex-1 text-start text-white/40">{t("selectOrder")}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/40 transition-transform duration-200", open && "rotate-180")} />
          </>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-primary">{error}</p>}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[#000000] bg-[#000000] shadow-2xl shadow-black/40">
          {/* Search */}
          <div className="border-b border-white/8 p-3">
            <div className="flex items-center gap-2.5 rounded-lg border border-[#000000] bg-white/4 px-3 py-2.5 transition-all focus-within:border-primary/50 focus-within:bg-[#000000] focus-within:shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-white/40" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchOrders")}
                className="flex-1 bg-transparent text-sm text-[#FFFFFF] outline-none placeholder:text-white/40"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="rounded text-white/40 hover:text-[#FFFFFF]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1.5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-white/8" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 animate-pulse rounded-md bg-white/8" />
                    <div className="h-3 w-24 animate-pulse rounded-md bg-white/8" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded-md bg-white/8" />
                </li>
              ))
            ) : filtered.length === 0 ? (
              <li className="flex flex-col items-center gap-2.5 py-10">
                <Package className="h-8 w-8 text-white/20" />
                <span className="text-sm text-white/40">{t("noOrdersFound")}</span>
              </li>
            ) : (
              filtered.map((order) => {
                const isSel = selected?.id === order.id;
                const itemNames = order.items.slice(0, 2).map((i) => i.product_name).join(", ")
                  + (order.items.length > 2 ? ` ${t("moreCount", { count: order.items.length - 2 })}` : "");

                return (
                  <li key={order.id} role="option" aria-selected={isSel}>
                    <button
                      type="button"
                      onClick={() => pick(order)}
                      className={cn(
                        "flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors hover:bg-white/5 active:bg-white/8",
                        isSel && "bg-primary/5"
                      )}
                    >
                      <ThumbStack order={order} size={48} />

                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("font-semibold", isSel ? "text-foreground" : "text-[#FFFFFF]")}>
                            {order.order_number}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <span className="truncate text-xs text-white/40">{itemNames}</span>
                        <span className="text-xs text-white/40">
                          {t("orderItemsCount", { count: order.items.length })} · {formatDateShort(order.created_at, locale)}
                        </span>
                      </div>

                      <span className="shrink-0 font-bold text-foreground">
                        {Number(order.total_amount).toFixed(2)}{" "}
                        <span className="font-normal text-white/40">JOD</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Dialog ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isGuest?: boolean;
}

export function CreateTicketDialog({ open, onClose, onSuccess, isGuest = false }: Props) {
  const t = useTranslations("Profile.SupportTab");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [category, setCategory] = useState("");

  const [state, action, isPending] = useActionState<ActionState<CreateSupportTicketValues>, FormData>(
    createSupportTicketAction,
    { status: "idle", message: "" }
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onSuccess();
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message === "fixErrors" || state.message.startsWith("validation.")
          ? t(state.message as never)
          : state.message
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.message]);

  const fe = state.fieldErrors || {};

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "max-h-[95dvh] overflow-hidden rounded-lg p-0 sm:max-w-2xl",
          isRtl && "text-start"
        )}
        aria-describedby={undefined}
        showCloseButton={false}
      >
        {/* ── Brand header ───────────────────────────────── */}
        <div className="relative overflow-hidden bg-primary px-6 pb-5 pt-5">
          {/* Decorative rings */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Headphones className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1 pt-0.5">
              <DialogTitle className="font-chillax text-xl font-semibold text-white">
                {t("newTicket")}
              </DialogTitle>
              <p className="mt-1 text-sm text-white/60">{t("responseTime")}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="mt-0.5 shrink-0 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Form (scrollable) ────────────────────────────── */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(95dvh - 110px)" }}>
          <form action={action} className="space-y-6 px-6 py-6">
            {/* Guest email */}
            {isGuest && (
              <Input
                label={t("guestEmail")}
                name="guest_email"
                required
                type="email"
                className="h-11 py-3"
                placeholder={t("guestEmailPlaceholder")}
                defaultValue={state.inputs?.guest_email || ""}
                error={fe.guest_email?.[0] ? t(fe.guest_email[0] as never) : undefined}
              />
            )}

            {/* ── TOPIC ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {t("topic")}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Select
                name="category"
                label={t("category")}
                placeholder={t("selectCategory")}
                defaultValue={state.inputs?.category || undefined}
                className="h-11 min-h-0 py-3"
                options={[
                  { value: "ORDER_ISSUE", label: t("orderIssue") },
                  { value: "PAYMENT",     label: t("payment")     },
                  { value: "SHIPPING",    label: t("shipping")    },
                  { value: "GENERAL",     label: t("general")     },
                ]}
                error={fe.category?.[0] ? t(fe.category[0] as never) : undefined}
                onValueChange={(val) => setCategory(val ?? "")}
              />

              {category === "ORDER_ISSUE" && (
                <OrderPicker
                  label={t("orderId")}
                  defaultValue={state.inputs?.order || ""}
                  error={fe.order?.[0] ? t(fe.order[0] as never) : undefined}
                  locale={locale}
                />
              )}
            </section>

            {/* ── DETAILS ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {t("details")}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Input
                label={t("subject")}
                name="subject"
                className="h-11 py-3"
                placeholder={t("subjectPlaceholder")}
                defaultValue={state.inputs?.subject || ""}
                error={fe.subject?.[0] ? t(fe.subject[0] as never) : undefined}
              />

              <Textarea
                label={t("message")}
                name="body"
                className="min-h-32 resize-none"
                placeholder={t("messagePlaceholder")}
                defaultValue={state.inputs?.body || ""}
                error={fe.body?.[0] ? t(fe.body[0] as never) : undefined}
              />
            </section>

            {/* Attachment */}
            <FileUpload
              name="attachment"
              label={t("attachment")}
              accept="image/*,application/pdf,.doc,.docx"
            />

            {/* ── Actions ── */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="h-12 w-full rounded-xl border-[#000000] font-chillax text-sm sm:w-auto sm:px-8"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 flex-1 rounded-xl bg-primary font-chillax text-sm font-semibold hover:bg-[#EB0B1A] sm:flex-none sm:px-10"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t("submit")}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
