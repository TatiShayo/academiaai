"use client";

const KEY = "academiaai_usage";
const FREE_LIMIT = 3;
const UNLOCKED_LIMIT = 1;

interface UsageData {
  count: number;
  month: string; // "YYYY-MM"
  plan: "free" | "pro" | "unlocked";
}

function getMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function readUsage(): UsageData {
  if (typeof window === "undefined") return { count: 0, month: getMonth(), plan: "free" };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { count: 0, month: getMonth(), plan: "free" };
    return JSON.parse(raw);
  } catch {
    return { count: 0, month: getMonth(), plan: "free" };
  }
}

function writeUsage(data: UsageData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getUsage(): UsageData {
  const data = readUsage();
  const currentMonth = getMonth();
  if (data.month !== currentMonth) {
    const reset = { count: 0, month: currentMonth, plan: data.plan };
    writeUsage(reset);
    return reset;
  }
  return data;
}

export function incrementUsage(): UsageData {
  const data = getUsage();
  data.count += 1;
  writeUsage(data);
  return data;
}

export function isOverLimit(): boolean {
  const data = getUsage();
  if (data.plan === "pro") return false;
  if (data.plan === "unlocked") return data.count >= UNLOCKED_LIMIT;
  return data.count > FREE_LIMIT;
}

export function canProcess(): boolean {
  const data = getUsage();
  if (data.plan === "pro") return true;
  if (data.plan === "unlocked") return data.count < UNLOCKED_LIMIT;
  return data.count < FREE_LIMIT;
}

export function unlockSingle() {
  writeUsage({ count: 0, month: getMonth(), plan: "unlocked" });
}

export function setPro() {
  writeUsage({ count: 0, month: getMonth(), plan: "pro" });
}

export function getRemaining(): number {
  const data = getUsage();
  if (data.plan === "pro") return Infinity;
  if (data.plan === "unlocked") return Math.max(0, UNLOCKED_LIMIT - data.count);
  return Math.max(0, FREE_LIMIT - data.count);
}

export function getLimit(): number {
  const data = getUsage();
  if (data.plan === "unlocked") return UNLOCKED_LIMIT;
  return FREE_LIMIT;
}
