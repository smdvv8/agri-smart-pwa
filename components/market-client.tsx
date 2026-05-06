"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Phone, Plus, Search, SlidersHorizontal } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, ProductDto, RegionDto } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/components/i18n/language-provider";

export function MarketClient() {
  const { t } = useI18n();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [q, setQ] = useState("");
  const [cropId, setCropId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) => {
      setCrops(data.crops);
      setRegions(data.regions);
    });
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cropId) params.set("cropId", cropId);
    if (regionId) params.set("regionId", regionId);
    return params.toString();
  }, [q, cropId, regionId]);

  useEffect(() => {
    apiFetch<{ products: ProductDto[] }>(`/api/market${query ? `?${query}` : ""}`)
      .then((data) => {
        setProducts(data.products);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Market error"));
  }, [query]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            {t("market.provider")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal">{t("market.title")}</h1>
        </div>
        <Link
          href="/market/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("market.add")}
        </Link>
      </header>

      <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-900 md:grid-cols-[1fr_14rem_14rem]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("market.searchPlaceholder")} />
        </label>
        <select className="input" value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">{t("market.allCrops")}</option>
          {crops.map((crop) => (
            <option key={crop.id} value={crop.id}>
              {crop.nameRu}
            </option>
          ))}
        </select>
        <select className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="">{t("market.allRegions")}</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </section>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {error}
        </div>
      ) : null}

      {products.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-900"
            >
              {product.photoUrl ? (
                <Image src={product.photoUrl} alt={product.title} width={700} height={420} className="h-52 w-full object-cover" />
              ) : (
                <div className="flex h-52 items-center justify-center bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <SlidersHorizontal className="h-10 w-10" aria-hidden />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black">{product.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {product.crop.nameRu}, {product.region.name}, {product.district}
                    </p>
                  </div>
                  <p className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {product.description}
                </p>
                <div className="mt-5 flex gap-2">
                  <Link
                    href={`/market/${product.id}`}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-bold text-zinc-900 dark:bg-zinc-950 dark:text-white"
                  >
                    {t("common.details")}
                  </Link>
                  <a
                    href={`tel:${product.phone}`}
                    className="inline-flex h-11 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white"
                    aria-label="Позвонить"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-800">
          {t("market.notFound")}
        </div>
      )}
    </div>
  );
}
