import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logoutAction } from "@/actions/logoutAction";
import { User } from "@/types";
import { useWishlistStore } from "./wishlist-store";
import { useCartStore } from "./cart-store";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: !!user }),
      logout: async () => {
        await logoutAction();
        set({ user: null, isAuthenticated: false });
        useWishlistStore.getState().setWishlistIds([]);
        useCartStore.getState().setItems(0, {});
      }
    }),
    {
      name: "auth-storage"
    }
  )
);
