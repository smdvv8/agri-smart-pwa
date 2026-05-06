"use client";

import { useEffect, useState } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, RegionDto } from "@/lib/types";
import { useI18n } from "@/components/i18n/language-provider";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function ChatPanel() {
  const { t } = useI18n();
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [cropId, setCropId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [language, setLanguage] = useState<"RU" | "TJ">("RU");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ crops: CropDto[]; regions: RegionDto[] }>("/api/crops").then((data) => {
      setCrops(data.crops);
      setRegions(data.regions);
      setCropId(data.crops[0]?.id || "");
      setRegionId(data.regions[0]?.id || "");
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    const prompt = question;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const data = await apiFetch<{ answer: string }>("/api/ai/agronomist-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, language, regionId, cropId }),
      });
      setMessages((current) => [...current, { role: "assistant", text: data.answer }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка ИИ-чата");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[22rem_1fr]">
      <aside className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <h1 className="text-2xl font-black tracking-normal">{t("chat.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("chat.subtitle")}
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t("common.language")}</span>
            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value as "RU" | "TJ")}>
              <option value="RU">Русский</option>
              <option value="TJ">Тоҷикӣ</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t("common.region")}</span>
            <select className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t("common.crop")}</span>
            <select className="input" value={cropId} onChange={(e) => setCropId(e.target.value)}>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.nameRu}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      <section className="flex min-h-[34rem] flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-900">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length ? (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-2xl rounded-3xl bg-emerald-600 px-5 py-4 text-sm leading-6 text-white"
                      : "max-w-2xl rounded-3xl bg-zinc-50 px-5 py-4 text-sm leading-6 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                  }
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold opacity-75">
                    {message.role === "user" ? (
                      <UserRound className="h-4 w-4" aria-hidden />
                    ) : (
                      <Bot className="h-4 w-4" aria-hidden />
                    )}
                    {message.role === "user" ? t("chat.you") : t("chat.ai")}
                  </div>
                  {message.text}
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-zinc-50 p-6 text-center text-sm text-zinc-500 dark:bg-zinc-950">
              {t("chat.empty")}
            </div>
          )}
        </div>
        <form onSubmit={submit} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex gap-3">
            <input
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("chat.placeholder")}
            />
            <button
              disabled={loading}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              aria-label="Отправить"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
