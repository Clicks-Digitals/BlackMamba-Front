"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, SubmitButton, Checkbox } from "@/components/forms";
import { createAddressAction, updateAddressAction, type AddressData } from "@/features/profile";
import type {Address , ActionState } from "@/types";
import { useTranslations } from "next-intl";

interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAddress?: Address | null;
}

const initialState: ActionState<AddressData, Address> = { status: "idle", message: "" };

export function AddressFormDialog({ open, onClose, onSuccess, editingAddress }: AddressFormDialogProps) {
  const isEdit = !!editingAddress;
  const t = useTranslations("Profile.AddressesTab");

  const boundUpdateAction = editingAddress
    ? updateAddressAction.bind(null, editingAddress.id)
    : null;

  const [state, action] = useActionState(
    isEdit && boundUpdateAction ? boundUpdateAction : createAddressAction,
    initialState
  );

  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onSuccess();
      onClose();
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.message, state.fieldErrors]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pt-8">
          <DialogTitle className="font-chillax text-[18px] font-semibold">
            {isEdit ? t("editAddress") : t("addNewAddress")}
          </DialogTitle>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("titleLabel")}
              name="title"
              placeholder={t("titlePlaceholder")}
              defaultValue={state.inputs?.title ?? editingAddress?.title ?? ""}
              error={fe.title?.[0] ? t(fe.title[0] as never) : undefined}
            />
            <Input
              label={t("phoneLabel")}
              name="phone"
              placeholder={t("phonePlaceholder")}
              defaultValue={state.inputs?.phone ?? editingAddress?.phone ?? ""}
              error={fe.phone?.[0] ? t(fe.phone[0] as never) : undefined}
            />
          </div>

          <Input
            label={t("streetLabel")}
            name="street"
            placeholder={t("streetPlaceholder")}
            defaultValue={state.inputs?.street ?? editingAddress?.street ?? ""}
            error={fe.street?.[0] ? t(fe.street[0] as never) : undefined}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("cityLabel")}
              name="city"
              placeholder={t("cityPlaceholder")}
              defaultValue={state.inputs?.city ?? editingAddress?.city ?? ""}
              error={fe.city?.[0] ? t(fe.city[0] as never) : undefined}
            />
            <Input
              label={t("buildingOptional")}
              name="building"
              placeholder={t("buildingPlaceholder")}
              defaultValue={state.inputs?.building ?? editingAddress?.building ?? ""}
              error={fe.building?.[0] ? t(fe.building[0] as never) : undefined}
            />
          </div>

          <Checkbox
            name="is_default"
            label={t("setAsDefaultAddress")}
            defaultChecked={editingAddress?.is_default ?? false}
          />

          <div className="flex items-center gap-4 pt-2">
            <SubmitButton
              pendingText={t("saving")}
              className="rounded-[5px] bg-primary px-8 py-2.5  text-[14px] text-white hover:bg-primary/90"
            >
              {isEdit ? t("saveChanges") : t("addAddress")}
            </SubmitButton>
            <button
              type="button"
              onClick={onClose}
              className="border-b border-primary pb-0.5 font-chillax text-[14px] font-medium text-[#EDEFF0] transition hover:opacity-60 cursor-pointer"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
