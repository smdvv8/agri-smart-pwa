"use client";

import { useEffect, useState } from "react";
import { Bot, Droplets, Leaf } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type History = {
  diagnoses: Array<{
    id: string;
    detectedProblem: string;
    confidence: number;
    createdAt: string;
    crop: CropDto;
    region: RegionDto;
  }>;
  irrigations: Array<{
    id: string;
    soilType: string;
    growthStage: string;
    createdAt: string;
    crop: CropDto;
    region: RegionDto;
  }>;
  chats: Array<{ id: string; question: string; answer: string; createdAt: string }>;
};

export function HistoryClient() {
  const [history, setHistory] = useState<History | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<History>("/api/history")
      .then(setHistory)
      .catch((err) => setError(err instanceof Error ? err.message : "History error"));
  }, []);

  if (error) return <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">{error}</div>;
  if (!history) return <div className="h-96 rounded-2xl skeleton" />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-normal">История</h1>
        <p className="mt-2 text-sm text-zinc-500">Последние AI-запросы и сохраненные результаты.</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-3">
        <HistoryColumn icon={Leaf} title="Диагностика">
          {history.diagnoses.map((item) => (
            <Item key={item.id} title={item.detectedProblem} meta={`${item.crop.nameRu}, ${item.region.name} · ${formatDate(item.createdAt)}`} />
          ))}
        </HistoryColumn>
        <HistoryColumn icon={Droplets} title="Полив">
          {history.irrigations.map((item) => (
            <Item key={item.id} title={item.crop.nameRu} meta={`${item.growthStage}, ${item.soilType} · ${formatDate(item.createdAt)}`} />
          ))}
        </HistoryColumn>
        <HistoryColumn icon={Bot} title="ИИ-чат">
          {history.chats.map((item) => (
            <Item key={item.id} title={item.question} meta={formatDate(item.createdAt)} />
          ))}
        </HistoryColumn>
      </section>
    </div>
  );
}

function HistoryColumn({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="mt-4 space-y-3">{children || <Empty />}</div>
    </div>
  );
}

function Item({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
      <p className="line-clamp-2 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{meta}</p>
    </div>
  );
}

function Empty() {
  return <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950">Пока пусто.</p>;
}
