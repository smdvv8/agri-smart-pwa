"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, ProductDto, RegionDto } from "@/lib/types";
import { useI18n } from "@/components/i18n/language-provider";

type PriceAdvice = {
  recommended_price: string;
  reason_ru: string;
  selling_tip_ru: string;
  description_improvement_ru: string;
};

export function MarketForm() {
  const { t } = useI18n();
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [advice, setAdvice] = useState<PriceAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) => {
      setCrops(data.crops);
      setRegions(data.regions);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ product: ProductDto }>("/api/market", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      setProduct(data.product);
      setAdvice(null);
      toast.success(t("market.published"));
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка публикации");
    } finally {
      setLoading(false);
    }
  }

  async function requestAdvice() {
    if (!product) return;
    setAdviceLoading(true);
    try {
      const data = await apiFetch<{ advice: PriceAdvice }>("/api/ai/market-price-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quality: "standard" }),
      });
      setAdvice(data.advice);
      toast.success("ИИ-рекомендация готова");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка рекомендации цены");
    } finally {
      setAdviceLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h1 className="text-2xl font-black tracking-normal">{t("market.newTitle")}</h1>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t("common.title")}>
            <input className="input" name="title" required placeholder="Свежие томаты" />
          </Field>
          <Field label={t("common.crop")}>
            <select className="input" name="cropId" required>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.nameRu}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("common.price")}>
            <input className="input" type="number" name="price" min="0.01" step="0.01" required />
          </Field>
          <Field label={t("common.quantity")}>
            <input className="input" type="number" name="quantity" min="0.1" step="0.1" required />
          </Field>
          <Field label={t("common.unit")}>
            <input className="input" name="unit" placeholder="кг, тонна, ящик" required />
          </Field>
          <Field label={t("common.region")}>
            <select className="input" name="regionId" required>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("common.district")}>
            <input className="input" name="district" required placeholder="Исфара" />
          </Field>
          <Field label={t("common.phone")}>
            <input className="input" name="phone" required placeholder="+992..." />
          </Field>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">{t("common.description")}</span>
            <textarea
              className="input min-h-28"
              name="description"
              required
              minLength={10}
              maxLength={2000}
              placeholder="Сорт, качество, доставка..."
            />
          </label>
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950 sm:col-span-2">
            <UploadCloud className="h-8 w-8 text-emerald-700 dark:text-emerald-300" aria-hidden />
            <span className="mt-2 text-sm font-semibold">{t("market.photoHint")}</span>
            <input className="sr-only" type="file" name="photo" accept="image/png,image/jpeg,image/webp" />
          </label>
          <button
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 sm:col-span-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {t("market.publish")}
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h2 className="text-xl font-black">{t("market.priceAssistant")}</h2>
        {product ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="font-bold">{product.title}</p>
              <p className="mt-1 text-sm text-zinc-500">
                Товар сохранен. Можно запросить рекомендацию цены.
              </p>
            </div>
            <button
              onClick={requestAdvice}
              disabled={adviceLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
            >
              {adviceLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {t("market.priceAdvice")}
            </button>
            {advice ? (
              <div className="space-y-3">
                <Advice title="Рекомендуемая цена" text={advice.recommended_price} />
                <Advice title="Причина" text={advice.reason_ru} />
                <Advice title="Совет продажи" text={advice.selling_tip_ru} />
                <Advice title="Улучшить описание" text={advice.description_improvement_ru} />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500 dark:bg-zinc-950">
            {t("market.priceAssistantEmpty")}
          </p>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Advice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p>
    </div>
  );
}
