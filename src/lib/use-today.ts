"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Data local de hoje em `YYYY-MM-DD`. */
export function localTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Hoje (`YYYY-MM-DD`, fuso do navegador), só no cliente.
 * No servidor/prerender e na hidratação devolve `undefined`, então o HTML
 * estático não depende do relógio (exigência do Cache Components) e não há
 * divergência de hidratação; logo depois o React re-renderiza com a data real.
 */
export function useTodayISO(): string | undefined {
  return useSyncExternalStore(noopSubscribe, localTodayISO, () => undefined);
}
