"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto } from "@/lib/types";
import { irrigationSchema } from "@/lib/validators";
import { useI18n } from "@/components/i18n/language-provider";

type IrrigationAdvice = {
  irrigation_needed: boolean;
  best_time_ru: string;
  water_amount_ru: string;
  reason_ru: string;
  rain_warning_ru: string;
  water_saving_ru: string[];
  disclaimer_ru: string;
};

export function IrrigationForm() {
  const { t } = useI18n();
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [advice, setAdvice] = useState<IrrigationAdvice | null>(null);
  type IrrigationInput = z.input<typeof irrigationSchema>;
  type IrrigationOutput = z.output<typeof irrigationSchema>;
  const form = useForm<IrrigationInput, unknown, IrrigationOutput>({
    resolver: zodResolver(irrigationSchema),
    defaultValues: {
      cropId: "",
      regionId: "",
      soilType: "суглинистая",
      growthStage: "рост",
      fieldSize: 1,
      dripIrrigation: false,
    },
  });

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) => {
      setCrops(data.crops);
      setRegions(data.regions);
      form.setValue("cropId", data.crops[0]?.id || "");
      form.setValue("regionId", data.regions[0]?.id || "");
    });
  }, [form]);

  async function onSubmit(values: IrrigationOutput) {
    try {
      const data = await apiFetch<{ advice: IrrigationAdvice }>("/api/ai/irrigation-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setAdvice(data.advice);
      toast.success(t("irrigation.result"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка ИИ-совета");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h1 className="text-2xl font-black tracking-normal">{t("irrigation.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("irrigation.subtitle")}
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Select label={t("common.region")} {...form.register("regionId")}>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name} / {region.nameTj}
              </option>
            ))}
          </Select>
          <Select label={t("common.crop")} {...form.register("cropId")}>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.nameRu} / {crop.nameTj}
              </option>
            ))}
          </Select>
          <Field label={t("irrigation.soil")}>
            <input className="input" {...form.register("soilType")} />
          </Field>
          <Field label={t("irrigation.stage")}>
            <input className="input" {...form.register("growthStage")} />
          </Field>
          <Field label={t("irrigation.fieldSize")}>
            <input className="input" type="number" step="0.1" {...form.register("fieldSize")} />
          </Field>
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <input type="checkbox" {...form.register("dripIrrigation")} />
            <span className="text-sm font-semibold">{t("irrigation.drip")}</span>
          </label>
          <button
            disabled={form.formState.isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {t("irrigation.submit")}
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h2 className="text-xl font-black">{t("irrigation.result")}</h2>
        {advice ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50">
              <p className="text-sm">{t("irrigation.needed")}</p>
              <p className="mt-1 text-3xl font-black">{advice.irrigation_needed ? t("irrigation.yes") : t("irrigation.no")}</p>
            </div>
            <Advice label="Лучшее время" value={advice.best_time_ru} />
            <Advice label="Количество воды" value={advice.water_amount_ru} />
            <Advice label="Причина" value={advice.reason_ru} />
            <Advice label="Дождь" value={advice.rain_warning_ru} />
            <div>
              <p className="text-sm font-bold">Экономия воды</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                {advice.water_saving_ru.map((tip) => (
                  <li key={tip} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-zinc-500">{advice.disclaimer_ru}</p>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500 dark:bg-zinc-950">
            Заполните форму. Здесь появится structured JSON от OpenAI.
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

function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <select className="input" {...props}>
        {children}
      </select>
    </label>
  );
}

function Advice({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{value}</p>
    </div>
  );
}
