"use server";

import { ApiError, type Pagina } from "@/lib/api/fruti-api";
import { chaveDeIdempotencia, falhaDaApi, type ResultadoDeEscrita } from "@/lib/api/resultado";
import { authedApiFetch } from "@/lib/auth/session";
import { formatData } from "@/lib/estoque/format";
import { carregarCatalogo, nomearLote } from "@/lib/estoque/server";
import type { LoteApi, SaldoDeInsumo, Unidade } from "@/lib/estoque/types";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import {
  carregarReferencias,
  listarProdutos,
  nomearDestinacao,
  nomearProcessamento,
  obterDestinacaoApi,
  obterProcessamentoApi,
} from "./server";
import type {
  Destinacao,
  DestinacaoApi,
  Processamento,
  ProcessamentoApi,
  ProdutoApi,
  TipoDeDestinacao,
  TipoDeProduto,
} from "./types";

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */

export type DetalheDoProcessamento =
  | { status: "ok"; processamento: Processamento }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function detalheDoProcessamentoAction(id: string): Promise<DetalheDoProcessamento> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { status: "not_found" };
  try {
    const p = await obterProcessamentoApi(id);
    const refs = await carregarReferencias(p.propriedade_id);
    return { status: "ok", processamento: nomearProcessamento(p, refs) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { status: "not_found" };
    if (err instanceof ApiError && err.status === 401) return { status: "unauthenticated" };
    console.error("[beneficiamento] falha ao carregar processamento", err);
    return { status: "unavailable" };
  }
}

export interface OpcaoDeLote {
  value: string;
  label: string;
  unidade: Unidade;
  saldo: string;
  dataDeEntrada: string;
}

export interface OpcoesDeProcessamento {
  /** Lotes do estoque de produção com saldo (fruta colhida e produtos). */
  lotes: OpcaoDeLote[];
  produtos: { value: string; label: string; unidade: Unidade }[];
  /** Insumos com saldo (o lote sai automaticamente: o que vence antes primeiro). */
  insumos: { value: string; label: string; unidade: Unidade; saldo: string }[];
}

export async function opcoesDeProcessamentoAction(): Promise<
  { status: "ok"; opcoes: OpcoesDeProcessamento } | { status: "sem_propriedade" } | { status: "unavailable" }
> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "sem_propriedade" };
    const [lotes, catalogo, produtos, saldos] = await Promise.all([
      authedApiFetch<Pagina<LoteApi>>(
        `/propriedades/${propriedade.id}/estoque-de-producao/lotes?com_saldo=true&ordenar=-data_de_entrada&limit=200`,
      ),
      carregarCatalogo(propriedade.id, "producao"),
      listarProdutos(propriedade.id),
      authedApiFetch<Pagina<SaldoDeInsumo>>(`/propriedades/${propriedade.id}/estoque-de-insumos/saldos?limit=200`),
    ]);
    return {
      status: "ok",
      opcoes: {
        lotes: lotes.itens.map((l) => {
          const n = nomearLote(l, catalogo);
          return {
            value: l.id,
            // Lotes da colheita não têm código e a API ainda não expõe a classe: a data diferencia.
            label: `${l.codigo ? `${l.codigo} · ` : ""}${n.material} · entrada ${formatData(l.data_de_entrada)}`,
            unidade: l.unidade,
            saldo: l.saldo,
            dataDeEntrada: l.data_de_entrada,
          };
        }),
        produtos: produtos.map((p) => ({ value: p.id, label: p.nome, unidade: p.unidade })),
        insumos: saldos.itens
          .filter((s) => Number(s.saldo) > 0)
          .map((s) => ({ value: s.insumo_id, label: s.nome, unidade: s.unidade, saldo: s.saldo })),
      },
    };
  } catch (err) {
    console.error("[beneficiamento] falha ao carregar opções", err);
    return { status: "unavailable" };
  }
}

/* ------------------------------------------------------------------ */
/* Escritas                                                            */
/* ------------------------------------------------------------------ */

export interface ProcessamentoEntrada {
  data: string;
  entradas: { lote_id: string; quantidade: string }[];
  insumos: { insumo_id: string; quantidade: string }[];
  saidas: { produto_id: string; quantidade: string }[];
  perda_kg?: string;
  custo_adicional?: string;
  observacoes?: string;
}

export async function registrarProcessamentoAction(
  dados: ProcessamentoEntrada,
  chave: string,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "rejected", message: "Cadastre uma propriedade antes de registrar processamentos." };
    const corpo = {
      data: dados.data,
      entradas: dados.entradas,
      insumos: dados.insumos,
      saidas: dados.saidas,
      ...(dados.perda_kg ? { perda_kg: dados.perda_kg } : {}),
      ...(dados.custo_adicional ? { custo_adicional: dados.custo_adicional } : {}),
      observacoes: dados.observacoes ?? "",
    };
    const p = await authedApiFetch<ProcessamentoApi>(`/propriedades/${propriedade.id}/processamentos`, {
      method: "POST",
      body: corpo,
      headers: { "Idempotency-Key": chaveDeIdempotencia(chave) },
    });
    return { status: "ok", data: { id: p.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao registrar processamento");
  }
}

export async function cancelarProcessamentoAction(id: string, motivo: string): Promise<ResultadoDeEscrita> {
  const m = typeof motivo === "string" ? motivo.trim() : "";
  if (!m) return { status: "invalid", fields: { motivo: "Informe o motivo do cancelamento." } };
  try {
    await authedApiFetch(`/processamentos/${id}/cancelar`, { method: "POST", body: { motivo: m } });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao cancelar processamento");
  }
}

