"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/language-provider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const { t } = useI18n();
  const dismissed = useAppStore((state) => state.installBannerDismissed);
  const dismiss = useAppStore((state) => state.dismissInstallBanner);
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  });

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const handler = (installEvent: Event) => {
      installEvent.preventDefault();
      setEvent(installEvent as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || isStandalone || (!event && !isIOS)) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-soft backdrop-blur dark:border-emerald-900 dark:bg-zinc-950/95 md:bottom-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Download className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-950 dark:text-white">
            {t("pwa.installTitle")}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
            {isIOS
              ? t("pwa.installIos")
              : t("pwa.installAndroid")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {event ? (
              <button
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  await event.prompt();
                  await event.userChoice;
                  dismiss();
                }}
              >
                <Download className="h-4 w-4" aria-hidden />
                {t("common.install")}
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                <Share className="h-4 w-4" aria-hidden />
                Share / Add to Home Screen
              </span>
            )}
          </div>
        </div>
        <button
          aria-label="Закрыть"
          className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={dismiss}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
