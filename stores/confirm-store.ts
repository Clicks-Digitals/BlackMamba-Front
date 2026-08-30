import { create } from "zustand";
import type { ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  icon?: ReactNode;
  onConfirm: () => void;
}

export interface ConfirmState {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant: "default" | "destructive" | "success" | "warning" | "info";
  icon: ReactNode | null;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: (() => void) | null;
  open: (options: ConfirmOptions) => void;
  close: () => void;
  setPending: (pending: boolean) => void;
}

export const useConfirm = create<ConfirmState>((set) => ({
  title: "",
  description: undefined,
  confirmLabel: "",
  cancelLabel: undefined,
  variant: "destructive",
  icon: null,
  isOpen: false,
  isPending: false,
  onConfirm: null,
  open: (options) =>
    set({
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      variant: options.variant ?? "destructive",
      icon: options.icon ?? null,
      isOpen: true,
      onConfirm: () => options.onConfirm(),
    }),
  close: () => set({ isOpen: false, onConfirm: null }),
  setPending: (pending) => set({ isPending: pending }),
}));
