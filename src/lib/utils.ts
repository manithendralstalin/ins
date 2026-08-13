import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
  }).format(value || 0);
}

export function formatDate(input?: string | Date): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function classForStatus(status: string): string {
  const s = (status || "").toLowerCase();
  if (["active", "approved", "paid", "success", "completed"].includes(s))
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (["under review", "submitted", "pending", "processing"].includes(s))
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (["rejected", "failed", "expired", "lapsed"].includes(s))
    return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return "bg-sky-500/15 text-sky-300 border-sky-500/30";
}