export async function criarProdutoAction(dados: {
  nome: string;
  tipo: TipoDeProduto;
  unidade: Unidade;
}): Promise<ResultadoDeEscrita<{ value: string; label: string; unidade: Unidade }>> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "rejected", message: "Cadastre uma propriedade antes." };
    const p = await authedApiFetch<ProdutoApi>(`/propriedades/${propriedade.id}/produtos`, {
      method: "POST",
      body: { nome: typeof dados.nome === "string" ? dados.nome.trim() : "", tipo: dados.tipo, unidade: dados.unidade },
    });
    return { status: "ok", data: { value: p.id, label: p.nome, unidade: p.unidade } };
  } catch (err) {
    return falhaDaApi(err, "falha ao criar produto");
  }
}

/* ------------------------------------------------------------------ */
/* Destinações                                                         */
/* ------------------------------------------------------------------ */

export type DetalheDaDestinacao =
  | { status: "ok"; destinacao: Destinacao }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function detalheDaDestinacaoAction(id: string): Promise<DetalheDaDestinacao> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { status: "not_found" };
  try {
    const d = await obterDestinacaoApi(id);
    const refs = await carregarReferencias(d.propriedade_id);
    return { status: "ok", destinacao: nomearDestinacao(d, refs) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { status: "not_found" };
    if (err instanceof ApiError && err.status === 401) return { status: "unauthenticated" };
    console.error("[beneficiamento] falha ao carregar destinação", err);
    return { status: "unavailable" };
  }
}

export interface OpcoesDeDestinacao {
  lotes: OpcaoDeLote[];
  /** Insumos de adubo orgânico (catálogo + próprios), para o composto da compostagem. */
  adubos: { value: string; label: string; unidade: Unidade }[];
}

export async function opcoesDeDestinacaoAction(): Promise<
  { status: "ok"; opcoes: OpcoesDeDestinacao } | { status: "sem_propriedade" } | { status: "unavailable" }
> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "sem_propriedade" };
    const [lotes, catalogo, adubos] = await Promise.all([
      authedApiFetch<Pagina<LoteApi>>(
        `/propriedades/${propriedade.id}/estoque-de-producao/lotes?com_saldo=true&ordenar=-data_de_entrada&limit=200`,
      ),
      carregarCatalogo(propriedade.id, "producao"),
      authedApiFetch<Pagina<{ id: string; nome: string; unidade_padrao: Unidade }>>(
        `/propriedades/${propriedade.id}/insumos?categoria=ADUBO_ORGANICO&ordenar=nome&limit=200`,
      ),
    ]);
    return {
      status: "ok",
      opcoes: {
        lotes: lotes.itens.map((l) => {
          const n = nomearLote(l, catalogo);
          return {
            value: l.id,
            label: `${l.codigo ? `${l.codigo} · ` : ""}${n.material} · entrada ${formatData(l.data_de_entrada)}`,
            unidade: l.unidade,
            saldo: l.saldo,
            dataDeEntrada: l.data_de_entrada,
          };
        }),
        adubos: adubos.itens.map((a) => ({ value: a.id, label: a.nome, unidade: a.unidade_padrao })),
      },
    };
  } catch (err) {
    console.error("[beneficiamento] falha ao carregar opções de destinação", err);
    return { status: "unavailable" };
  }
}

export interface DestinacaoEntrada {
  tipo: TipoDeDestinacao;
  data: string;
  itens: { lote_id: string; quantidade: string }[];
  valor_total?: string;
  comprador?: string;
  composto?: { insumo_id: string; quantidade: string } | null;
  observacoes?: string;
}

export async function registrarDestinacaoAction(
  dados: DestinacaoEntrada,
  chave: string,
): Promise<ResultadoDeEscrita<{ id: string }>> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { status: "rejected", message: "Cadastre uma propriedade antes de registrar destinações." };
    const venda = dados.tipo === "VENDA";
    const corpo = {
      tipo: dados.tipo,
      data: dados.data,
      itens: dados.itens,
      // A API recusa comprador/valor fora de venda e composto fora de compostagem.
      ...(venda && dados.valor_total ? { valor_total: dados.valor_total } : {}),
      ...(venda && dados.comprador ? { comprador: dados.comprador } : {}),
      ...(dados.tipo === "COMPOSTAGEM" && dados.composto ? { composto: dados.composto } : {}),
      observacoes: dados.observacoes ?? "",
    };
    const d = await authedApiFetch<DestinacaoApi>(`/propriedades/${propriedade.id}/destinacoes`, {
      method: "POST",
      body: corpo,
      headers: { "Idempotency-Key": chaveDeIdempotencia(chave) },
    });
    return { status: "ok", data: { id: d.id } };
  } catch (err) {
    return falhaDaApi(err, "falha ao registrar destinação");
  }
}

export async function cancelarDestinacaoAction(id: string, motivo: string): Promise<ResultadoDeEscrita> {
  const m = typeof motivo === "string" ? motivo.trim() : "";
  if (!m) return { status: "invalid", fields: { motivo: "Informe o motivo do cancelamento." } };
  try {
    await authedApiFetch(`/destinacoes/${id}/cancelar`, { method: "POST", body: { motivo: m } });
    return { status: "ok", data: undefined };
  } catch (err) {
    return falhaDaApi(err, "falha ao cancelar destinação");
  }
}
