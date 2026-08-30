"use client";

import { useTransition } from "react";
import { MapPin, Phone, Building2, Star, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/stores";
import { deleteAddressAction, setDefaultAddressAction } from "@/features/profile";
import type { Address } from "@/types";
import { useTranslations } from "next-intl";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onRefresh: () => void;
}

export function AddressCard({ address, onEdit, onRefresh }: AddressCardProps) {
  const [isDeleting, startDelete] = useTransition();
  const [isSettingDefault, startSetDefault] = useTransition();
  const { open: openConfirm } = useConfirm();
  const t = useTranslations("Profile.AddressesTab");

  function handleDelete() {
    openConfirm({
      title: t("deleteAddress"),
      description: t("deleteAddressDesc"),
      confirmLabel: t("delete"),
      variant: "destructive",
      onConfirm: () => {
        startDelete(async () => {
          const res = await deleteAddressAction(address.id);
          if (res.status === "success") {
            toast.success(res.message);
            onRefresh();
          } else {
            toast.error(res.message);
          }
        });
      },
    });
  }

  function handleSetDefault() {
    startSetDefault(async () => {
      const res = await setDefaultAddressAction(address.id);
      if (res.status === "success") {
        toast.success(res.message);
        onRefresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-[#17181B] transition hover:border-[#9e1d20]/30 ${address.is_default ? "border-[#9e1d20]/40" : "border-[#26292C]"}`}>
      {/* Default badge */}
      {address.is_default && (
        <span className="absolute top-3.5 end-3.5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-medium text-white">
          <Star size={10} className="fill-white" />
          {t("default")}
        </span>
      )}

      {/* Header */}
      <div className="border-b border-white/8 bg-white/3 px-5 py-3.5">
        <p className="text-[14px] font-semibold text-foreground">{address.title}</p>
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-2.5 px-5 py-4">
        <div className="flex items-start gap-2.5 text-white/50">
          <MapPin size={14} className="mt-0.5 shrink-0 text-foreground/40" />
          <span className="text-[13px] leading-snug">
            {address.street}{address.building ? `, ${address.building}` : ""}, {address.city}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-white/50">
          <Phone size={14} className="shrink-0 text-foreground/40" />
          <span className="text-[13px]">{address.phone}</span>
        </div>
        {address.building && (
          <div className="flex items-center gap-2.5 text-white/50">
            <Building2 size={14} className="shrink-0 text-foreground/40" />
            <span className="text-[13px]">{address.building}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-white/8 px-5 py-3.5">
        {!address.is_default && (
          <button
            type="button"
            disabled={isSettingDefault || isDeleting}
            onClick={handleSetDefault}
            className="flex items-center gap-1.5 text-[12px] font-medium text-white/45 transition hover:text-[#EDEFF0] disabled:opacity-40"
          >
            {isSettingDefault ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
            {t("setDefault")}
          </button>
        )}
        <button
          type="button"
          disabled={isDeleting || isSettingDefault}
          onClick={() => onEdit(address)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-white/45 transition hover:text-[#EDEFF0] disabled:opacity-40"
        >
          <Pencil size={13} />
          {t("edit")}
        </button>
        <button
          type="button"
          disabled={isDeleting || isSettingDefault}
          onClick={handleDelete}
          className="ms-auto flex items-center gap-1.5 text-[12px] font-medium text-red-500 transition hover:text-red-700 disabled:opacity-40"
        >
          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          {t("delete")}
        </button>
      </div>
    </div>
  );
}
