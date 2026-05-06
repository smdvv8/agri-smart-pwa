"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { LanguageProvider } from "@/components/i18n/language-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <ServiceWorkerRegister />
        {children}
        <InstallPrompt />
        <Toaster richColors position="top-center" />
      </LanguageProvider>
    </ThemeProvider>
  );
}
