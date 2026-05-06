"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto } from "@/lib/types";

export function CropGuideClient() {
  const [crops, setCrops] = useState<CropDto[]>([]);

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) =>
      setCrops(data.crops),
    );
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
          Seed data
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-normal">Справочник культур</h1>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {crops.map((crop) => (
          <Link
            href={`/crop-guide/${crop.id}`}
            key={crop.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-soft dark:border-zinc-900 dark:bg-zinc-900"
          >
            <Sprout className="h-7 w-7 text-emerald-600" aria-hidden />
            <h2 className="mt-5 text-xl font-black">{crop.nameRu}</h2>
            <p className="mt-1 text-sm text-zinc-500">{crop.nameTj}</p>
            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {crop.careTipsRu}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function CropDetailClient({ id }: { id: string }) {
  const [crop, setCrop] = useState<CropDto | null>(null);

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) =>
      setCrop(data.crops.find((item) => item.id === id) || null),
    );
  }, [id]);

  if (!crop) return <div className="h-96 rounded-2xl skeleton" />;

  return (
    <div className="space-y-6">
      <Link href="/crop-guide" className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
        Назад к культурам
      </Link>
      <header className="rounded-3xl bg-emerald-700 p-6 text-white">
        <p className="text-emerald-100">{crop.nameTj}</p>
        <h1 className="mt-2 text-4xl font-black tracking-normal">{crop.nameRu}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50">
          Сезон: {crop.season}. Урожай: {crop.harvestTimeRu}.
        </p>
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        <GuideBlock title="Полив" text={crop.wateringGuideRu} />
        <GuideBlock title="Уход" text={crop.careTipsRu} />
        <GuideBlock title="Частые болезни" text={crop.commonDiseasesRu} />
        <GuideBlock title="Вақти ҳосил" text={crop.harvestTimeTj} />
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h2 className="text-xl font-black">Болезни</h2>
        <div className="mt-4 grid gap-3">
          {crop.diseases?.map((disease) => (
            <div key={disease.id} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="font-bold">{disease.nameRu}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {disease.symptomsRu}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {disease.treatmentRu}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GuideBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
      <h2 className="font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p>
    </div>
  );
}
