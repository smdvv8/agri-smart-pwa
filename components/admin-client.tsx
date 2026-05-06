"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, EyeOff, Leaf, Package, Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import type { CropDto, ProductDto, UserDto } from "@/lib/types";

type Stats = {
  totals: {
    users: number;
    products: number;
    diagnoses: number;
    irrigations: number;
    chats: number;
  };
  productStatus: Array<{ name: string; value: number }>;
};

export function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/admin/stats").then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: "Пользователи", value: stats.totals.users, icon: Users },
        { label: "Товары", value: stats.totals.products, icon: Package },
        { label: "Диагнозы", value: stats.totals.diagnoses, icon: Leaf },
        { label: "AI-чаты", value: stats.totals.chats, icon: BarChart3 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Role: ADMIN
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal">Admin Panel</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["/admin/users", "Users"],
            ["/admin/products", "Products"],
            ["/admin/crops", "Crops"],
            ["/admin/diseases", "Diseases"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-bold dark:bg-zinc-900">
              {label}
            </Link>
          ))}
        </div>
      </header>
      {stats ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
                  <Icon className="h-6 w-6 text-emerald-600" aria-hidden />
                  <p className="mt-4 text-sm text-zinc-500">{card.label}</p>
                  <p className="mt-1 text-3xl font-black">{card.value}</p>
                </div>
              );
            })}
          </section>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
            <h2 className="text-xl font-black">Статусы товаров</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.productStatus}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : (
        <div className="h-96 rounded-2xl skeleton" />
      )}
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserDto[]>([]);

  useEffect(() => {
    apiFetch<{ users: UserDto[] }>("/api/admin/users").then((data) => setUsers(data.users));
  }, []);

  return (
    <AdminTable title="Пользователи">
      {users.map((user) => (
        <Row key={user.id} title={user.fullName} meta={`${user.email} · ${user.phone}`} badge={user.role} />
      ))}
    </AdminTable>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState<ProductDto[]>([]);

  function load() {
    apiFetch<{ products: ProductDto[] }>("/api/admin/products").then((data) => setProducts(data.products));
  }

  useEffect(load, []);

  async function hide(id: string) {
    try {
      await apiFetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "HIDDEN" }),
      });
      toast.success("Объявление скрыто");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка");
    }
  }

  return (
    <AdminTable title="Товары">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
          <div>
            <p className="font-bold">{product.title}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {product.crop.nameRu} · {product.region.name} · {product.status}
            </p>
          </div>
          <button
            onClick={() => hide(product.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            aria-label="Скрыть"
          >
            <EyeOff className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
    </AdminTable>
  );
}

export function AdminDiagnoses() {
  const [items, setItems] = useState<Array<{ id: string; detectedProblem: string; riskLevel: string; crop: CropDto }>>([]);

  useEffect(() => {
    apiFetch<{ diagnoses: Array<{ id: string; detectedProblem: string; riskLevel: string; crop: CropDto }> }>("/api/admin/diagnoses").then((data) => setItems(data.diagnoses));
  }, []);

  return (
    <AdminTable title="Диагнозы">
      {items.map((item) => (
        <Row key={item.id} title={item.detectedProblem} meta={item.crop.nameRu} badge={item.riskLevel} />
      ))}
    </AdminTable>
  );
}

export function AdminCrops() {
  const [crops, setCrops] = useState<CropDto[]>([]);

  useEffect(() => {
    apiFetch<{ crops: CropDto[] }>("/api/admin/crops").then((data) => setCrops(data.crops));
  }, []);

  return (
    <AdminTable title="Культуры">
      {crops.map((crop) => (
        <Row key={crop.id} title={crop.nameRu} meta={crop.nameTj} badge={crop.season} />
      ))}
    </AdminTable>
  );
}

export function AdminDiseases() {
  const [items, setItems] = useState<Array<{ id: string; nameRu: string; riskLevel: string; crop: CropDto }>>([]);

  useEffect(() => {
    apiFetch<{ diseases: Array<{ id: string; nameRu: string; riskLevel: string; crop: CropDto }> }>("/api/admin/diseases").then((data) => setItems(data.diseases));
  }, []);

  return (
    <AdminTable title="Болезни">
      {items.map((item) => (
        <Row key={item.id} title={item.nameRu} meta={item.crop.nameRu} badge={item.riskLevel} />
      ))}
    </AdminTable>
  );
}

function AdminTable({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-normal">{title}</h1>
      </header>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-900 dark:bg-zinc-900">
        <div className="space-y-3">{children}</div>
      </section>
    </div>
  );
}

function Row({ title, meta, badge }: { title: string; meta: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">{meta}</p>
      </div>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        {badge}
      </span>
    </div>
  );
}
