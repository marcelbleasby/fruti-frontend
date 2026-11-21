import { Flex, Progress as ChakraProgress } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";

export type ProgressSize = "sm" | "md" | "lg";

const HEIGHT: Record<ProgressSize, string> = { sm: "4px", md: "8px", lg: "12px" };

export interface ProgressProps extends Omit<ChakraProgress.RootProps, "size" | "value" | "colorPalette" | "variant"> {
  /** Rótulo visível (também nomeia a barra para leitores de tela). */
  label: ReactNode;
  /** 0–100. `null` = indeterminado (sem aria-valuenow). */
  value: number | null;
  max?: number;
  /** sm 4px · md 8px (padrão) · lg 12px */
  size?: ProgressSize;
  /** green (padrão) · harvest (atenção, ex.: quase esgotado) */
  tone?: "green" | "harvest";
  /** Mostra o valor à direita do rótulo. Padrão true quando determinado. */
  showValueText?: boolean;
  /** Formata o valor exibido. Padrão: "64%". */
  formatValue?: (value: number, max: number) => string;
  /** Texto auxiliar abaixo da barra. */
  helperText?: ReactNode;
}

/**
 * Progress — trilha bg.muted, preenchimento primário, pílula.
 * Chakra v3: Progress.Root · Progress.Label · Progress.Track · Progress.Range.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    label,
    value,
    max = 100,
    size = "md",
    tone = "green",
    showValueText,
    formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
    helperText,
    ...rest
  },
  ref,
) {
  const showValue = (showValueText ?? true) && value !== null;
  return (
    <ChakraProgress.Root
      ref={ref}
      value={value}
      max={max}
      display="flex"
      flexDirection="column"
      gap="1.5"
      {...rest}
    >
      <Flex justify="space-between" gap="2" fontSize="sm" color="fg">
        <ChakraProgress.Label fontWeight="400">{label}</ChakraProgress.Label>
        {showValue && value !== null && (
          <ChakraProgress.ValueText fontWeight="600" css={{ fontVariantNumeric: "tabular-nums" }}>
            {formatValue(value, max)}
          </ChakraProgress.ValueText>
        )}
      </Flex>
      <ChakraProgress.Track
        position="relative"
        h={HEIGHT[size]}
        bg="bg.muted"
        borderRadius="full"
        overflow="hidden"
      >
        <ChakraProgress.Range
          bgColor={tone === "harvest" ? "accent" : "primary"}
          borderRadius="full"
          css={{
            "&[data-state=indeterminate]": { minWidth: "35%", backgroundImage: "none" },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
      </ChakraProgress.Track>
      {helperText && (
        <Flex fontSize="xs" lineHeight="1rem" color="fg.muted">
          {helperText}
        </Flex>
      )}
    </ChakraProgress.Root>
  );
});
