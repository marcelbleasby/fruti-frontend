import { GridItem, type GridItemProps } from "@chakra-ui/react";

export type BentoSpan = 1 | 2 | 4;
export type BentoRowSpan = 1 | 2;
export type BentoTone = "default" | "subtle" | "inverse";
export type BentoPadding = "md" | "lg";

export interface BentoTileProps extends Omit<GridItemProps, "colSpan" | "rowSpan" | "padding" | "as"> {
  /** Colunas no desktop (4 col.). No tablet/mobile (2 col.) o 4 ocupa a largura toda. */
  colSpan?: BentoSpan;
  /** Linhas a partir de 1280 px; abaixo disso cada tile ocupa 1 linha e cresce com o conteúdo. */
  rowSpan?: BentoRowSpan;
  tone?: BentoTone;
  padding?: BentoPadding;
  as?: "section" | "article";
}

const spanMap = {
  1: { base: 1, xl: 1 },
  2: { base: 2, xl: 2 },
  4: { base: 2, xl: 4 },
} as const satisfies Record<BentoSpan, { base: number; xl: number }>;

const paddingMap = {
  md: { base: "16px", md: "20px", xl: "20px" },
  lg: { base: "20px", xl: "24px" },
} as const satisfies Record<BentoPadding, Record<string, string>>;

/** Bloco do BentoGrid. Use só colSpan 1, 2 ou 4; cada linha deve somar 4 colunas. */
export function BentoTile({
  colSpan = 1,
  rowSpan = 1,
  tone = "default",
  padding = "md",
  as = "section",
  ...props
}: BentoTileProps) {
  return (
    <GridItem
      as={as}
      colSpan={spanMap[colSpan]}
      rowSpan={{ base: 1, xl: rowSpan }}
      layerStyle={`bento.${tone}`}
      p={paddingMap[padding]}
      minW="0"
      display="flex"
      flexDirection="column"
      {...props}
    />
  );
}
