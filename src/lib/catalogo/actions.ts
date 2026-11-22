"use server";

import { ApiError } from "@/lib/api/fruti-api";
import { falhaDaApi, type ResultadoDeEscrita } from "@/lib/api/resultado";
import { authedApiFetch } from "@/lib/auth/session";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import type { Cultivar, Species } from "@/modules/types";
import {
  carregarContagens,
  listarCultivares,
  obterCultivar,
  obterEspecie,
  paraCultivar,
  paraSpecies,
  todasAsEspecies,
  type CultivarApi,
  type EspecieApi,
} from "./server";

const UUID = /^[0-9a-f-]{36}$/i;

async function contagens() {
  const propriedade = await getPropriedadeAtiva().catch(() => null);
  return carregarContagens(propriedade?.id ?? null);
}

/* ------------------------------------------------------------------ */
/* Leitura (drawers)                                                   */
/* ------------------------------------------------------------------ */

export type DetalheDaEspecie =
  | { status: "ok"; especie: Species; cultivares: Cultivar[] }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function detalheDaEspecieAction(id: string): Promise<DetalheDaEspecie> {
  if (typeof id !== "string" || !UUID.test(id)) return { status: "not_found" };
  try {
    const [especie, { itens }, c] = await Promise.all([obterEspecie(id), listarCultivares({ especieId: id }), contagens()]);
    return { status: "ok", especie: paraSpecies(especie, c), cultivares: itens.map((x) => paraCultivar(x, c)) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { status: "not_found" };
    if (err instanceof ApiError && err.status === 401) return { status: "unauthenticated" };
    console.error("[catalogo] falha ao carregar espécie", err);
    return { status: "unavailable" };
  }
}

export type DetalheDaCultivar =
  | { status: "ok"; cultivar: Cultivar; especie: Species }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function detalheDaCultivarAction(id: string): Promise<DetalheDaCultivar> {
  if (typeof id !== "string" || !UUID.test(id)) return { status: "not_found" };
  try {
    const [cultivar, c] = await Promise.all([obterCultivar(id), contagens()]);
    const especie = await obterEspecie(cultivar.especie_id);
    return { status: "ok", cultivar: paraCultivar(cultivar, c), especie: paraSpecies(especie, c) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { status: "not_found" };
    if (err instanceof ApiError && err.status === 401) return { status: "unauthenticated" };
    console.error("[catalogo] falha ao carregar cultivar", err);
    return { status: "unavailable" };
  }
}

/* ------------------------------------------------------------------ */
/* Escrita (administração global; a API recusa os demais com 403)      */
/* ------------------------------------------------------------------ */

export interface EspecieEntrada {
  nome_cientifico: string;
  nome_comum: string;
  descricao: string;
  ativa: boolean;
}

export async function salvarEspecieAction(
  id: string | null,
  dados: EspecieEntrada,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  const corpo = {
    nome_cientifico: String(dados.nome_cientifico ?? "").trim(),
    nome_comum: String(dados.nome_comum ?? "").trim(),
    descricao: String(dados.descricao ?? "").trim(),
    ativa: Boolean(dados.ativa),
  };
  try {
    const e = await authedApiFetch<EspecieApi>(id ? `/catalogo/especies/${id}` : "/catalogo/especies", {
      method: id ? "PATCH" : "POST",
      body: corpo,
    });
    return { status: "ok", data: { id: e.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao salvar espécie");
  }
}

export interface CultivarEntrada {
  nome: string;
  descricao: string;
  espacamento_recomendado_linhas_m: string | null;
  espacamento_recomendado_plantas_m: string | null;
  idade_inicio_producao_meses: number | null;
  observacoes: string;
}

export async function salvarCultivarAction(
  especieId: string,
  id: string | null,
  dados: CultivarEntrada,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  const corpo = {
    nome: String(dados.nome ?? "").trim(),
    descricao: String(dados.descricao ?? "").trim(),
    espacamento_recomendado_linhas_m: dados.espacamento_recomendado_linhas_m,
    espacamento_recomendado_plantas_m: dados.espacamento_recomendado_plantas_m,
    idade_inicio_producao_meses: dados.idade_inicio_producao_meses,
    observacoes: String(dados.observacoes ?? "").trim(),
  };
  try {
    const c = await authedApiFetch<CultivarApi>(
      id ? `/catalogo/cultivares/${id}` : `/catalogo/especies/${especieId}/cultivares`,
      { method: id ? "PATCH" : "POST", body: corpo },
    );
    return { status: "ok", data: { id: c.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao salvar cultivar");
  }
}

export async function excluirEspecieAction(id: string): Promise<ResultadoDeEscrita> {
  try {
    await authedApiFetch(`/catalogo/especies/${id}`, { method: "DELETE" });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao excluir espécie");
  }
}

export async function excluirCultivarAction(id: string): Promise<ResultadoDeEscrita> {
  try {
    await authedApiFetch(`/catalogo/cultivares/${id}`, { method: "DELETE" });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao excluir cultivar");
  }
}

/**
 * Espécies para o select do formulário de cultivar (só administração global).
 * Inclui as inativas, marcadas: a cultivar pode ser de uma espécie inativa, e
 * o "Novo cultivo" aberto a partir dela precisa encontrá-la na lista.
 */
export async function opcoesDeEspeciesAction(): Promise<{ value: string; label: string }[] | null> {
  try {
    return (await todasAsEspecies(false)).map((e) => {
      const nome = e.nome_comum ? `${e.nome_comum} (${e.nome_cientifico})` : e.nome_cientifico;
      return { value: e.id, label: e.ativa ? nome : `${nome} · inativa` };
    });
  } catch (err) {
    console.error("[catalogo] falha ao listar espécies", err);
    return null;
  }
}
