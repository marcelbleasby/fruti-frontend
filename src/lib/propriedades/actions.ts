"use server";

import { ApiError } from "@/lib/api/fruti-api";
import {
  createPropriedade,
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

export type PropriedadeField = "nome" | "descricao" | "latitude" | "longitude";

export type CreatePropriedadeResult =
  | { status: "ok"; propriedade: Propriedade }
  | { status: "invalid"; fields: Partial<Record<PropriedadeField, string>> }
  | { status: "unauthenticated" }
  | { status: "unavailable"; message: string };

const PROPRIEDADE_FIELDS: PropriedadeField[] = ["nome", "descricao", "latitude", "longitude"];

/** Graus decimais com até 6 casas (o que a API guarda). Aceita vírgula. `undefined` = inválido. */
function coordenada(valor: unknown, limite: number): string | null | undefined {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(String(valor).trim().replace(",", "."));
  if (!Number.isFinite(n) || Math.abs(n) > limite) return undefined;
  return n.toFixed(6);
}

/**
 * Cadastra uma propriedade (quem cria vira Proprietário) e a torna a ativa.
 * Usado no primeiro acesso (/bem-vindo).
 */
export async function createPropriedadeAction(input: {
  nome: string;
  descricao?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
}): Promise<CreatePropriedadeResult> {
  const nome = typeof input.nome === "string" ? input.nome.trim() : "";
  const descricao = typeof input.descricao === "string" ? input.descricao.trim() : "";
  const latitude = coordenada(input.latitude, 90);
  const longitude = coordenada(input.longitude, 180);

  const fields: Partial<Record<PropriedadeField, string>> = {};
  if (!nome) fields.nome = "Informe o nome da propriedade.";
  else if (nome.length > 255) fields.nome = "Use até 255 caracteres.";
  if (descricao.length > 5000) fields.descricao = "Use até 5000 caracteres.";
  if (latitude === undefined) fields.latitude = "Informe uma latitude entre -90 e 90.";
  if (longitude === undefined) fields.longitude = "Informe uma longitude entre -180 e 180.";
  if (latitude === null && typeof longitude === "string") fields.latitude = "Informe junto com a longitude.";
  if (longitude === null && typeof latitude === "string") fields.longitude = "Informe junto com a latitude.";
  if (Object.keys(fields).length > 0) return { status: "invalid", fields };

  try {
    const propriedade = await createPropriedade({
      nome,
      descricao,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    });
    await setPropriedadeCookie(propriedade.id);
    return { status: "ok", propriedade };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) return { status: "unauthenticated" };
      if (err.status === 422) {
        const apiFields: Partial<Record<PropriedadeField, string>> = {};
        for (const { campo, mensagem } of err.campos) {
          const key = PROPRIEDADE_FIELDS.find((f) => f === campo);
          if (key) apiFields[key] = apiFields[key] ? `${apiFields[key]} ${mensagem}` : mensagem;
        }
        if (Object.keys(apiFields).length > 0) return { status: "invalid", fields: apiFields };
        return { status: "unavailable", message: err.message };
      }
    }
    console.error("[propriedades] falha ao criar", err);
    return { status: "unavailable", message: "Não foi possível cadastrar a propriedade agora. Tente novamente em instantes." };
  }
}
