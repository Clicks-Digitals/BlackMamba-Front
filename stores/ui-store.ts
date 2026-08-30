import { create } from "zustand";

export interface SwitchTarget {
  type: "locale" | "currency";
  code: string;
  name: string;
  symbol?: string;
}

interface UiState {
  isAppLoading: boolean;
  switchTarget: SwitchTarget | null;
  setAppLoading: (value: boolean, target?: SwitchTarget) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isAppLoading: false,
  switchTarget: null,
  setAppLoading: (value, target) =>
    set({ isAppLoading: value, switchTarget: value ? (target ?? null) : null }),
}));
