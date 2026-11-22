"use client";

import { useSyncExternalStore } from "react";
import { hojeISO, type DataISO } from "@/lib/datas";

const noopSubscribe = () => () => {};
const hoje = () => hojeISO();

/**
 * Hoje (`AAAA-MM-DD`, no fuso das propriedades — ver `lib/datas`), só no cliente.
 * No servidor/prerender e na hidratação devolve `undefined`, então o HTML
 * estático não depende do relógio (exigência do Cache Components) e não há
 * divergência de hidratação; logo depois o React re-renderiza com a data real.
 */
export function useTodayISO(): DataISO | undefined {
  return useSyncExternalStore(noopSubscribe, hoje, () => undefined);
}
