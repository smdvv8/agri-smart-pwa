"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ShieldCheck, UserRound } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/language-provider";
import { apiFetch } from "@/lib/client-api";
import type { UserDto } from "@/lib/types";

export function ProfileClient() {
  const { t } = useI18n();
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    apiFetch<{ user: UserDto }>("/api/auth/me").then((data) => setUser(data.user));
  }, []);

  if (!user) return <div className="h-96 rounded-2xl skeleton" />;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-emerald-700 p-6 text-white">
        <UserRound className="h-10 w-10" aria-hidden />
        <h1 className="mt-4 text-3xl font-black tracking-normal">{user.fullName}</h1>
        <p className="mt-2 text-emerald-50">{user.email}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Info label={t("common.phone")} value={user.phone} />
        <Info label={t("common.region")} value={user.region || t("common.empty")} />
        <Info label={t("common.district")} value={user.district || t("common.empty")} />
        <Info label={t("common.language")} value={user.language} />
        <Info label={t("auth.role")} value={user.role} />
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
          <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden />
          <p className="mt-3 text-sm font-bold">{t("profile.security")}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Passwords are stored as bcrypt hashes. JWT stays in an httpOnly cookie.
          </p>
        </div>
      </section>
    </div>
  );
}

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-normal">{t("settings.title")}</h1>
        <p className="mt-2 text-sm text-zinc-500">{t("settings.subtitle")}</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
          <p className="text-sm font-bold">{t("common.language")}</p>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
          <p className="text-sm font-bold">{t("common.theme")}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: "light", label: t("common.light") },
              { value: "dark", label: t("common.dark") },
              { value: "system", label: t("common.system") },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                className={
                  theme === item.value
                    ? "rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white"
                    : "rounded-2xl bg-zinc-100 px-3 py-3 text-sm font-bold text-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <Info label="PWA" value="Manifest, service worker, offline fallback" />
        <Info label="Security" value="Secrets are server-side only" />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}
