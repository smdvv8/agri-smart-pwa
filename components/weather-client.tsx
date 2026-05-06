"use client";

import { useEffect, useState } from "react";
import { CloudRain, CloudSun, Droplets, Wind } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto, WeatherDto } from "@/lib/types";
import { useI18n } from "@/components/i18n/language-provider";

export function WeatherClient() {
  const { t } = useI18n();
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [regionId, setRegionId] = useState("");
  const [weather, setWeather] = useState<WeatherDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) => {
      setRegions(data.regions);
      setRegionId(data.regions[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!regionId) return;
    apiFetch<{ weather: WeatherDto }>(`/api/weather/${regionId}`)
      .then((data) => {
        setWeather(data.weather);
        setError("");
      })
      .catch((err) => {
        setWeather(null);
        setError(err instanceof Error ? err.message : "Weather error");
      });
  }, [regionId]);

  const chartData =
    weather?.forecast.map((day) => ({
      day: new Date(day.date).toLocaleDateString("ru-RU", { weekday: "short" }),
      max: Math.round(day.tempMax),
      min: Math.round(day.tempMin),
      rain: day.rainProbability,
    })) || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            {t("weather.provider")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal">{t("weather.title")}</h1>
        </div>
        <select className="input max-w-xs" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name} / {region.nameTj}
            </option>
          ))}
        </select>
      </header>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {error}
        </div>
      ) : null}

      {!weather && !error ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl skeleton" />
          ))}
        </div>
      ) : null}

      {weather ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <WeatherMetric icon={CloudSun} label={t("weather.temperature")} value={`${weather.temperature}°C`} />
            <WeatherMetric icon={Droplets} label={t("weather.humidity")} value={`${weather.humidity}%`} />
            <WeatherMetric icon={Wind} label={t("weather.wind")} value={`${weather.windSpeed} м/с`} />
            <WeatherMetric icon={CloudRain} label={t("weather.rain")} value={`${weather.rainProbability}%`} />
          </section>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
            <h2 className="text-lg font-black">{t("weather.forecast")}</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="max" stroke="#16a34a" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="min" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="rain" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function WeatherMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
      <Icon className="h-7 w-7 text-emerald-600" aria-hidden />
      <p className="mt-5 text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}
