"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900",
        compact ? "gap-0" : "gap-1",
      )}
      aria-label={t("common.language")}
    >
      {!compact ? <Languages className="ml-2 h-4 w-4 text-zinc-500" aria-hidden /> : null}
      {(["RU", "TJ"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-500 transition",
            language === item &&
              "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-300",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
