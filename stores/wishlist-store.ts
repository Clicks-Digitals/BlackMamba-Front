import { create } from "zustand";

interface WishlistState {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  setWishlistIds: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  add: (id) => set((s) => (s.ids.includes(id) ? s : { ids: [...s.ids, id] })),
  remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
  has: (id) => get().ids.includes(id),
  setWishlistIds: (ids) => set({ ids })
}));
