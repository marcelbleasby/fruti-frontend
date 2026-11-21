import { AbsoluteCenter, Box, ProgressCircle as ChakraProgressCircle } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";

export type ProgressCircleSize = "md" | "lg";

const SIZES: Record<ProgressCircleSize, { box: string; thickness: string; font: string }> = {
  md: { box: "64px", thickness: "8px", font: "xs" },
  lg: { box: "88px", thickness: "8px", font: "xl" },
};

export interface ProgressCircleProps
  extends Omit<ChakraProgressCircle.RootProps, "size" | "value" | "colorPalette"> {
  /** 0–100. `null` = indeterminado. */
  value: number | null;
  max?: number;
  /** Legenda abaixo do anel (nomeia o progresso). */
  label?: ReactNode;
  /** md 64px · lg 88px (padrão) */
  size?: ProgressCircleSize;
  tone?: "green" | "harvest";
  /** Mostra o valor no centro. Padrão true. */
  showValueText?: boolean;
  formatValue?: (value: number, max: number) => string;
}

/**
 * ProgressCircle — anel com trilha bg.muted e ponta arredondada; valor ao centro (700, fg.heading).
 * Chakra v3: ProgressCircle.Root · Circle · Track · Range · ValueText · Label.
 */
export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(function ProgressCircle(
  {
    value,
    max = 100,
    label,
    size = "lg",
    tone = "green",
    showValueText = true,
    formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
    ...rest
  },
  ref,
) {
  const s = SIZES[size];
  return (
    <ChakraProgressCircle.Root
      ref={ref}
      value={value}
      max={max}
      display="inline-flex"
      flexDirection="column"
      alignItems="flex-start"
      gap="1.5"
      {...rest}
    >
      <Box position="relative" display="inline-flex">
        <ChakraProgressCircle.Circle css={{ "--size": s.box, "--thickness": s.thickness }}>
          <ChakraProgressCircle.Track css={{ "--track-color": "colors.bg.muted" }} />
          <ChakraProgressCircle.Range
            stroke={tone === "harvest" ? "accent" : "primary"}
            strokeLinecap="round"
          />
        </ChakraProgressCircle.Circle>
        {showValueText && value !== null && (
          <AbsoluteCenter>
            <ChakraProgressCircle.ValueText fontSize={s.font} fontWeight="700" color="fg.heading">
              {formatValue(value, max)}
            </ChakraProgressCircle.ValueText>
          </AbsoluteCenter>
        )}
      </Box>
      {label && (
        <ChakraProgressCircle.Label fontSize="xs" lineHeight="1rem" color="fg.muted" fontWeight="400">
          {label}
        </ChakraProgressCircle.Label>
      )}
    </ChakraProgressCircle.Root>
  );
});
