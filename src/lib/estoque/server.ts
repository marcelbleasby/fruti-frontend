import "server-only";

import type { Pagina } from "@/lib/api/fruti-api";
import { authedApiFetch } from "@/lib/auth/session";
import { DIAS_ALERTA_VALIDADE, diasEntre, hojeISO, toNumber } from "./format";
import {
  CATEGORIA_DE_INSUMO_LABEL,
  CATEGORIA_LABEL,
  type CategoriaDeInsumo,
  type LoteApi,
  type Lote,
  type MovimentacaoApi,
  type OpcaoCatalogo,
  type ResumoDoEstoque,
  type SaldoDeInsumo,
  type TipoDeEstoque,
  type Unidade,
} from "./types";

export const TAMANHO_DA_PAGINA = 20;
/** Máximo que a API devolve numa página; usado para catálogos e resumos. */
const MAXIMO = 200;

const ROTA_DE_LOTES: Record<TipoDeEstoque, string> = {
  vegetal: "estoque-vegetal/lotes",
  insumos: "estoque-de-insumos/lotes",
  producao: "estoque-de-producao/lotes",
};

type Params = Record<string, string | number | boolean | null | undefined>;

function query(params: Params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* ------------------------------------------------------------------ */
/* Filtros (vêm da URL)                                                */
/* ------------------------------------------------------------------ */

export interface FiltrosDeLotes {
  busca?: string;
  categoria?: string;
  especieId?: string;
  origem?: string;
  insumoId?: string;
  categoriaDoInsumo?: string;
  /** Padrão: só lotes com saldo. */
  comSaldo: boolean;
  ordenar?: string;
  pagina: number;
}

const ORDENACOES = new Set(["data_de_entrada", "-data_de_entrada", "codigo", "-codigo", "validade", "-validade"]);

/** Lê os filtros da URL, descartando valores fora do que a API aceita. */
export function filtrosDaUrl(sp: Record<string, string | string[] | undefined>): FiltrosDeLotes {
  const s = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const pagina = Math.max(1, Number.parseInt(s("pagina") ?? "1", 10) || 1);
  const ordenar = s("ordenar");
  return {
    busca: s("busca"),
    categoria: s("categoria"),
    especieId: s("especie"),
    origem: s("origem"),
    insumoId: s("insumo"),
    categoriaDoInsumo: s("categoria_insumo"),
    comSaldo: s("saldo") !== "todos",
    ordenar: ordenar && ORDENACOES.has(ordenar) ? ordenar : undefined,
    pagina,
  };
}

/* ------------------------------------------------------------------ */
/* Lotes                                                               */
/* ------------------------------------------------------------------ */

export async function listarLotes(propriedadeId: string, tipo: TipoDeEstoque, f: FiltrosDeLotes) {
  const params: Params = {
    busca: f.busca,
    com_saldo: f.comSaldo ? true : undefined,
    ordenar: f.ordenar,
    limit: TAMANHO_DA_PAGINA,
    offset: (f.pagina - 1) * TAMANHO_DA_PAGINA,
  };
  if (tipo === "vegetal") Object.assign(params, { categoria: f.categoria, especie_id: f.especieId, origem: f.origem });
  if (tipo === "insumos")
    Object.assign(params, { insumo_id: f.insumoId, categoria_do_insumo: f.categoriaDoInsumo, origem: f.origem });
  if (tipo === "producao") Object.assign(params, { especie_id: f.especieId });

  return authedApiFetch<Pagina<LoteApi>>(`/propriedades/${propriedadeId}/${ROTA_DE_LOTES[tipo]}${query(params)}`);
}

/**
 * Cards do topo. A API não tem endpoint de agregados, então soma os lotes com
 * saldo (até 200, os de validade mais próxima primeiro).
 */
export async function resumoDoEstoque(propriedadeId: string, tipo: TipoDeEstoque): Promise<ResumoDoEstoque> {
  const { itens, total } = await authedApiFetch<Pagina<LoteApi>>(
    `/propriedades/${propriedadeId}/${ROTA_DE_LOTES[tipo]}${query({ com_saldo: true, ordenar: "validade", limit: MAXIMO })}`,
  );
  const hoje = hojeISO();
  const resumo: ResumoDoEstoque = {
    comSaldo: total,
    vencemEm30Dias: 0,
    vencidos: 0,
    valorEmEstoque: 0,
    semCusto: 0,
    considerados: itens.length,
  };
  for (const l of itens) {
    if (l.vencido) resumo.vencidos += 1;
    else if (l.validade && diasEntre(hoje, l.validade) <= DIAS_ALERTA_VALIDADE) resumo.vencemEm30Dias += 1;
    if (l.custo_unitario === null) resumo.semCusto += 1;
    else resumo.valorEmEstoque += toNumber(l.saldo) * toNumber(l.custo_unitario);
  }
  return resumo;
}

export async function obterLoteApi(id: string) {
  return authedApiFetch<LoteApi>(`/lotes/${id}`);
}

export async function listarMovimentacoes(loteId: string) {
  const { itens } = await authedApiFetch<Pagina<MovimentacaoApi>>(`/lotes/${loteId}/movimentacoes?limit=${MAXIMO}`);
  return itens;
}

/* ------------------------------------------------------------------ */
/* Insumos: saldos agregados                                           */
/* ------------------------------------------------------------------ */

export async function listarSaldosDeInsumos(
  propriedadeId: string,
  f: { busca?: string; categoriaDoInsumo?: string; pagina: number },
) {
  return authedApiFetch<Pagina<SaldoDeInsumo>>(
    `/propriedades/${propriedadeId}/estoque-de-insumos/saldos${query({
      busca: f.busca,
      categoria_do_insumo: f.categoriaDoInsumo,
      limit: TAMANHO_DA_PAGINA,
      offset: (f.pagina - 1) * TAMANHO_DA_PAGINA,
    })}`,
  );
}

export async function resumoDeInsumos(propriedadeId: string): Promise<ResumoDoEstoque> {
  const { itens, total } = await authedApiFetch<Pagina<SaldoDeInsumo>>(
    `/propriedades/${propriedadeId}/estoque-de-insumos/saldos?limit=${MAXIMO}`,
  );
  const hoje = hojeISO();
  const resumo: ResumoDoEstoque = {
    comSaldo: itens.filter((s) => toNumber(s.saldo) > 0).length,
    vencemEm30Dias: 0,
    vencidos: 0,
    valorEmEstoque: 0,
    semCusto: 0,
    considerados: Math.min(itens.length, total),
  };
  for (const s of itens) {
    if (s.validade_mais_proxima) {
      const dias = diasEntre(hoje, s.validade_mais_proxima);
      if (dias < 0) resumo.vencidos += 1;
      else if (dias <= DIAS_ALERTA_VALIDADE) resumo.vencemEm30Dias += 1;
    }
    if (s.custo_medio === null) resumo.semCusto += 1;
    else resumo.valorEmEstoque += toNumber(s.saldo) * toNumber(s.custo_medio);
  }
  return resumo;
}

/* ------------------------------------------------------------------ */
/* Catálogo (para nomes e selects)                                     */
/* ------------------------------------------------------------------ */

interface EspecieApi {
  id: string;
  nome_comum: string;
  nome_cientifico: string;
  ativa: boolean;
}
interface CultivarApi {
  id: string;
  especie_id: string;
  nome: string;
}
interface InsumoApi {
  id: string;
  nome: string;
  categoria: CategoriaDeInsumo;
  unidade_padrao: Unidade;
  fabricante: string;
}
interface ProdutoApi {
  id: string;
  nome: string;
  especie_id: string | null;
  unidade: Unidade;
}

export interface Catalogo {
  especies: Map<string, EspecieApi>;
  cultivares: Map<string, CultivarApi>;
  insumos: Map<string, InsumoApi>;
  produtos: Map<string, ProdutoApi>;
}

const porId = <T extends { id: string }>(lista: T[]) => new Map(lista.map((x) => [x.id, x]));

/** Carrega só o que o estoque precisa para dar nome aos lotes. */
export async function carregarCatalogo(propriedadeId: string, tipo: TipoDeEstoque): Promise<Catalogo> {
  const vazio = Promise.resolve({ itens: [] as never[], total: 0 });
  // Catálogo é só para nomes: se falhar, a lista aparece com nomes genéricos em vez de quebrar a tela.
  const tolerante = <T,>(p: Promise<Pagina<T>>, nome: string) =>
    p.catch((err) => {
      console.error(`[estoque] catálogo indisponível (${nome})`, err);
      return { itens: [] as T[], total: 0 };
    });
  const [especies, cultivares, insumos, produtos] = await Promise.all([
    tipo === "insumos"
      ? vazio
      : tolerante(authedApiFetch<Pagina<EspecieApi>>(`/catalogo/especies?ordenar=nome_comum&limit=${MAXIMO}`), "espécies"),
    tipo === "vegetal"
      ? tolerante(authedApiFetch<Pagina<CultivarApi>>(`/catalogo/cultivares?ordenar=nome&limit=${MAXIMO}`), "cultivares")
      : vazio,
    tipo === "insumos"
      ? tolerante(authedApiFetch<Pagina<InsumoApi>>(`/propriedades/${propriedadeId}/insumos?ordenar=nome&limit=${MAXIMO}`), "insumos")
      : vazio,
    tipo === "producao"
      ? tolerante(authedApiFetch<Pagina<ProdutoApi>>(`/propriedades/${propriedadeId}/produtos?limit=${MAXIMO}`), "produtos")
      : vazio,
  ]);
  return {
    especies: porId(especies.itens),
    cultivares: porId(cultivares.itens),
    insumos: porId(insumos.itens),
    produtos: porId(produtos.itens),
  };
}

export function nomearLote(l: LoteApi, c: Catalogo): Lote {
  const especie = l.especie_id ? c.especies.get(l.especie_id) : undefined;
  if (l.insumo_id) {
    const insumo = c.insumos.get(l.insumo_id);
    return {
      ...l,
      material: insumo?.nome ?? "Insumo",
      materialDetalhe: insumo ? CATEGORIA_DE_INSUMO_LABEL[insumo.categoria] : undefined,
    };
  }
  if (l.produto_id) {
    const produto = c.produtos.get(l.produto_id);
    return { ...l, material: produto?.nome ?? "Produto", materialDetalhe: CATEGORIA_LABEL[l.categoria] };
  }
  const cultivar = l.cultivar_id ? c.cultivares.get(l.cultivar_id) : undefined;
  const nome = especie?.nome_comum || especie?.nome_cientifico || "Espécie";
  return {
    ...l,
    material: cultivar ? `${nome} · ${cultivar.nome}` : nome,
    materialDetalhe: l.categoria === "PRODUTO_COLHIDO" ? CATEGORIA_LABEL[l.categoria] : especie?.nome_cientifico,
  };
}

export function opcoesDeEspecies(c: Catalogo): OpcaoCatalogo[] {
  return [...c.especies.values()]
    .filter((e) => e.ativa)
    .map((e) => ({ value: e.id, label: e.nome_comum || e.nome_cientifico }));
}

export function opcoesDeCultivares(c: Catalogo): OpcaoCatalogo[] {
  return [...c.cultivares.values()].map((cv) => ({ value: cv.id, label: cv.nome, grupo: cv.especie_id }));
}

export function opcoesDeInsumos(c: Catalogo): OpcaoCatalogo[] {
  return [...c.insumos.values()].map((i) => ({
    value: i.id,
    label: i.fabricante ? `${i.nome} (${i.fabricante})` : i.nome,
    grupo: i.categoria,
    unidade: i.unidade_padrao,
  }));
}
