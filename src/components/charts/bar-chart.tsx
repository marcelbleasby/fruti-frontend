"use client";

import { Box, type BoxProps } from "@chakra-ui/react";
import { BarElement, CategoryScale, Chart as ChartJS, type ChartOptions, LinearScale, type Plugin, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { type ChartVariant, formatChartNumber, tooltipDefaults, useChartTheme } from "./chart-theme";
import type { CategoryDatum } from "./types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export interface BarChartProps extends Omit<BoxProps, "children"> {
  data: CategoryDatum[];
  /** Ordena do maior para o menor (padrão: true). */
  sorted?: boolean;
  /** Unidade usada no tooltip e no rótulo acessível (ex.: "plantas"). */
  unit?: string;
  /** compact: barras 20px · standard/expanded: 26px (board ChartCard). */
  variant?: ChartVariant;
  /** Mostra a participação (%) ao lado do valor. */
  showShare?: boolean;
  /** Descrição acessível; padrão: "Manga 2.100, Caju 1.600 … plantas". */
  ariaLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

interface BarLabelOptions {
  track: string;
  text: string;
  font: string;
  labels: string[];
}

/** Desenha o trilho de cada barra e o valor direto à direita (sem legenda). */
const barDecorations: Plugin<"bar"> = {
  id: "frutiBarDecorations",
  beforeDatasetsDraw(chart, _args, opts) {
    const o = opts as unknown as BarLabelOptions;
    const { ctx, chartArea } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.fillStyle = o.track;
    for (const el of meta.data) {
      const { y, height } = el.getProps(["y", "height"], true) as { y: number; height: number };
      ctx.beginPath();
      ctx.roundRect(chartArea.left, y - height / 2, chartArea.right - chartArea.left, height, 8);
      ctx.fill();
    }
    ctx.restore();
  },
  afterDatasetsDraw(chart, _args, opts) {
    const o = opts as unknown as BarLabelOptions;
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.fillStyle = o.text;
    ctx.font = o.font;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    meta.data.forEach((el, i) => {
      const { y } = el.getProps(["y"], true) as { y: number };
      ctx.fillText(o.labels[i] ?? "", chart.width - 2, y);
    });
    ctx.restore();
  },
};

/**
 * BarChart — barras horizontais ordenadas, com trilho e valor direto.
 * Para comparar categorias (ex.: plantas por espécie). Chart.js (Bar, indexAxis y).
 */
export function BarChart({
  data,
  sorted = true,
  unit,
  variant = "standard",
  showShare,
  ariaLabel,
  formatOptions,
  ...rest
}: BarChartProps) {
  const theme = useChartTheme();
  const rows = useMemo(() => (sorted ? [...data].sort((a, b) => b.value - a.value) : data), [data, sorted]);
  const total = rows.reduce((sum, d) => sum + d.value, 0);
  const max = Math.max(1, ...rows.map((d) => d.value));
  const thickness = variant === "compact" ? 20 : 26;
  const rowGap = variant === "compact" ? 10 : 12;
  const height = rows.length * (thickness + rowGap) + 4;

  const valueLabels = rows.map((d) => {
    const v = formatChartNumber(d.value, formatOptions);
    if (!showShare || total === 0) return v;
    return `${v}  ${formatChartNumber((d.value / total) * 100, { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
  });
  const valueWidth = showShare ? 112 : 56;

  const label =
    ariaLabel ??
    `${rows.map((d) => `${d.label} ${formatChartNumber(d.value, formatOptions)}`).join(", ")}${unit ? ` ${unit}` : ""}`;

  const chartData = {
    labels: rows.map((d) => d.label),
    datasets: [
      {
        data: rows.map((d) => d.value),
        backgroundColor: rows.map((d) => (d.color ? theme.resolve(d.color) : theme.primary)),
        borderRadius: 8,
        borderSkipped: false as const,
        barThickness: thickness,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    layout: { padding: { right: valueWidth } },
    scales: {
      x: { display: false, min: 0, max },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: theme.textStrong,
          font: { family: theme.fontFamily, size: 16 },
          padding: 8,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults(theme),
        callbacks: {
          label: (ctx: { parsed: { x: number | null } }) =>
            `${formatChartNumber(ctx.parsed.x ?? 0, formatOptions)}${unit ? ` ${unit}` : ""}`,
        },
      },
      frutiBarDecorations: {
        track: theme.track,
        text: theme.textStrong,
        font: `600 16px ${theme.fontFamily}`,
        labels: valueLabels,
      },
    },
  };

  return (
    <Box position="relative" w="full" h={`${height}px`} {...rest}>
      <Bar
        data={chartData}
        options={options as ChartOptions<"bar">}
        plugins={[barDecorations]}
        role="img"
        aria-label={label}
      />
    </Box>
  );
}
