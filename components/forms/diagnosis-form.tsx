"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto } from "@/lib/types";
import { useI18n } from "@/components/i18n/language-provider";

type PlanDay = {
  day: number;
  actions: string[];
};

type DiagnosisAdvice = {
  detected_problem: string;
  confidence: number;
  risk_level: string;
  simple_explanation_ru: string;
  simple_explanation_tj: string;
  what_to_do_today_ru: string[];
  what_to_do_today_tj: string[];
  watering_advice_ru: string;
  watering_advice_tj: string;
  three_day_plan_ru: PlanDay[];
  three_day_plan_tj: PlanDay[];
  water_saving_tip_ru: string;
  water_saving_tip_tj: string;
  when_to_call_agronomist_ru: string;
  when_to_call_agronomist_tj: string;
  disclaimer_ru: string;
  disclaimer_tj: string;
  photoUrl: string;
};

export function DiagnosisForm() {
  const { language, t } = useI18n();
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [cropId, setCropId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [soilType, setSoilType] = useState("суглинистая");
  const [growthStage, setGrowthStage] = useState("рост");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<DiagnosisAdvice | null>(null);

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) => {
      setCrops(data.crops);
      setRegions(data.regions);
      setCropId(data.crops[0]?.id || "");
      setRegionId(data.regions[0]?.id || "");
    });
  }, []);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      toast.error(t("diagnosis.photoRequired"));
      return;
    }

    const formData = new FormData();
    formData.set("cropId", cropId);
    formData.set("regionId", regionId);
    formData.set("soilType", soilType);
    formData.set("growthStage", growthStage);
    formData.set("photo", photo);

    try {
      setLoading(true);
      const data = await apiFetch<{ success: true; data: DiagnosisAdvice }>(
        "/api/ai/diagnose-plant",
        { method: "POST", body: formData },
      );
      setAdvice(data.data);
      toast.success(t("diagnosis.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("diagnosis.failed"));
    } finally {
      setLoading(false);
    }
  }

  const todayActions = advice
    ? language === "TJ"
      ? advice.what_to_do_today_tj
      : advice.what_to_do_today_ru
    : [];
  const plan = advice
    ? language === "TJ"
      ? advice.three_day_plan_tj
      : advice.three_day_plan_ru
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h1 className="text-2xl font-black tracking-normal">{t("diagnosis.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("diagnosis.subtitle")}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label={t("common.crop")}>
            <select className="input" value={cropId} onChange={(event) => setCropId(event.target.value)}>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.nameRu} / {crop.nameTj}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("common.region")}>
            <select className="input" value={regionId} onChange={(event) => setRegionId(event.target.value)}>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} / {region.nameTj}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("irrigation.soil")}>
            <input className="input" value={soilType} onChange={(event) => setSoilType(event.target.value)} />
          </Field>
          <Field label={t("irrigation.stage")}>
            <input className="input" value={growthStage} onChange={(event) => setGrowthStage(event.target.value)} />
          </Field>
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-44 rounded-2xl object-contain" />
            ) : (
              <>
                <UploadCloud className="h-9 w-9 text-emerald-700 dark:text-emerald-300" aria-hidden />
                <span className="mt-3 text-sm font-semibold">{t("diagnosis.uploadHint")}</span>
              </>
            )}
            <input
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setPhoto(event.target.files?.[0] || null)}
            />
          </label>
          <button
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {t("diagnosis.submit")}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h2 className="text-xl font-black">{t("diagnosis.result")}</h2>
        {advice ? (
          <div className="mt-5 space-y-4">
            <Image
              src={advice.photoUrl}
              alt={t("diagnosis.result")}
              width={900}
              height={520}
              className="max-h-72 w-full rounded-2xl object-cover"
            />
            <div className="rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-950">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{t("diagnosis.problem")}</p>
              <p className="mt-1 text-2xl font-black">{advice.detected_problem}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Confidence: {Math.round(advice.confidence * 100)}%, risk: {advice.risk_level}
              </p>
            </div>
            <AdviceBlock
              title={t("diagnosis.explanation")}
              text={language === "TJ" ? advice.simple_explanation_tj : advice.simple_explanation_ru}
            />
            <AdviceList title={t("diagnosis.today")} items={todayActions} />
            <AdviceBlock
              title={t("diagnosis.watering")}
              text={language === "TJ" ? advice.watering_advice_tj : advice.watering_advice_ru}
            />
            <div>
              <p className="text-sm font-bold">{t("diagnosis.plan")}</p>
              <div className="mt-2 space-y-2">
                {plan.map((day) => (
                  <div key={day.day} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                    <p className="font-bold">
                      {t("diagnosis.day")} {day.day}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                      {day.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <AdviceBlock
              title={t("diagnosis.waterSaving")}
              text={language === "TJ" ? advice.water_saving_tip_tj : advice.water_saving_tip_ru}
            />
            <AdviceBlock
              title={t("diagnosis.callAgronomist")}
              text={
                language === "TJ"
                  ? advice.when_to_call_agronomist_tj
                  : advice.when_to_call_agronomist_ru
              }
            />
            <p className="text-xs text-zinc-500">
              {language === "TJ" ? advice.disclaimer_tj : advice.disclaimer_ru}
            </p>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500 dark:bg-zinc-950">
            {t("diagnosis.empty")}
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

function AdviceBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p>
    </div>
  );
}

function AdviceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-bold">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
