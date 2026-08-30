import { create } from "zustand";

type CategoryDrawerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useCategoryDrawer = create<CategoryDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
