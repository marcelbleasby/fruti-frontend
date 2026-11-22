/**
 * Tipos do beneficiamento (processamentos e produtos), espelhando
 * apps/beneficiamento/esquemas.py do fruti-api. Decimais chegam como string.
 */
import type { Categoria, Unidade } from "@/lib/estoque/types";

export type SituacaoDoRegistro = "REGISTRADO" | "CANCELADO";
export type TipoDeProduto = "POLPA" | "SUCO" | "GELEIA" | "DESIDRATADO" | "CONSERVA" | "OUTRO";

export interface ProdutoApi {
  id: string;
  propriedade_id: string;
  nome: string;
  tipo: TipoDeProduto;
  especie_id: string | null;
  unidade: Unidade;
  descricao: string;
  criado_em: string;
}

export interface ConsumoApi {
  lote_id: string;
  categoria: Categoria;
  quantidade: string;
  custo: string | null;
}

export interface ProdutoGeradoApi {
  produto_id: string;
  quantidade: string;
  lote_id: string;
}

export interface ProcessamentoApi {
  id: string;
  propriedade_id: string;
  data: string;
  entradas: ConsumoApi[];
  saidas: ProdutoGeradoApi[];
  perda_kg: string;
  custo_adicional: string | null;
  rendimento: { kg_de_entrada: string; rendimento_pct: string | null; saida_por_kg: Record<string, string> };
  situacao: SituacaoDoRegistro;
  motivo_do_cancelamento: string;
  observacoes: string;
  criado_em: string;
}

/** Item de entrada/saída com nome e unidade resolvidos. */
export interface ItemDoProcessamento {
  loteId: string;
  codigo: string;
  nome: string;
  detalhe?: string;
  quantidade: string;
  unidade: Unidade | null;
  custo: string | null;
}

export interface Processamento extends ProcessamentoApi {
  /** Lotes do estoque de produção consumidos (fruta, produtos). */
  lotesDeEntrada: ItemDoProcessamento[];
  /** Insumos consumidos (saem do estoque de insumos). */
  insumosConsumidos: ItemDoProcessamento[];
  /** Produtos gerados, cada um num lote novo do estoque de produção. */
  produtosGerados: ItemDoProcessamento[];
  /** Soma dos custos das entradas + custo adicional; null se nenhum custo é conhecido. */
  custoTotal: number | null;
  custoIncompleto: boolean;
}

export interface ResumoDosProcessamentos {
  registrados: number;
  kgProcessados: number;
  /** Média ponderada pelo kg de entrada; null sem dados em kg. */
  rendimentoMedio: number | null;
  perdaKg: number;
  considerados: number;
  total: number;
}

export const TIPO_DE_PRODUTO_LABEL: Record<TipoDeProduto, string> = {
  POLPA: "Polpa",
  SUCO: "Suco",
  GELEIA: "Geleia",
  DESIDRATADO: "Desidratado",
  CONSERVA: "Conserva",
  OUTRO: "Outro",
};

export const SITUACAO_LABEL: Record<SituacaoDoRegistro, string> = {
  REGISTRADO: "Registrado",
  CANCELADO: "Cancelado",
};

/** Unidades oferecidas ao criar um produto. */
export const UNIDADES_DE_PRODUTO: Unidade[] = ["QUILOGRAMA", "GRAMA", "UNIDADE", "LITRO", "MILILITRO"];

/* ------------------------------------------------------------------ */
/* Destinação                                                          */
/* ------------------------------------------------------------------ */

export type TipoDeDestinacao = "VENDA" | "DOACAO" | "CONSUMO_PROPRIO" | "PERDA" | "COMPOSTAGEM";

export interface DestinacaoApi {
  id: string;
  propriedade_id: string;
  tipo: TipoDeDestinacao;
  data: string;
  itens: ConsumoApi[];
  valor_total: string | null;
  comprador: string;
  lote_de_composto_id: string | null;
  situacao: SituacaoDoRegistro;
  motivo_do_cancelamento: string;
  observacoes: string;
  criado_em: string;
}

export interface Destinacao extends DestinacaoApi {
  /** Lotes que saíram do estoque de produção, com nome e unidade. */
  lotes: ItemDoProcessamento[];
  /** Soma das quantidades em kg (o que não é kg fica de fora). */
  kg: number;
  /** Lote de adubo orgânico gerado pela compostagem. */
  composto: ItemDoProcessamento | null;
}

export interface ResumoDasDestinacoes {
  vendas: number;
  valorVendido: number;
  kgVendidos: number;
  kgPerdidos: number;
  /** Doação + consumo próprio. */
  kgDoadosOuConsumidos: number;
  considerados: number;
  total: number;
}

export const TIPO_DE_DESTINACAO_LABEL: Record<TipoDeDestinacao, string> = {
  VENDA: "Venda",
  DOACAO: "Doação",
  CONSUMO_PROPRIO: "Consumo próprio",
  PERDA: "Perda",
  COMPOSTAGEM: "Compostagem",
};

/** Título curto (uma palavra) dos cards de escolha do tipo; a descrição completa o sentido. */
export const TIPO_DE_DESTINACAO_CURTO: Record<TipoDeDestinacao, string> = {
  VENDA: "Venda",
  DOACAO: "Doação",
  CONSUMO_PROPRIO: "Consumo",
  PERDA: "Perda",
  COMPOSTAGEM: "Compostagem",
};

export const TIPO_DE_DESTINACAO_DESCRICAO: Record<TipoDeDestinacao, string> = {
  VENDA: "Saída com comprador e valor",
  DOACAO: "Entregue sem cobrança",
  CONSUMO_PROPRIO: "Usado na própria propriedade",
  PERDA: "Estragou ou foi descartado",
  COMPOSTAGEM: "Vira adubo orgânico",
};
