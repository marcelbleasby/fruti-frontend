import { Box, type BoxProps, Flex, chakra } from "@chakra-ui/react";
import { areaSquareMeters, formatHectares, formatNumber, formatSquareMeters } from "../../format";

export type AreaMeasurementDisplaySize = "sm" | "md";

export interface AreaMeasurementDisplayProps extends Omit<BoxProps, "children"> {
  /** Comprimento em metros (lado horizontal). */
  length: number;
  /** Largura em metros (lado vertical). */
  width: number;
  /** Mostra a área dentro do retângulo (m² abaixo de 1 ha, ha a partir de 1 ha). */
  showArea?: boolean;
  /** Caixa-limite do desenho · sm: 120 × 60 px · md (padrão): 220 × 100 px. */
  size?: AreaMeasurementDisplaySize;
  /** Largura máxima do desenho em px (sobrescreve `size`). */
  maxWidth?: number;
  /** Altura máxima do desenho em px (sobrescreve `size`). */
  maxHeight?: number;
}

/** Caixa-limite do board "Áreas": 300 × 80 m → 220 × 59 px; 200 × 200 m → 100 × 100 px. */
const BOX: Record<AreaMeasurementDisplaySize, { w: number; h: number }> = {
  sm: { w: 120, h: 60 },
  md: { w: 220, h: 100 },
};
/** Lado mínimo em px para que retângulos muito estreitos continuem legíveis. */
const MIN_SIDE = 16;

function DimensionLine({ label, vertical }: { label: string; vertical?: boolean }) {
  const line = <chakra.span flex="1 1 auto" bg="border.control" {...(vertical ? { w: "1px", minH: "2" } : { h: "1px", minW: "2" })} />;
  return (
    <Flex
      direction={vertical ? "column" : "row"}
      align="center"
      gap={vertical ? "1" : "1.5"}
      minW="0"
      {...(vertical ? { h: "full" } : { w: "full" })}
      aria-hidden="true"
    >
      {line}
      <chakra.span textStyle="caption" fontWeight="400" color="fg.muted" whiteSpace="nowrap">
        {label}
      </chakra.span>
      {line}
    </Flex>
  );
}

/**
 * AreaMeasurementDisplay — retângulo com a proporção real entre comprimento e
 * largura, com as cotas em texto. Chakra v3: Box · Text.
 * Encolhe com o contêiner: o desenho ocupa até `maxSide` px e mantém a
 * proporção por `aspect-ratio`; as cotas acompanham pelas células do grid.
 */
export function AreaMeasurementDisplay({
  length,
  width,
  showArea = false,
  size = "md",
  maxWidth,
  maxHeight,
  ...rest
}: AreaMeasurementDisplayProps) {
  const boxW = maxWidth ?? BOX[size].w;
  const boxH = maxHeight ?? BOX[size].h;
  const valid = length > 0 && width > 0;
  const ratio = valid ? width / length : 0.5;
  // Encaixe "contain" na caixa-limite; a altura sai do aspect-ratio, então o
  // desenho também encolhe junto com o contêiner.
  const scale = Math.min(boxW, boxH / ratio);
  const maxW = Math.max(MIN_SIDE, Math.round(scale));
  const drawnH = maxW * ratio;
  const m2 = areaSquareMeters(length, width);
  const areaLabel = m2 >= 10_000 ? formatHectares(m2, { trimZero: true }) : formatSquareMeters(m2);
  const lengthLabel = `${formatNumber(length)} m`;
  const widthLabel = `${formatNumber(width)} m`;
  const showLabel = showArea && valid && drawnH >= 24 && maxW >= 56;

  return (
    <Box
      role="img"
      aria-label={`Retângulo de ${lengthLabel} por ${widthLabel}${showArea && valid ? `, ${areaLabel}` : ""}`}
      display="grid"
      gridTemplateColumns={`minmax(0, ${maxW}px) auto`}
      justifyContent="start"
      columnGap="2"
      rowGap="1.5"
      maxW="full"
      minW="0"
      {...rest}
    >
      <Box
        w="full"
        aspectRatio={valid ? `${length} / ${width}` : "2 / 1"}
        minH={`${MIN_SIDE}px`}
        boxSizing="border-box"
        borderWidth="2px"
        borderStyle={valid ? "solid" : "dashed"}
        borderColor={valid ? "primary" : "border.control"}
        borderRadius="sm"
        bg={valid ? "primary.subtle" : "bg.subtle"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textStyle={size === "sm" ? "caption" : "label"}
        fontWeight="600"
        color="fg.heading"
        overflow="hidden"
        aria-hidden="true"
      >
        {showLabel ? areaLabel : null}
      </Box>
      <DimensionLine label={valid ? widthLabel : "— m"} vertical />
      <DimensionLine label={valid ? lengthLabel : "— m"} />
    </Box>
  );
}
