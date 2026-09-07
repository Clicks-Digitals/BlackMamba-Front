"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { getAddresses, AddressCard, AddressFormDialog } from "@/features/profile";
import type { Address } from "@/types";
import { useTranslations } from "next-intl";

export function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const t = useTranslations("Profile.AddressesTab");

  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const data = await getAddresses();
        setAddresses(data ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, [refreshCount]);

  const refresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  function openCreate() {
    setEditingAddress(null);
    setDialogOpen(true);
  }

  function openEdit(address: Address) {
    setEditingAddress(address);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingAddress(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold text-foreground">{t("savedAddresses")}</h3>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-[5px] bg-primary px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-primary/85"
        >
          <Plus size={16} />
          {t("addAddress")}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[#000000] bg-[#000000] py-16 text-center">
          <MapPin size={48} className="text-white/25" />
          <div>
            <p className="text-[16px] font-medium text-[#FFFFFF]">{t("noRecentAddresses")}</p>
            <p className="text-[13px] text-white/45">
              {t("noSavedAddressesDesc")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSuccess={refresh}
        editingAddress={editingAddress}
      />
    </div>
  );
}
