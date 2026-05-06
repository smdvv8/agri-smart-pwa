import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(value: number | string) {
  const number = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "TJS",
    maximumFractionDigits: 0,
  }).format(number);
}

export function formDataString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
