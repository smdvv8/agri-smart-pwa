"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CloudSun,
  Download,
  Leaf,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sprout,
  Waves,
} from "lucide-react";
import { useI18n } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

const features = [
  {
    icon: Waves,
    titleRu: "ИИ-совет по поливу",
    titleTj: "Маслиҳати ИИ барои обёрӣ",
    textRu: "OpenAI анализирует культуру, почву, регион и реальную погоду.",
    textTj: "OpenAI зироат, хок, минтақа ва ҳавои воқеиро таҳлил мекунад.",
  },
  {
    icon: Leaf,
    titleRu: "Фото-анализ растений",
    titleTj: "Фото-таҳлили растанӣ",
    textRu: "Фото хранится в Cloudinary, классификация идет через Hugging Face.",
    textTj: "Фото дар Cloudinary нигоҳ мешавад, таҳлил тавассути Hugging Face меравад.",
  },
  {
    icon: CloudSun,
    titleRu: "Погода по региону",
    titleTj: "Обу ҳаво аз рӯи минтақа",
    textRu: "Сервер получает координаты из PostgreSQL и обращается к OpenWeatherMap.",
    textTj: "Сервер координатаҳоро аз PostgreSQL мегирад ва ба OpenWeatherMap муроҷиат мекунад.",
  },
  {
    icon: ShoppingBasket,
    titleRu: "Маркет урожая",
    titleTj: "Бозори ҳосил",
    textRu: "Фермеры публикуют товары, покупатели ищут и звонят напрямую.",
    textTj: "Деҳқонон маҳсулот мегузоранд, харидорон меҷӯянд ва занг мезананд.",
  },
];

const steps = [
  {
    ru: "Фермер выбирает регион и культуру",
    tj: "Деҳқон минтақа ва зироатро интихоб мекунад",
  },
  {
    ru: "Сервер берет реальные данные из PostgreSQL и внешних API",
    tj: "Сервер маълумоти воқеиро аз PostgreSQL ва API мегирад",
  },
  {
    ru: "ИИ возвращает понятный план действий на русском и таджикском",
    tj: "ИИ нақшаи фаҳморо бо русӣ ва тоҷикӣ медиҳад",
  },
];

export function Landing() {
  const { language, t } = useI18n();
  const reduceMotion = useReducedMotion();

  return (
    <main className="bg-white text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1800&q=85"
          alt="Орошаемое сельскохозяйственное поле"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <LanguageSwitcher />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pb-28 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <Sprout className="h-4 w-4" aria-hidden />
              {t("landing.badge")}
            </div>
            <h1 className="text-balance text-5xl font-black tracking-normal text-white sm:text-6xl lg:text-7xl">
              {t("app.name")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              {t("landing.heroText")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-700"
              >
                {t("landing.start")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
              >
                {t("landing.login")}
              </Link>
              <a
                href="#install"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                <Download className="h-4 w-4" aria-hidden />
                {t("landing.installPwa")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="-mt-20 bg-white pb-16 dark:bg-zinc-950">
        <div className="relative z-20 mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.titleRu}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft dark:border-zinc-900 dark:bg-zinc-900"
              >
                <Icon className="h-7 w-7 text-emerald-600" aria-hidden />
                <h2 className="mt-4 text-base font-bold">
                  {language === "TJ" ? feature.titleTj : feature.titleRu}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {language === "TJ" ? feature.textTj : feature.textRu}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-900 dark:bg-zinc-900/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              {t("landing.problem")}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
              {t("landing.problemTitle")}
            </h2>
            <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-300">
              {t("landing.problemText")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.ru}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="font-mono text-3xl font-black text-emerald-600">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-semibold leading-6">
                  {language === "TJ" ? step.tj : step.ru}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="install" className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-black tracking-normal">{t("landing.pwaTitle")}</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300">{t("landing.pwaText")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {[
              { icon: Smartphone, title: "Android", text: "Install app / Add to Home Screen" },
              { icon: Download, title: "iPhone", text: "Share / Add to Home Screen" },
              { icon: ShieldCheck, title: "Security", text: "JWT httpOnly, bcrypt, role checks" },
              { icon: Bot, title: "Real AI", text: "OpenAI + Hugging Face без fake-ответов" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
                >
                  <Icon className="h-6 w-6 text-emerald-600" aria-hidden />
                  <h3 className="mt-4 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
