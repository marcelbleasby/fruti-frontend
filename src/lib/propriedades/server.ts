import "server-only";

import { cookies } from "next/headers";
import type { Pagina } from "@/lib/api/fruti-api";
import { authedApiFetch } from "@/lib/auth/session";

/**
 * Propriedade ativa: guardada em cookie (escolha do usuário). Todo dado da API
 * é por Propriedade — `/propriedades/{id}/…` — então o servidor lê o cookie e
 * confere contra a lista de vínculos antes de usar.
 */
export const PROPRIEDADE_COOKIE = "fruti_propriedade";

/** Valores de `meu_papel` na API (enum `Papel` do fruti-api). */
export type Papel = "PROPRIETARIO" | (string & {});

export interface Propriedade {
  id: string;
  nome: string;
  descricao: string;
  meuPapel: Papel;
}

interface PropriedadeSaida {
  id: string;
  nome: string;
  descricao: string;
  latitude: string | null;
  longitude: string | null;
  meu_papel: string;
}

/** Propriedades com vínculo ativo do usuário, em ordem alfabética (até 200 — o máximo da API). */
export async function listPropriedades(): Promise<Propriedade[]> {
  const { itens } = await authedApiFetch<Pagina<PropriedadeSaida>>("/propriedades?ordenar=nome&limit=200");
  return itens.map(toPropriedade);
}

const toPropriedade = (p: PropriedadeSaida): Propriedade => ({
  id: p.id,
  nome: p.nome,
  descricao: p.descricao,
  meuPapel: p.meu_papel,
});

export interface PropriedadeEntrada {
  nome: string;
  descricao: string;
  /** Graus decimais (WGS 84) com até 6 casas, como string. Ambas ou nenhuma. */
  latitude: string | null;
  longitude: string | null;
}

/** Cria a propriedade; quem cria vira Proprietário (vínculo criado pela API). */
export async function createPropriedade(dados: PropriedadeEntrada): Promise<Propriedade> {
  return toPropriedade(await authedApiFetch<PropriedadeSaida>("/propriedades", { method: "POST", body: dados }));
}

/** Escolhe a ativa: a do cookie, se o usuário ainda tiver vínculo; senão a primeira. */
export function resolveAtiva(propriedades: Propriedade[], cookieId: string | undefined): Propriedade | null {
  return propriedades.find((p) => p.id === cookieId) ?? propriedades[0] ?? null;
}

export async function getPropriedadeCookie(): Promise<string | undefined> {
  return (await cookies()).get(PROPRIEDADE_COOKIE)?.value;
}

/** Propriedade ativa para Server Components/Actions. `null` = usuário sem propriedades. */
export async function getPropriedadeAtiva(): Promise<Propriedade | null> {
  const [propriedades, cookieId] = await Promise.all([listPropriedades(), getPropriedadeCookie()]);
  return resolveAtiva(propriedades, cookieId);
}

export async function setPropriedadeCookie(id: string) {
  (await cookies()).set(PROPRIEDADE_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
