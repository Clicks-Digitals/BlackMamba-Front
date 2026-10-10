import { create } from "zustand";

type HeaderSearchState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

/**
 * The mobile search overlay's open state lives here so it can be triggered from
 * the header's overflow menu — the trigger unmounts when the menu closes, so it
 * cannot own the overlay itself.
 */
export const useHeaderSearch = create<HeaderSearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
