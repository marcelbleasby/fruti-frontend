"use server";

import { ApiError } from "@/lib/api/fruti-api";
import {
  getPropriedadeCookie,
  listPropriedades,
  resolveAtiva,
  setPropriedadeCookie,
  type Propriedade,
} from "./server";

export type PropriedadesResult =
  | { status: "ok"; propriedades: Propriedade[]; ativaId: string | null }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function getPropriedadesAction(): Promise<PropriedadesResult> {
  try {
    const [propriedades, cookieId] = await Promise.all([listPropriedades(), getPropriedadeCookie()]);
    const ativa = resolveAtiva(propriedades, cookieId);
    // Corrige o cookie quando ele aponta para uma propriedade sem vínculo (ou não existe).
    if (ativa && ativa.id !== cookieId) await setPropriedadeCookie(ativa.id);
    return { status: "ok", propriedades, ativaId: ativa?.id ?? null };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return { status: "unauthenticated" };
    console.error("[propriedades] falha ao listar", err);
    return { status: "unavailable" };
  }
}

/** Troca a propriedade ativa. Só aceita uma com vínculo ativo do usuário. */
export async function selectPropriedadeAction(id: string): Promise<{ ok: boolean }> {
  try {
    const propriedades = await listPropriedades();
    if (!propriedades.some((p) => p.id === id)) return { ok: false };
    await setPropriedadeCookie(id);
    return { ok: true };
  } catch (err) {
    console.error("[propriedades] falha ao trocar", err);
    return { ok: false };
  }
}
