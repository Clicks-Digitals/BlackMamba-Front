import { create } from "zustand";

export interface CartItemRef {
  itemId: string;
  quantity: number;
}

interface CartState {
  count: number;
  itemRefs: Record<string, CartItemRef>;
  setCount: (n: number) => void;
  increment: () => void;
  decrement: () => void;
  setItems: (count: number, refs: Record<string, CartItemRef>) => void;
  getItemRef: (key: string) => CartItemRef | undefined;
  upsertItemRef: (key: string, ref: CartItemRef) => void;
  removeItemRef: (key: string) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  count: 0,
  itemRefs: {},
  setCount: (n) => set({ count: n }),
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
  setItems: (count, refs) => set({ count, itemRefs: refs }),
  getItemRef: (key) => get().itemRefs[key],
  upsertItemRef: (key, ref) =>
    set((s) => ({ itemRefs: { ...s.itemRefs, [key]: ref } })),
  removeItemRef: (key) =>
    set((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = s.itemRefs;
      return { itemRefs: rest };
    })
}));

export function buildCartItemKey(item: {
  product: string | null;
  variation: string | null;
  combination: string | null;
  build?: string | null;
}): string {
  if (item.build) return `build-${item.build}`;
  if (item.combination) return `combo-${item.combination}`;
  if (item.variation) return `var-${item.variation}`;
  return `prod-${item.product}`;
}
