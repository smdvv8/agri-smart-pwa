"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { ProductDto } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function MarketDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ product: ProductDto }>(`/api/market/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err instanceof Error ? err.message : "Product error"));
  }, [id]);

  if (error) {
    return <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">{error}</div>;
  }

  if (!product) {
    return <div className="h-96 rounded-2xl skeleton" />;
  }

  return (
    <article className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {product.photoUrl ? (
        <img src={product.photoUrl} alt={product.title} className="max-h-[34rem] w-full rounded-3xl object-cover" />
      ) : (
        <div className="flex min-h-96 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Фото не загружено
        </div>
      )}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-900">
        <Link href="/market" className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
          Назад к маркету
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-normal">{product.title}</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">{product.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info label="Цена" value={formatCurrency(product.price)} />
          <Info label="Количество" value={`${product.quantity} ${product.unit}`} />
          <Info label="Культура" value={product.crop.nameRu} />
          <Info label="Регион" value={`${product.region.name}, ${product.district}`} />
        </div>
        <a
          href={`tel:${product.phone}`}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Позвонить продавцу
        </a>
      </section>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
