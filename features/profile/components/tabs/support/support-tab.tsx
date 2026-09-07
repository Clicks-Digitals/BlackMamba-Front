"use client";

import { useState, useCallback } from "react";
import { Headset } from "lucide-react";
import { InfiniteScroll } from "@/components/shared";
import {
  getSupportTickets,
  TicketCard,
  TicketDetailSheet,
  type SupportTicket
} from "@/features/profile";
import { useTranslations } from "next-intl";
export function SupportTab() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const t = useTranslations("Profile.SupportTab");

  const refresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-start justify-between rounded-xl border border-[#000000] bg-[#000000] p-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-chillax text-[18px] font-semibold text-foreground">
            {t("supportTickets")}
          </h3>
          <p className="font-chillax mt-1 max-w-[500px] text-sm text-white/45">
            {t("supportDesc")}
          </p>
        </div>
      </div>

      <InfiniteScroll<SupportTicket>
        key={`list-${refreshCount}`}
        fetchAction={getSupportTickets}
        emptyState={
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[#000000] bg-[#000000] py-16 text-center">
            <Headset size={48} className="text-white/25" />
            <div>
              <p className="font-chillax text-[16px] font-medium text-[#FFFFFF]">{t("noTickets")}</p>
            </div>
          </div>
        }
        endMessage={t("allTicketsLoaded")}
      >
        {(tickets) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onViewDetails={setSelectedTicket} />
            ))}
          </div>
        )}
      </InfiniteScroll>

      <TicketDetailSheet
        ticket={selectedTicket}
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onRefresh={refresh}
      />
    </div>
  );
}
