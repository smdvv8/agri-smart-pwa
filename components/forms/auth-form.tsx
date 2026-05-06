"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useI18n } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { loginSchema, registerSchema } from "@/lib/validators";
import { apiFetch } from "@/lib/client-api";
import type { UserDto } from "@/lib/types";

type AuthResponse = { user: UserDto };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      toast.success(t("auth.welcome"));
      router.push(params.get("next") || "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    }
  }

  return (
    <AuthFrame title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t("auth.identifier")} error={form.formState.errors.identifier?.message}>
          <input className="input" placeholder="farmer@example.com" {...form.register("identifier")} />
        </Field>
        <Field label={t("auth.password")} error={form.formState.errors.password?.message}>
          <div className="relative">
            <input
              className="input pr-12"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={t("auth.password")}
            >
              <Eye className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </Field>
        <SubmitButton loading={form.formState.isSubmitting}>{t("auth.login")}</SubmitButton>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-300">
        {t("auth.noAccount")}{" "}
        <Link className="font-semibold text-emerald-700 dark:text-emerald-300" href="/register">
          {t("auth.register")}
        </Link>
      </p>
    </AuthFrame>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { t } = useI18n();
  type RegisterInput = z.input<typeof registerSchema>;
  type RegisterOutput = z.output<typeof registerSchema>;
  const form = useForm<RegisterInput, unknown, RegisterOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      role: "FARMER",
      language: "RU",
      region: "",
      district: "",
    },
  });

  async function onSubmit(values: RegisterOutput) {
    try {
      await apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      toast.success(t("auth.created"));
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    }
  }

  return (
    <AuthFrame title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
        <Field label={t("auth.fullName")} error={form.formState.errors.fullName?.message}>
          <input className="input" placeholder="Abdullo Saidov" {...form.register("fullName")} />
        </Field>
        <Field label={t("common.phone")} error={form.formState.errors.phone?.message}>
          <input className="input" placeholder="+992..." {...form.register("phone")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input className="input" type="email" placeholder="you@example.com" {...form.register("email")} />
        </Field>
        <Field label={t("auth.password")} error={form.formState.errors.password?.message}>
          <input className="input" type="password" placeholder="Minimum 8 characters" {...form.register("password")} />
        </Field>
        <Field label={t("common.region")} error={form.formState.errors.region?.message}>
          <input className="input" placeholder="Khujand" {...form.register("region")} />
        </Field>
        <Field label={t("common.district")} error={form.formState.errors.district?.message}>
          <input className="input" placeholder="B. Gafurov" {...form.register("district")} />
        </Field>
        <Field label={t("auth.role")} error={form.formState.errors.role?.message}>
          <select className="input" {...form.register("role")}>
            <option value="FARMER">{t("auth.farmer")}</option>
            <option value="BUYER">{t("auth.buyer")}</option>
          </select>
        </Field>
        <Field label={t("common.language")} error={form.formState.errors.language?.message}>
          <select className="input" {...form.register("language")}>
            <option value="RU">Русский</option>
            <option value="TJ">Тоҷикӣ</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <SubmitButton loading={form.formState.isSubmitting}>{t("auth.register")}</SubmitButton>
        </div>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-300">
        {t("auth.hasAccount")}{" "}
        <Link className="font-semibold text-emerald-700 dark:text-emerald-300" href="/login">
          {t("auth.login")}
        </Link>
      </p>
    </AuthFrame>
  );
}

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <main className="grid min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-emerald-950 lg:block">
        <div className="relative h-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1400&q=85"
            alt="Фермерское поле"
            fill
            priority
            sizes="45vw"
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-emerald-950/55" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <Link href="/" className="flex items-center gap-3 text-lg font-black">
              <span className="rounded-2xl bg-white/15 p-3">
                <Leaf className="h-7 w-7" aria-hidden />
              </span>
              {t("app.name")}
            </Link>
            <p className="max-w-md text-3xl font-black leading-tight">
              PostgreSQL, JWT, PWA and real AI providers in one product.
            </p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-900 dark:bg-zinc-900 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
              <Leaf className="h-4 w-4" aria-hidden />
              {t("app.name")}
            </Link>
            <LanguageSwitcher compact />
          </div>
          <h1 className="text-3xl font-black tracking-normal">{title}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      disabled={loading}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
