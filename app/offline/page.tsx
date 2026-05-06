import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50">
      <section className="w-full max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 shadow-soft dark:border-emerald-900 dark:bg-zinc-950">
        <WifiOff className="h-10 w-10 text-emerald-600" aria-hidden />
        <h1 className="mt-5 text-3xl font-black tracking-normal">Нет подключения</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
          PWA открывается, но реальные API для погоды, ИИ и Cloudinary требуют интернет.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
        >
          На главную
        </Link>
      </section>
    </main>
  );
}
