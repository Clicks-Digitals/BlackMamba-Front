import { create } from "zustand";

type StoreNavDrawerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useStoreNavDrawer = create<StoreNavDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
