"use client";

import { useState } from "react";
import { Headset } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateTicketDialog } from "@/features/profile/components/tabs/support/create-ticket-dialog";

interface Props {
  isGuest: boolean;
}

export function SupportTicketWidget({ isGuest }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const t = useTranslations("Profile.SupportTab");

  const handleOpen = () => {
    setDialogKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        title={t("newTicket")}
        className="fixed bottom-6 end-6 z-50 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white shadow-lg transition-colors duration-200 hover:bg-[#d12f27] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e0e]"
        aria-label={t("newTicket")}
      >
        <Headset className="h-6 w-6" />
      </button>

      <CreateTicketDialog
        key={dialogKey}
        open={open}
        isGuest={isGuest}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}
