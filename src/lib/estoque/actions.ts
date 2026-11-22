"use server";

import { ApiError, type Pagina } from "@/lib/api/fruti-api";
import { chaveDeIdempotencia, falhaDaApi, type ResultadoDeEscrita } from "@/lib/api/resultado";
import { authedApiFetch } from "@/lib/auth/session";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import {
  carregarCatalogo,
  listarMovimentacoes,
  nomearLote,
  obterLoteApi,
  opcoesDeCultivares,
  opcoesDeEspecies,
  opcoesDeInsumos,
} from "./server";
import type { Lote, LoteApi, MovimentacaoApi, OpcaoCatalogo, TipoDeEstoque } from "./types";

export type { ResultadoDeEscrita };

/* ------------------------------------------------------------------ */
/* Leitura para o drawer e formulários                                 */
/* ------------------------------------------------------------------ */

export type DetalheDoLote =
  | { status: "ok"; lote: Lote; movimentacoes: MovimentacaoApi[]; origem: Lote | null }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function detalheDoLoteAction(id: string, tipo: TipoDeEstoque): Promise<DetalheDoLote> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { status: "not_found" };
  try {
    const [loteApi, movimentacoes] = await Promise.all([obterLoteApi(id), listarMovimentacoes(id)]);
    const [catalogo, origemApi] = await Promise.all([
      carregarCatalogo(loteApi.propriedade_id, tipo),
      loteApi.lote_de_origem_id ? obterLoteApi(loteApi.lote_de_origem_id).catch(() => null) : null,
    ]);
    return {
      status: "ok",
      lote: nomearLote(loteApi, catalogo),
      movimentacoes,
      origem: origemApi ? nomearLote(origemApi, catalogo) : null,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { status: "not_found" };
    if (err instanceof ApiError && err.status === 401) return { status: "unauthenticated" };
    console.error("[estoque] falha ao carregar lote", err);
    return { status: "unavailable" };
  }
}

export interface OpcoesDeEntrada {
  especies: OpcaoCatalogo[];
  cultivares: OpcaoCatalogo[];
  insumos: OpcaoCatalogo[];
  /** Lotes vegetais com saldo, para "produzido a partir de". `grupo` = especie_id. */
  lotesDeOrigem: (OpcaoCatalogo & { saldo: string; dataDeEntrada: string })[];
}

export async function opcoesDeEntradaAction(
  tipo: "vegetal" | "insumos",
): Promise<{ status: "ok"; opcoes: OpcoesDeEntrada } | { status: "unavailable" } | { status: "sem_propriedade" }> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "sem_propriedade" };
    const [catalogo, origens] = await Promise.all([
      carregarCatalogo(propriedade.id, tipo),
      tipo === "vegetal"
        ? authedApiFetch<Pagina<LoteApi>>(
            `/propriedades/${propriedade.id}/estoque-vegetal/lotes?com_saldo=true&ordenar=-data_de_entrada&limit=200`,
          )
        : Promise.resolve({ itens: [] as LoteApi[], total: 0 }),
    ]);
    return {
      status: "ok",
      opcoes: {
        especies: opcoesDeEspecies(catalogo),
        cultivares: opcoesDeCultivares(catalogo),
        insumos: opcoesDeInsumos(catalogo),
        lotesDeOrigem: origens.itens.map((l) => {
          const nomeado = nomearLote(l, catalogo);
          return {
            value: l.id,
            label: `${l.codigo || "Sem código"} · ${nomeado.material}`,
            grupo: l.especie_id ?? undefined,
            unidade: l.unidade,
            saldo: l.saldo,
            dataDeEntrada: l.data_de_entrada,
          };
        }),
      },
    };
  } catch (err) {
    console.error("[estoque] falha ao carregar opções", err);
    return { status: "unavailable" };
  }
}

/* ------------------------------------------------------------------ */
/* Escritas                                                            */
/* ------------------------------------------------------------------ */

/** Remove strings vazias de campos opcionais numéricos/ids (a API espera null ou ausente). */
function limpar(dados: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(dados).filter(([, v]) => v !== "" && v !== undefined && v !== null));
}

export async function criarLoteAction(
  tipo: "vegetal" | "insumos",
  dados: Record<string, unknown>,
  chave: string,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "rejected", message: "Cadastre uma propriedade antes de registrar estoque." };
    const rota = tipo === "vegetal" ? "estoque-vegetal/lotes" : "estoque-de-insumos/lotes";
    const lote = await authedApiFetch<LoteApi>(`/propriedades/${propriedade.id}/${rota}`, {
      method: "POST",
      body: limpar(dados),
      headers: { "Idempotency-Key": chaveDeIdempotencia(chave) },
    });
    return { status: "ok", data: { id: lote.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao criar lote");
  }
}

export async function registrarMovimentacaoAction(
  loteId: string,
  dados: { tipo: "PERDA" | "AJUSTE"; quantidade: string; data: string; justificativa?: string; observacoes?: string },
  chave: string,
): Promise<ResultadoDeEscrita<MovimentacaoApi>> {
  if (dados.tipo !== "PERDA" && dados.tipo !== "AJUSTE") {
    return { status: "invalid", fields: { tipo: "Escolha perda ou ajuste." } };
  }
  try {
    const mov = await authedApiFetch<MovimentacaoApi>(`/lotes/${loteId}/movimentacoes`, {
      method: "POST",
      body: limpar({ ...dados }),
      headers: { "Idempotency-Key": chaveDeIdempotencia(chave) },
    });
    return { status: "ok", data: mov };
  } catch (err) {
    return falhaDaApi(err, "falha ao registrar movimentação");
  }
}

export async function excluirLoteAction(loteId: string): Promise<ResultadoDeEscrita> {
  try {
    await authedApiFetch(`/lotes/${loteId}`, { method: "DELETE" });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao excluir lote");
  }
}
