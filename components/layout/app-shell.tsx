"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bot,
  CloudSun,
  Droplets,
  History,
  Home,
  Leaf,
  LogOut,
  Moon,
  PackagePlus,
  Settings,
  Shield,
  ShoppingBasket,
  Sprout,
  Sun,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/language-provider";
import { apiFetch } from "@/lib/client-api";
import type { UserDto } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n";

type NavItem = {
  href: string;
  label: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "nav.dashboard", icon: Home },
  { href: "/weather", label: "nav.weather", icon: CloudSun },
  { href: "/irrigation", label: "nav.irrigation", icon: Droplets },
  { href: "/diagnosis", label: "nav.diagnosis", icon: Leaf },
  { href: "/market", label: "nav.market", icon: ShoppingBasket },
  { href: "/ai-chat", label: "nav.aiChat", icon: Bot },
  { href: "/crop-guide", label: "nav.cropGuide", icon: Sprout },
  { href: "/history", label: "nav.history", icon: History },
];

const secondaryItems: NavItem[] = [
  { href: "/market/new", label: "nav.addProduct", icon: PackagePlus },
  { href: "/profile", label: "nav.profile", icon: User },
  { href: "/settings", label: "nav.settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    apiFetch<{ user: UserDto }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const allItems = useMemo(
    () =>
      user?.role === "ADMIN"
        ? [...navItems, { href: "/admin", label: "nav.admin" as const, icon: Shield }]
        : navItems,
    [user?.role],
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(t("auth.logout"));
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors duration-200 dark:bg-zinc-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white/90 p-4 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/90 lg:block">
        <Brand />
        <nav className="mt-6 space-y-1">
          {allItems.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-900">
          {secondaryItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              compact
            />
          ))}
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-zinc-200 p-3 dark:border-zinc-900">
          <p className="truncate text-sm font-semibold">{user?.fullName || t("auth.farmer")}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email || t("common.loading")}</p>
          <div className="mt-3 flex gap-2">
            <ThemeToggle />
            <LanguageSwitcher compact />
            <button
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={logout}
              aria-label={t("auth.logout")}
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </aside>
      <main className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pl-72">
        <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/95 sm:-mx-6 sm:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Brand compact />
            <div className="flex items-center gap-2">
              <LanguageSwitcher compact />
              <ThemeToggle compact />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/95 lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {allItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-medium text-zinc-500 transition",
                  active &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                )}
              >
                <Icon className="mb-1 h-5 w-5" aria-hidden />
                {t(item.label)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  const { t } = useI18n();

  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
        <Leaf className="h-6 w-6" aria-hidden />
      </span>
      <span className={compact ? "sr-only" : undefined}>
        <span className="block text-lg font-bold">{t("app.name")}</span>
        <span className="text-xs text-zinc-500">{t("app.tagline")}</span>
      </span>
    </Link>
  );
}

function ThemeToggle({ compact }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
        compact ? "w-10" : "flex-1",
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("common.theme")}
      type="button"
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

function NavLink({
  item,
  active,
  compact,
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const { t } = useI18n();

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
        active &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        compact && "py-2.5 text-xs",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {t(item.label)}
    </Link>
  );
}
