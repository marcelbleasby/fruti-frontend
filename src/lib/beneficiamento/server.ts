import "server-only";

import type { Pagina } from "@/lib/api/fruti-api";
import { authedApiFetch } from "@/lib/auth/session";
import { toNumber } from "@/lib/estoque/format";
import { carregarCatalogo, nomearLote } from "@/lib/estoque/server";
import type { Lote, LoteApi, Unidade } from "@/lib/estoque/types";
import type {
  Destinacao,
  DestinacaoApi,
  ItemDoProcessamento,
  Processamento,
  ProcessamentoApi,
  ProdutoApi,
  ResumoDasDestinacoes,
  ResumoDosProcessamentos,
  SituacaoDoRegistro,
  TipoDeDestinacao,
} from "./types";

export const TAMANHO_DA_PAGINA = 20;
const MAXIMO = 200;

type Params = Record<string, string | number | boolean | null | undefined>;
const query = (params: Params) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export interface FiltrosDeProcessamentos {
  situacao?: SituacaoDoRegistro;
  de?: string;
  ate?: string;
  ordenar?: "data" | "-data";
  pagina: number;
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export function filtrosDaUrl(sp: Record<string, string | string[] | undefined>): FiltrosDeProcessamentos {
  const s = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const situacao = s("situacao");
  const ordenar = s("ordenar");
  const de = s("de");
  const ate = s("ate");
  return {
    situacao: situacao === "REGISTRADO" || situacao === "CANCELADO" ? situacao : undefined,
    de: de && DATA.test(de) ? de : undefined,
    ate: ate && DATA.test(ate) ? ate : undefined,
    ordenar: ordenar === "data" || ordenar === "-data" ? ordenar : undefined,
    pagina: Math.max(1, Number.parseInt(s("pagina") ?? "1", 10) || 1),
  };
}

export async function listarProcessamentos(propriedadeId: string, f: FiltrosDeProcessamentos) {
  return authedApiFetch<Pagina<ProcessamentoApi>>(
    `/propriedades/${propriedadeId}/processamentos${query({
      situacao: f.situacao,
      de: f.de,
      ate: f.ate,
      ordenar: f.ordenar,
      limit: TAMANHO_DA_PAGINA,
      offset: (f.pagina - 1) * TAMANHO_DA_PAGINA,
    })}`,
  );
}

/** Cards do topo: só registros válidos (REGISTRADO) do mesmo período filtrado, até 200. */
export async function resumoDosProcessamentos(
  propriedadeId: string,
  f: FiltrosDeProcessamentos,
): Promise<ResumoDosProcessamentos> {
  const { itens, total } = await authedApiFetch<Pagina<ProcessamentoApi>>(
    `/propriedades/${propriedadeId}/processamentos${query({ situacao: "REGISTRADO", de: f.de, ate: f.ate, limit: MAXIMO })}`,
  );
  let kg = 0;
  let kgComRendimento = 0;
  let somaPonderada = 0;
  let perda = 0;
  for (const p of itens) {
    const k = toNumber(p.rendimento.kg_de_entrada);
    kg += k;
    perda += toNumber(p.perda_kg);
    if (p.rendimento.rendimento_pct !== null && k > 0) {
      kgComRendimento += k;
      somaPonderada += toNumber(p.rendimento.rendimento_pct) * k;
    }
  }
  return {
    registrados: total,
    kgProcessados: kg,
    rendimentoMedio: kgComRendimento > 0 ? somaPonderada / kgComRendimento : null,
    perdaKg: perda,
    considerados: itens.length,
    total,
  };
}

export async function obterProcessamentoApi(id: string) {
  return authedApiFetch<ProcessamentoApi>(`/processamentos/${id}`);
}

export async function listarProdutos(propriedadeId: string) {
  const { itens } = await authedApiFetch<Pagina<ProdutoApi>>(
    `/propriedades/${propriedadeId}/produtos?ordenar=nome&limit=${MAXIMO}`,
  );
  return itens;
}

/* ------------------------------------------------------------------ */
/* Nomes: lotes (produção e insumos) e produtos                        */
/* ------------------------------------------------------------------ */

export interface Referencias {
  lotes: Map<string, Lote>;
  produtos: Map<string, { nome: string; unidade: Unidade }>;
}

/**
 * Carrega o que é preciso para dar nome às entradas e saídas: lotes do estoque
 * de produção e de insumos (inclusive esgotados) e os produtos da propriedade.
 */
export async function carregarReferencias(propriedadeId: string): Promise<Referencias> {
  const tolerante = <T,>(p: Promise<Pagina<T>>) => p.catch(() => ({ itens: [] as T[], total: 0 }));
  const [producao, insumos, catalogoProducao, catalogoInsumos] = await Promise.all([
    tolerante(authedApiFetch<Pagina<LoteApi>>(`/propriedades/${propriedadeId}/estoque-de-producao/lotes?limit=${MAXIMO}`)),
    tolerante(authedApiFetch<Pagina<LoteApi>>(`/propriedades/${propriedadeId}/estoque-de-insumos/lotes?limit=${MAXIMO}`)),
    carregarCatalogo(propriedadeId, "producao"),
    carregarCatalogo(propriedadeId, "insumos"),
  ]);
  const lotes = new Map<string, Lote>();
  for (const l of producao.itens) lotes.set(l.id, nomearLote(l, catalogoProducao));
  for (const l of insumos.itens) lotes.set(l.id, nomearLote(l, catalogoInsumos));
  return { lotes, produtos: catalogoProducao.produtos };
}

export function nomearProcessamento(p: ProcessamentoApi, r: Referencias): Processamento {
  const item = (loteId: string, quantidade: string, custo: string | null): ItemDoProcessamento => {
    const lote = r.lotes.get(loteId);
    return {
      loteId,
      codigo: lote?.codigo ?? "",
      nome: lote?.material ?? "Lote",
      detalhe: lote?.materialDetalhe,
      quantidade,
      unidade: lote?.unidade ?? null,
      custo,
    };
  };
  const lotesDeEntrada = p.entradas.filter((e) => e.categoria !== "INSUMO").map((e) => item(e.lote_id, e.quantidade, e.custo));
  const insumosConsumidos = p.entradas.filter((e) => e.categoria === "INSUMO").map((e) => item(e.lote_id, e.quantidade, e.custo));
  const produtosGerados = p.saidas.map((s) => {
    const produto = r.produtos.get(s.produto_id);
    const lote = r.lotes.get(s.lote_id);
    return {
      loteId: s.lote_id,
      codigo: lote?.codigo ?? "",
      nome: produto?.nome ?? "Produto",
      quantidade: s.quantidade,
      unidade: produto?.unidade ?? lote?.unidade ?? null,
      custo: lote?.custo_total ?? null,
    };
  });
  const custos = p.entradas.map((e) => e.custo);
  const conhecidos = custos.filter((c): c is string => c !== null);
  const custoTotal =
    conhecidos.length || p.custo_adicional !== null
      ? conhecidos.reduce((s, c) => s + toNumber(c), 0) + toNumber(p.custo_adicional)
      : null;
  return {
    ...p,
    lotesDeEntrada,
    insumosConsumidos,
    produtosGerados,
    custoTotal,
    custoIncompleto: custos.some((c) => c === null),
  };
}

/* ------------------------------------------------------------------ */
/* Destinações                                                         */
/* ------------------------------------------------------------------ */

const TIPOS: TipoDeDestinacao[] = ["VENDA", "DOACAO", "CONSUMO_PROPRIO", "PERDA", "COMPOSTAGEM"];

export interface FiltrosDeDestinacoes extends FiltrosDeProcessamentos {
  tipo?: TipoDeDestinacao;
}

export function filtrosDeDestinacoesDaUrl(sp: Record<string, string | string[] | undefined>): FiltrosDeDestinacoes {
  const base = filtrosDaUrl(sp);
  const v = sp.tipo;
  const tipo = (Array.isArray(v) ? v[0] : v) as TipoDeDestinacao | undefined;
  return { ...base, tipo: tipo && TIPOS.includes(tipo) ? tipo : undefined };
}

export async function listarDestinacoes(propriedadeId: string, f: FiltrosDeDestinacoes) {
  return authedApiFetch<Pagina<DestinacaoApi>>(
    `/propriedades/${propriedadeId}/destinacoes${query({
      tipo: f.tipo,
      situacao: f.situacao,
      de: f.de,
      ate: f.ate,
      ordenar: f.ordenar,
      limit: TAMANHO_DA_PAGINA,
      offset: (f.pagina - 1) * TAMANHO_DA_PAGINA,
    })}`,
  );
}

export async function obterDestinacaoApi(id: string) {
  return authedApiFetch<DestinacaoApi>(`/destinacoes/${id}`);
}

export function nomearDestinacao(d: DestinacaoApi, r: Referencias): Destinacao {
  const item = (loteId: string, quantidade: string, custo: string | null): ItemDoProcessamento => {
    const lote = r.lotes.get(loteId);
    return {
      loteId,
      codigo: lote?.codigo ?? "",
      nome: lote?.material ?? "Lote",
      detalhe: lote?.materialDetalhe,
      quantidade,
      unidade: lote?.unidade ?? null,
      custo,
    };
  };
  const lotes = d.itens.map((i) => item(i.lote_id, i.quantidade, i.custo));
  const compostoLote = d.lote_de_composto_id ? r.lotes.get(d.lote_de_composto_id) : undefined;
  return {
    ...d,
    lotes,
    kg: lotes.reduce((s, l) => (l.unidade === "QUILOGRAMA" ? s + toNumber(l.quantidade) : s), 0),
    composto: d.lote_de_composto_id
      ? {
          loteId: d.lote_de_composto_id,
          codigo: compostoLote?.codigo ?? "",
          nome: compostoLote?.material ?? "Adubo orgânico",
          quantidade: compostoLote?.quantidade_inicial ?? "0",
          unidade: compostoLote?.unidade ?? null,
          custo: compostoLote?.custo_total ?? null,
        }
      : null,
  };
}

/** Cards do topo: só destinações válidas (REGISTRADO) do período filtrado, até 200. */
export async function resumoDasDestinacoes(
  propriedadeId: string,
  f: FiltrosDeDestinacoes,
  r: Referencias,
): Promise<ResumoDasDestinacoes> {
  const { itens, total } = await authedApiFetch<Pagina<DestinacaoApi>>(
    `/propriedades/${propriedadeId}/destinacoes${query({ situacao: "REGISTRADO", de: f.de, ate: f.ate, limit: MAXIMO })}`,
  );
  const resumo: ResumoDasDestinacoes = {
    vendas: 0,
    valorVendido: 0,
    kgVendidos: 0,
    kgPerdidos: 0,
    kgDoadosOuConsumidos: 0,
    considerados: itens.length,
    total,
  };
  for (const d of itens) {
    const kg = nomearDestinacao(d, r).kg;
    if (d.tipo === "VENDA") {
      resumo.vendas += 1;
      resumo.valorVendido += toNumber(d.valor_total);
      resumo.kgVendidos += kg;
    } else if (d.tipo === "PERDA") resumo.kgPerdidos += kg;
    else if (d.tipo === "DOACAO" || d.tipo === "CONSUMO_PROPRIO") resumo.kgDoadosOuConsumidos += kg;
  }
  return resumo;
}
