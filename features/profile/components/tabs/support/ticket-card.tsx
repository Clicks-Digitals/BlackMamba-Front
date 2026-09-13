"use client";

import { Ticket, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import  { type SupportTicket,supportTicketStatusBadgeClasses } from "@/features/profile";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils";

export function TicketCard({
  ticket,
  onViewDetails,
}: {
  ticket: SupportTicket;
  onViewDetails: (ticket: SupportTicket) => void;
}) {
  const t = useTranslations("Profile.SupportTab");
  const locale = useLocale();

  const formattedDate = formatDateShort(ticket.created_at, locale);

  const categoryLabel =
    {
      ORDER_ISSUE: t("orderIssue"),
      PAYMENT: t("payment"),
      SHIPPING: t("shipping"),
      GENERAL: t("general"),
    }[ticket.category] || ticket.category;

  return (
    <button
      type="button"
      onClick={() => onViewDetails(ticket)}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-[#000000] bg-[#000000] p-4 text-start",
        "transition-all duration-200",
        "hover:z-10 hover:border-[#EB0B1A]/30 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <div className="flex w-full items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-foreground transition-colors group-hover:bg-primary/15"
          aria-hidden
        >
          <Ticket className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/45">
              #{ticket.id.slice(0, 8)}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize leading-none",
                supportTicketStatusBadgeClasses(ticket.status)
              )}
            >
              {t(ticket.status.toLowerCase()) || ticket.status}
            </span>
          </div>
          <h4 className="mt-2 text-[15px] font-semibold leading-snug text-[#FFFFFF] line-clamp-2 group-hover:text-[#EB0B1A]">
            {ticket.subject}
          </h4>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
        <span className="inline-flex max-w-full items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-[#FFFFFF] line-clamp-1">
          {categoryLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-white/45">
          {formattedDate}
          <ChevronRight
            className="size-3.5 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-[#FFFFFF]"
            aria-hidden
          />
        </span>
      </div>
    </button>
  );
}
