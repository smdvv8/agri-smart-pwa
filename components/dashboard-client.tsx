"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CloudSun,
  Droplets,
  Leaf,
  PackagePlus,
  ShoppingBasket,
} from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto, UserDto, WeatherDto } from "@/lib/types";
import { useI18n } from "@/components/i18n/language-provider";

type Health = {
  providers: Record<string, "configured" | "missing">;
};

type HistoryResponse = {
  diagnoses: Array<{ id: string; detectedProblem: string; createdAt: string; crop: CropDto }>;
  irrigations: Array<{ id: string; createdAt: string; crop: CropDto }>;
};

export function DashboardClient() {
  const { t } = useI18n();
  const [user, setUser] = useState<UserDto | null>(null);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [weather, setWeather] = useState<WeatherDto | null>(null);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    apiFetch<{ user: UserDto }>("/api/auth/me").then((data) => setUser(data.user));
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) =>
      setRegions(data.regions),
    );
    apiFetch<Health>("/api/health").then(setHealth);
    apiFetch<HistoryResponse>("/api/history").then(setHistory).catch(() => undefined);
  }, []);

  const selectedRegion = useMemo(() => {
    if (!regions.length) return null;
    return (
      regions.find((region) => region.name === user?.region || region.nameTj === user?.region) ||
      regions[0]
    );
  }, [regions, user]);

  useEffect(() => {
    if (!selectedRegion) return;
    apiFetch<{ weather: WeatherDto }>(`/api/weather/${selectedRegion.id}`)
      .then((data) => {
        setWeather(data.weather);
        setWeatherError("");
      })
      .catch((error) => setWeatherError(error instanceof Error ? error.message : "Weather error"));
  }, [selectedRegion]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-emerald-700 p-6 text-white shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-100">{t("dashboard.welcome")}</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
              {user?.fullName || "Фермер"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
              {t("common.region")}: {selectedRegion?.name || user?.region || t("common.empty")}. {t("dashboard.realApiNote")}
            </p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
            {weather ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-emerald-50">{weather.description}</p>
                  <p className="mt-2 text-4xl font-black">{weather.temperature}°C</p>
                </div>
                <CloudSun className="h-12 w-12 text-emerald-100" aria-hidden />
              </div>
            ) : (
              <p className="text-sm text-emerald-50">
                {weatherError || "Загрузка погоды..."}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { href: "/irrigation", label: t("dashboard.quickIrrigation"), icon: Droplets },
          { href: "/diagnosis", label: t("dashboard.quickDiagnosis"), icon: Leaf },
          { href: "/ai-chat", label: t("dashboard.quickChat"), icon: Bot },
          { href: "/market", label: t("dashboard.quickMarket"), icon: ShoppingBasket },
          { href: "/market/new", label: t("dashboard.quickAddProduct"), icon: PackagePlus },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-zinc-900 dark:bg-zinc-900"
            >
              <Icon className="h-7 w-7 text-emerald-600" aria-hidden />
              <p className="mt-5 text-sm font-bold">{item.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
          <h2 className="text-lg font-black">{t("dashboard.latestDiagnosis")}</h2>
          <div className="mt-4 space-y-3">
            {history?.diagnoses.length ? (
              history.diagnoses.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="font-semibold">{item.detectedProblem}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.crop.nameRu}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950">
                {t("dashboard.noDiagnosis")}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
          <h2 className="text-lg font-black">{t("dashboard.services")}</h2>
          <div className="mt-4 space-y-2">
            {health
              ? Object.entries(health.providers).map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-950"
                  >
                    <span className="font-medium">{name}</span>
                    <span
                      className={
                        status === "configured" ? "text-emerald-600" : "text-amber-600"
                      }
                    >
                      {status}
                    </span>
                  </div>
                ))
              : Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-11 rounded-2xl skeleton" />
                ))}
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-5 text-zinc-500">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            {t("dashboard.noFake")}
          </p>
        </div>
      </section>
    </div>
  );
}
