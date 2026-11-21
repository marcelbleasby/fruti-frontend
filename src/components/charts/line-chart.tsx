"use client";

import { Box, type BoxProps, Flex, chakra } from "@chakra-ui/react";
import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { type ChartVariant, formatChartNumber, tooltipDefaults, useChartTheme } from "./chart-theme";
import type { LineSeries } from "./types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export interface LineChartProps extends Omit<BoxProps, "children"> {
  /** Rótulos do eixo X (ex.: meses "dez", "jan"…). */
  labels: string[];
  /** Série principal (contínua, primary). */
  series: LineSeries;
  /** Série de comparação (período anterior, tracejada slate.400). */
  comparison?: LineSeries;
  /** Altura do gráfico em px (padrão 220). */
  height?: number;
  /** compact: sem eixo Y nem pontos · expanded: legenda das duas séries. */
  variant?: ChartVariant;
  /** Unidade do tooltip (ex.: "plantios"). */
  unit?: string;
  ariaLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

/**
 * LineChart — tendência no tempo: linha com pontos e, opcionalmente,
 * o período anterior tracejado. Chart.js (Line).
 */
export function LineChart({
  labels,
  series,
  comparison,
  height = 220,
  variant = "standard",
  unit,
  ariaLabel,
  formatOptions,
  ...rest
}: LineChartProps) {
  const theme = useChartTheme();
  const compact = variant === "compact";
  const fmt = (v: number) => formatChartNumber(v, formatOptions);

  const label =
    ariaLabel ??
    (comparison
      ? `${series.label}: ${series.data.map(fmt).join(", ")}. ${comparison.label}: ${comparison.data.map(fmt).join(", ")}`
      : `${series.label} de ${labels[0] ?? ""} a ${labels[labels.length - 1] ?? ""}: ${series.data.map(fmt).join(", ")}`);

  const datasets = [
    {
      label: series.label,
      data: series.data,
      borderColor: theme.primary,
      backgroundColor: theme.primary,
      borderWidth: 2,
      pointRadius: compact ? 0 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: theme.surface,
      pointBorderColor: theme.primary,
      pointBorderWidth: 2,
      cubicInterpolationMode: "monotone" as const,
    },
    ...(comparison
      ? [
          {
            label: comparison.label,
            data: comparison.data,
            borderColor: theme.comparison,
            backgroundColor: theme.comparison,
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            cubicInterpolationMode: "monotone" as const,
          },
        ]
      : []),
  ];

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    // Sem animação: o gráfico aparece pronto (inclusive em redimensionamentos e capturas).
    animation: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        border: { color: theme.grid },
        ticks: { color: theme.text, font: { family: theme.fontFamily, size: 12 }, maxRotation: 0, autoSkipPadding: 8 },
      },
      y: {
        display: !compact,
        beginAtZero: true,
        border: { display: false },
        grid: { color: theme.grid },
        ticks: {
          color: theme.text,
          font: { family: theme.fontFamily, size: 12 },
          precision: 0,
          maxTicksLimit: 5,
          callback: (v) => fmt(Number(v)),
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults(theme),
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.parsed.y ?? 0)}${unit ? ` ${unit}` : ""}`,
        },
      },
    },
  };

  return (
    <Box w="full" {...rest}>
      {comparison && !compact && (
        <Flex as="ul" listStyleType="none" m="0" p="0" gap="4" mb="2" fontSize="xs" lineHeight="1rem" color="fg.muted" wrap="wrap">
          <Flex as="li" align="center" gap="1.5">
            <chakra.span w="16px" h="0" borderTopWidth="2px" borderColor="primary" aria-hidden="true" />
            {series.label}
          </Flex>
          <Flex as="li" align="center" gap="1.5">
            <chakra.span w="16px" h="0" borderTopWidth="2px" borderStyle="dashed" borderColor="slate.400" aria-hidden="true" />
            {comparison.label}
          </Flex>
        </Flex>
      )}
      <Box position="relative" h={`${height}px`}>
        <Line data={{ labels, datasets }} options={options} role="img" aria-label={label} />
      </Box>
    </Box>
  );
}
