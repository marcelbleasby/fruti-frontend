import { Box, Icon, type BoxProps } from "@chakra-ui/react";
import type { ElementType } from "react";

export type IndicatorTone = "primary" | "neutral" | "danger" | "warning" | "info";

const toneColors: Record<IndicatorTone, { outer: string; middle: string; inner: string }> = {
  primary: { outer: "green.50", middle: "green.100", inner: "green.700" },
  neutral: { outer: "sage.100", middle: "sage.300", inner: "slate.500" },
  danger: { outer: "red.50", middle: "red.100", inner: "red.700" },
  warning: { outer: "harvest.50", middle: "harvest.100", inner: "harvest.700" },
  info: { outer: "sky.50", middle: "sky.100", inner: "sky.800" },
};

export interface ConcentricIndicatorProps extends Omit<BoxProps, "children"> {
  icon: ElementType;
  tone?: IndicatorTone;
  /** Diâmetro externo em px (os círculos internos seguem a proporção 1 : 0,72 : 0,46). */
  diameter: number;
  iconSize: number;
}

/** Três círculos concêntricos com o ícone ao centro — usado por EmptyState, ErrorState e telas de auth. */
export function ConcentricIndicator({
  icon,
  tone = "primary",
  diameter,
  iconSize,
  ...rest
}: ConcentricIndicatorProps) {
  const c = toneColors[tone];
  const middle = Math.round(diameter * 0.72);
  const inner = Math.round(diameter * 0.46);
  return (
    <Box
      aria-hidden
      flex="none"
      width={`${diameter}px`}
      height={`${diameter}px`}
      borderRadius="full"
      bg={c.outer}
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      <Box
        width={`${middle}px`}
        height={`${middle}px`}
        borderRadius="full"
        bg={c.middle}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          width={`${inner}px`}
          height={`${inner}px`}
          borderRadius="full"
          bg={c.inner}
          color="fg.inverted"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} width={`${iconSize}px`} height={`${iconSize}px`} strokeWidth={1.75} />
        </Box>
      </Box>
    </Box>
  );
}
