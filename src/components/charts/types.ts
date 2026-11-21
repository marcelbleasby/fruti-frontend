import type { ReactNode } from "react";

/** Um valor por categoria (barras e rosca). */
export interface CategoryDatum {
  label: string;
  value: number;
  /** Token de cor (ex.: "harvest.700"); padrão: paleta categórica do DS. */
  color?: string;
}

/** Série temporal (linha). */
export interface LineSeries {
  label: string;
  data: number[];
}

/** Coluna da tabela alternativa aos gráficos. */
export interface ChartTableColumn {
  key: string;
  label: string;
  align?: "start" | "end";
}

/** Tabela equivalente ao gráfico (leitores de tela e quem prefere números). */
export interface ChartFallbackTable {
  caption?: string;
  columns: ChartTableColumn[];
  rows: Record<string, ReactNode>[];
}

/** Estado de carregamento do bloco de gráfico. */
export type ChartState = "loading" | "empty" | "error" | "ready";
