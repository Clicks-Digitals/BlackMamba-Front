import { create } from "zustand";

interface ProductImageState {
  activeVariationImage: string | null;
  setActiveVariationImage: (image: string | null) => void;
}

export const useProductImageStore = create<ProductImageState>((set) => ({
  activeVariationImage: null,
  setActiveVariationImage: (image) => set({ activeVariationImage: image }),
}));
