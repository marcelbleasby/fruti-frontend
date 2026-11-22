/**
 * Tipos do estoque, espelhando os esquemas do fruti-api (apps/estoque, apps/catalogo).
 * Decimais chegam da API como string ("12.500"); datas como "AAAA-MM-DD".
 */

export type Categoria = "SEMENTE" | "MUDA" | "INSUMO" | "PRODUTO_COLHIDO" | "PRODUTO_BENEFICIADO";
export type Origem = "ADQUIRIDO" | "PRODUZIDO";
export type Unidade = "UNIDADE" | "GRAMA" | "QUILOGRAMA" | "TONELADA" | "MILILITRO" | "LITRO" | "METRO_CUBICO";
export type CategoriaDeInsumo =
  | "FERTILIZANTE"
  | "ADUBO_ORGANICO"
  | "CORRETIVO"
  | "DEFENSIVO"
  | "SUBSTRATO"
  | "EMBALAGEM"
  | "OUTRO";
export type TipoDeMovimentacao =
  | "ENTRADA"
  | "CONSUMO_EM_PLANTIO"
  | "CONSUMO_EM_PRODUCAO"
  | "CONSUMO_EM_ATIVIDADE"
  | "CONSUMO_EM_PROCESSAMENTO"
  | "DESTINACAO"
  | "PERDA"
  | "AJUSTE";

/** Os três estoques com tela própria. */
export type TipoDeEstoque = "vegetal" | "insumos" | "producao";

export interface LoteApi {
  id: string;
  propriedade_id: string;
  categoria: Categoria;
  especie_id: string | null;
  cultivar_id: string | null;
  insumo_id: string | null;
  produto_id: string | null;
  origem: Origem;
  lote_de_origem_id: string | null;
  codigo: string;
  fornecedor: string;
  data_de_entrada: string;
  quantidade_inicial: string;
  unidade: Unidade;
  saldo: string;
  valor_total: string | null;
  custo_herdado: string | null;
  custo_adicional: string | null;
  custo_total: string | null;
  custo_unitario: string | null;
  custo_completo: boolean;
  taxa_de_germinacao_pct: string | null;
  validade: string | null;
  vencido: boolean;
  lote_do_fabricante: string;
  procedencia: string;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
}

/** Lote com os nomes do catálogo já resolvidos (a API só manda os ids). */
export interface Lote extends LoteApi {
  /** "Manga · Palmer", "Ureia", "Polpa de manga"… */
  material: string;
  /** Segunda linha: nome científico, categoria do insumo… */
  materialDetalhe?: string;
}

export interface MovimentacaoApi {
  id: string;
  lote_id: string;
  tipo: TipoDeMovimentacao;
  quantidade: string;
  data: string;
  custo: string | null;
  justificativa: string;
  observacoes: string;
  lote_produzido_id: string | null;
  criado_por_id: string | null;
  criado_em: string;
}

export interface SaldoDeInsumo {
  insumo_id: string;
  nome: string;
  categoria: CategoriaDeInsumo;
  unidade: Unidade;
  saldo: string;
  lotes: number;
  custo_medio: string | null;
  validade_mais_proxima: string | null;
}

export interface OpcaoCatalogo {
  value: string;
  label: string;
  /** Espécie da cultivar; unidade padrão do insumo… */
  grupo?: string;
  unidade?: Unidade;
}

/** Resumo para os cards do topo (calculado dos lotes com saldo). */
export interface ResumoDoEstoque {
  comSaldo: number;
  vencemEm30Dias: number;
  vencidos: number;
  valorEmEstoque: number;
  semCusto: number;
  /** Lotes considerados no cálculo (máx. 200 por requisição da API). */
  considerados: number;
}

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  SEMENTE: "Semente",
  MUDA: "Muda",
  INSUMO: "Insumo",
  PRODUTO_COLHIDO: "Fruta colhida",
  PRODUTO_BENEFICIADO: "Produto beneficiado",
};

export const ORIGEM_LABEL: Record<Origem, string> = {
  ADQUIRIDO: "Adquirido",
  PRODUZIDO: "Produzido",
};

export const CATEGORIA_DE_INSUMO_LABEL: Record<CategoriaDeInsumo, string> = {
  FERTILIZANTE: "Fertilizante",
  ADUBO_ORGANICO: "Adubo orgânico",
  CORRETIVO: "Corretivo",
  DEFENSIVO: "Defensivo",
  SUBSTRATO: "Substrato",
  EMBALAGEM: "Embalagem",
  OUTRO: "Outro",
};

export const MOVIMENTACAO_LABEL: Record<TipoDeMovimentacao, string> = {
  ENTRADA: "Entrada",
  CONSUMO_EM_PLANTIO: "Consumo em plantio",
  CONSUMO_EM_PRODUCAO: "Consumo em produção",
  CONSUMO_EM_ATIVIDADE: "Consumo em atividade",
  CONSUMO_EM_PROCESSAMENTO: "Consumo em processamento",
  DESTINACAO: "Destinação",
  PERDA: "Perda",
  AJUSTE: "Ajuste",
};

export const UNIDADE_LABEL: Record<Unidade, { singular: string; plural: string; curta: string }> = {
  UNIDADE: { singular: "unidade", plural: "unidades", curta: "un" },
  GRAMA: { singular: "grama", plural: "gramas", curta: "g" },
  QUILOGRAMA: { singular: "quilograma", plural: "quilogramas", curta: "kg" },
  TONELADA: { singular: "tonelada", plural: "toneladas", curta: "t" },
  MILILITRO: { singular: "mililitro", plural: "mililitros", curta: "mL" },
  LITRO: { singular: "litro", plural: "litros", curta: "L" },
  METRO_CUBICO: { singular: "metro cúbico", plural: "metros cúbicos", curta: "m³" },
};

/** Unidades aceitas no estoque de material vegetal (muda: só UNIDADE). */
export const UNIDADES_VEGETAIS: Unidade[] = ["UNIDADE", "GRAMA", "QUILOGRAMA"];
