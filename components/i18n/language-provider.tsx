"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translate, type AppLanguage, type TranslationKey } from "@/lib/i18n";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "agri-smart-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") return "RU";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "RU" || stored === "TJ" ? stored : "RU";
  });

  const value = useMemo<LanguageContextValue>(() => {
    function setLanguage(nextLanguage: AppLanguage) {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage === "TJ" ? "tg" : "ru";
    }

    return {
      language,
      setLanguage,
      t: (key) => translate(language, key),
    };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language === "TJ" ? "tg" : "ru";
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }

  return context;
}
