import { Icon, Stat as ChakraStat, VisuallyHidden } from "@chakra-ui/react";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

export type TrendDirection = "up" | "down" | "flat";
export type TrendSentiment = "positive" | "negative" | "neutral";

export interface Trend {
  /** Variação já formatada, ex.: "+3.380" ou "−650". */
  value: string;
  direction: TrendDirection;
  /** Complemento, ex.: "em 12 meses". */
  label?: string;
  /** Cor da variação. Padrão: up → positive, down → negative, flat → neutral.
   *  Use quando "cair" é bom (ex.: perdas). */
  sentiment?: TrendSentiment;
}

export const TREND_COLOR: Record<TrendSentiment, string> = {
  positive: "primary",
  negative: "danger",
  neutral: "fg.muted",
};

export const TREND_SR_PREFIX: Record<TrendDirection, string> = {
  up: "aumento de ",
  down: "queda de ",
  flat: "estável: ",
};

export function trendSentiment(trend: Trend): TrendSentiment {
  if (trend.sentiment) return trend.sentiment;
  return trend.direction === "up" ? "positive" : trend.direction === "down" ? "negative" : "neutral";
}

const TREND_ICON = { up: ChevronUp, down: ChevronDown, flat: Minus } as const;

export interface StatProps extends Omit<ChakraStat.RootProps, "size"> {
  label: ReactNode;
  /** Valor já formatado (pt-BR), ex.: "6.480". */
  value: ReactNode;
  /** Unidade após o valor, ex.: "ha". */
  unit?: ReactNode;
  trend?: Trend;
  /** Texto auxiliar quando não há variação. */
  helpText?: ReactNode;
}

/**
 * Stat — rótulo 16px, valor 24px/700, variação com ícone + texto (nunca só cor).
 * Chakra v3: Stat.Root · Stat.Label · Stat.ValueText · Stat.HelpText.
 */
export const Stat = forwardRef<HTMLDListElement, StatProps>(function Stat(
  { label, value, unit, trend, helpText, ...rest },
  ref,
) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;
  return (
    <ChakraStat.Root ref={ref} gap="0.5" {...rest}>
      <ChakraStat.Label textStyle="body.sm" color="fg.muted">
        {label}
      </ChakraStat.Label>
      <ChakraStat.ValueText
        textStyle="heading.lg"
        color="fg.heading"
        letterSpacing="normal"
        alignItems="baseline"
        css={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
        {unit && (
          <ChakraStat.ValueUnit fontSize="sm" fontWeight="500" color="fg.muted">
            {unit}
          </ChakraStat.ValueUnit>
        )}
      </ChakraStat.ValueText>
      {trend && TrendIcon ? (
        <ChakraStat.HelpText
          display="inline-flex"
          alignItems="center"
          gap="1"
          fontSize="sm"
          fontWeight="600"
          color={TREND_COLOR[trendSentiment(trend)]}
        >
          <Icon boxSize="3.5">
            <TrendIcon strokeWidth={1.75} />
          </Icon>
          <span>
            <VisuallyHidden>{TREND_SR_PREFIX[trend.direction]}</VisuallyHidden>
            {trend.value}
            {trend.label ? ` ${trend.label}` : null}
          </span>
        </ChakraStat.HelpText>
      ) : helpText ? (
        <ChakraStat.HelpText fontSize="sm" color="fg.muted">
          {helpText}
        </ChakraStat.HelpText>
      ) : null}
    </ChakraStat.Root>
  );
});
