"use client";

import { create } from "zustand";

type AppState = {
  preferredLanguage: "RU" | "TJ";
  setPreferredLanguage: (language: "RU" | "TJ") => void;
  installBannerDismissed: boolean;
  dismissInstallBanner: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  preferredLanguage: "RU",
  setPreferredLanguage: (preferredLanguage) => set({ preferredLanguage }),
  installBannerDismissed: false,
  dismissInstallBanner: () => set({ installBannerDismissed: true }),
}));
