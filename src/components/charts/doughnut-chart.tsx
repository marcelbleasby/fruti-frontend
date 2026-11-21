"use client";

import { Box, Flex, type FlexProps, Text, chakra } from "@chakra-ui/react";
import { ArcElement, Chart as ChartJS, type ChartOptions, Tooltip } from "chart.js";
import { type ReactNode, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  CHART_CATEGORICAL_TOKENS,
  type ChartVariant,
  formatChartNumber,
  tooltipDefaults,
  useChartTheme,
} from "./chart-theme";
import type { CategoryDatum } from "./types";

ChartJS.register(ArcElement, Tooltip);

export interface DoughnutChartProps extends Omit<FlexProps, "children"> {
  data: CategoryDatum[];
  /** Rótulo sob o total no centro (ex.: "plantas"). */
  centerLabel?: string;
  /** Substitui o total no centro (padrão: soma formatada). */
  centerValue?: string;
  /** compact: rosca 112px, legenda com as 3 maiores · standard: 160px · expanded: 200px. */
  variant?: ChartVariant;
  /** Itens visíveis na legenda; o resto vira "+N {moreLabel}". */
  maxLegendItems?: number;
  /** Ex.: "espécies" → "+2 espécies". */
  moreLabel?: string;
  /** Link/ação ao lado do "+N" (ex.: <TextLink>ver tudo</TextLink>). */
  moreAction?: ReactNode;
  /** Ordena do maior para o menor (padrão: true). */
  sorted?: boolean;
  ariaLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

const SIZE: Record<ChartVariant, number> = { compact: 112, standard: 160, expanded: 200 };
const pct = (v: number) => `${formatChartNumber(v, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/**
 * DoughnutChart — parte do todo (até ~6 categorias), total no centro e
 * legenda com percentuais escritos (a cor não é o único indicador). Chart.js (Doughnut).
 */
export function DoughnutChart({
  data,
  centerLabel,
  centerValue,
  variant = "standard",
  maxLegendItems,
  moreLabel = "itens",
  moreAction,
  sorted = true,
  ariaLabel,
  formatOptions,
  ...rest
}: DoughnutChartProps) {
  const theme = useChartTheme();
  const rows = useMemo(() => (sorted ? [...data].sort((a, b) => b.value - a.value) : data), [data, sorted]);
  const total = rows.reduce((s, d) => s + d.value, 0);
  const colors = rows.map((d, i) =>
    theme.resolve(d.color ?? CHART_CATEGORICAL_TOKENS[i % CHART_CATEGORICAL_TOKENS.length]),
  );
  const share = (v: number) => (total ? (v / total) * 100 : 0);
  const limit = maxLegendItems ?? (variant === "compact" ? 3 : rows.length);
  const visible = rows.slice(0, limit);
  const hidden = rows.length - visible.length;
  const size = SIZE[variant];

  const label = ariaLabel ?? `Participação: ${rows.map((d) => `${d.label} ${pct(share(d.value))}`).join(", ")}`;

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    animation: false as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults(theme),
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatChartNumber(ctx.parsed, formatOptions)} (${pct(share(ctx.parsed))})`,
        },
      },
    },
  };

  return (
    <Flex align="center" gap={variant === "compact" ? "4" : "6"} wrap="wrap" {...rest}>
      <Box position="relative" boxSize={`${size}px`} flex="none">
        <Doughnut
          data={{
            labels: rows.map((d) => d.label),
            datasets: [
              { data: rows.map((d) => d.value), backgroundColor: colors, borderColor: theme.surface, borderWidth: 2 },
            ],
          }}
          options={options}
          role="img"
          aria-label={label}
        />
        <Flex
          position="absolute"
          inset="0"
          direction="column"
          align="center"
          justify="center"
          pointerEvents="none"
          aria-hidden="true"
        >
          <Text
            textStyle={variant === "compact" ? "heading.md" : "heading.lg"}
            fontWeight="700"
            color="fg.heading"
            css={{ fontVariantNumeric: "tabular-nums" }}
          >
            {centerValue ?? formatChartNumber(total, formatOptions)}
          </Text>
          {centerLabel && (
            <Text fontSize="xs" lineHeight="1rem" color="fg.muted">
              {centerLabel}
            </Text>
          )}
        </Flex>
      </Box>
      <chakra.ul listStyleType="none" m="0" p="0" display="flex" flexDirection="column" gap="2" flex="1 1 140px" minW="0">
        {visible.map((d, i) => (
          <Flex as="li" key={d.label} align="center" gap="2" fontSize="sm" color="fg">
            <chakra.span boxSize="12px" borderRadius="2xs" flex="none" style={{ background: colors[i] }} aria-hidden="true" />
            <chakra.span flex="1" minW="0" truncate>
              {d.label}
            </chakra.span>
            <chakra.span fontWeight="600" css={{ fontVariantNumeric: "tabular-nums" }}>
              {pct(share(d.value))}
            </chakra.span>
          </Flex>
        ))}
        {hidden > 0 && (
          <chakra.li fontSize="sm" color="fg.muted">
            +{hidden} {moreLabel}
            {moreAction ? <> · {moreAction}</> : null}
          </chakra.li>
        )}
      </chakra.ul>
    </Flex>
  );
}
