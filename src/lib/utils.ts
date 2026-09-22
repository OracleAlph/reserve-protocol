import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function formatMs(speed: number | null, digits = 2): string {
  if (speed == null || !Number.isFinite(speed)) return "—";
  return `${speed.toFixed(digits)} m/s`;
}

export function formatKg(kg: number | null, digits = 1): string {
  if (kg == null || !Number.isFinite(kg)) return "—";
  return `${kg.toFixed(digits)} kg`;
}

export function kgToLb(kg: number): number {
  return kg * 2.2046226218;
}

export function lbToKg(lb: number): number {
  return lb / 2.2046226218;
}

export function msToFts(ms: number): number {
  return ms / 0.3048;
}

export function finiteNumbers(values: Array<number | null | undefined>): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}
