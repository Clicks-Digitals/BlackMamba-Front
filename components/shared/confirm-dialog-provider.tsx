"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "./confirm-dialog";
import { useConfirm } from "@/stores";

export function ConfirmDialogProvider() {
  const t = useTranslations("ConfirmDialog");
  const {
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    isPending,
    onConfirm,
    icon,
    close,
  } = useConfirm();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    close();
  };

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={close}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel ?? t("cancel")}
      onConfirm={handleConfirm}
      isPending={isPending}
      variant={variant}
      icon={icon ?? undefined}
    />
  );
}
