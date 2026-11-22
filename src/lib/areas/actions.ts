"use server";

import { falhaDaApi, type ResultadoDeEscrita } from "@/lib/api/resultado";
import { authedApiFetch } from "@/lib/auth/session";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import type { CultivationUnitType } from "@/modules/types";
import type { AreaApi, UnidadeApi } from "./server";

const UUID = /^[0-9a-f-]{36}$/i;
const TIPOS: CultivationUnitType[] = ["canteiro", "talhao", "outro"];

/** Medida em metros com até 2 casas, como string para a API (Decimal). */
function medida(v: unknown): string | null {
  const n = typeof v === "number" ? v : Number.NaN;
  return Number.isFinite(n) && n >= 0 ? n.toFixed(2) : null;
}

const texto = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

/* ------------------------------------------------------------------ */
/* Escrita (só Proprietário; a API recusa os demais com 403)           */
/* ------------------------------------------------------------------ */

export interface AreaEntrada {
  nome: string;
  codigo: string;
  descricao: string;
  comprimento: number;
  largura: number;
}

export async function salvarAreaAction(
  id: string | null,
  dados: AreaEntrada,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  const corpo = {
    nome: texto(dados.nome, 255),
    codigo: texto(dados.codigo, 32),
    descricao: texto(dados.descricao, 5000),
    comprimento_m: medida(dados.comprimento),
    largura_m: medida(dados.largura),
  };
  try {
    let caminho = `/areas-de-cultivo/${id}`;
    if (!id) {
      const propriedade = await getPropriedadeAtiva();
      if (!propriedade) return { status: "rejected", message: "Cadastre uma propriedade antes." };
      caminho = `/propriedades/${propriedade.id}/areas-de-cultivo`;
    } else if (!UUID.test(id)) return { status: "rejected", message: "Área de cultivo não encontrada." };
    const a = await authedApiFetch<AreaApi>(caminho, { method: id ? "PATCH" : "POST", body: corpo });
    return { status: "ok", data: { id: a.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao salvar área de cultivo");
  }
}

export async function excluirAreaAction(id: string): Promise<ResultadoDeEscrita> {
  if (typeof id !== "string" || !UUID.test(id))
    return { status: "rejected", message: "Área de cultivo não encontrada." };
  try {
    await authedApiFetch(`/areas-de-cultivo/${id}`, { method: "DELETE" });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao excluir área de cultivo");
  }
}

export interface UnidadeEntrada {
  tipo: CultivationUnitType;
  nome: string;
  codigo: string;
  descricao: string;
  comprimento: number;
  largura: number;
  /** Sem posição: os dois nulos. */
  x: number | null;
  y: number | null;
}

export async function salvarUnidadeAction(
  areaId: string,
  id: string | null,
  dados: UnidadeEntrada,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  if (!UUID.test(String(areaId)) || (id !== null && !UUID.test(String(id))))
    return { status: "rejected", message: "Unidade de cultivo não encontrada." };
  const corpo = {
    tipo: (TIPOS.includes(dados.tipo) ? dados.tipo : "outro").toUpperCase(),
    nome: texto(dados.nome, 255),
    codigo: texto(dados.codigo, 32),
    descricao: texto(dados.descricao, 5000),
    comprimento_m: medida(dados.comprimento),
    largura_m: medida(dados.largura),
    posicao_x_m: dados.x === null ? null : medida(dados.x),
    posicao_y_m: dados.y === null ? null : medida(dados.y),
  };
  try {
    const u = await authedApiFetch<UnidadeApi>(
      id ? `/unidades-de-cultivo/${id}` : `/areas-de-cultivo/${areaId}/unidades-de-cultivo`,
      { method: id ? "PATCH" : "POST", body: corpo },
    );
    return { status: "ok", data: { id: u.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao salvar unidade de cultivo");
  }
}

export async function excluirUnidadeAction(id: string): Promise<ResultadoDeEscrita> {
  if (typeof id !== "string" || !UUID.test(id))
    return { status: "rejected", message: "Unidade de cultivo não encontrada." };
  try {
    await authedApiFetch(`/unidades-de-cultivo/${id}`, { method: "DELETE" });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao excluir unidade de cultivo");
  }
}
