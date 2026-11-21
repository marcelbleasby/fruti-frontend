import { Grid, type GridProps } from "@chakra-ui/react";

export type BentoGridProps = GridProps;

/**
 * Grid do Bento: 2 colunas até 1279 px e 4 a partir de 1280 px.
 * Linhas com altura mínima (120 / 190 / 200 px) e crescimento automático.
 */
export function BentoGrid(props: BentoGridProps) {
  return (
    <Grid
      templateColumns={{ base: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }}
      autoRows={{ base: "minmax(120px, auto)", md: "minmax(192px, auto)", xl: "minmax(200px, auto)" }}
      gap={{ base: "12px", md: "16px", xl: "16px" }}
      {...props}
    />
  );
}
