"use client";

import { Box, type BoxProps, Flex, Text, VisuallyHidden, chakra } from "@chakra-ui/react";
import { useMemo } from "react";
import { HEATMAP_LEVEL_TOKENS, type ChartVariant, formatChartNumber } from "./chart-theme";

export interface HeatmapDay {
  /** `YYYY-MM-DD` */
  date: string;
  count: number;
}

export interface ActivityHeatmapProps extends Omit<BoxProps, "children"> {
  /** Um registro por dia (dias ausentes contam como 0). */
  days: HeatmapDay[];
  /** compact: células 12px · standard/expanded: 18px (board BentoDados › Atividade). */
  variant?: ChartVariant;
  /** Palavra do tooltip (padrão "eventos"). */
  unit?: string;
  /** Rótulo acessível; padrão com total e semana mais ativa. */
  ariaLabel?: string;
  /** Mostra a legenda Menos → Mais (padrão: true). */
  showLegend?: boolean;
}

const WEEKDAY_LABELS = ["seg", "", "qua", "", "sex", "", "dom"];
const DAY_MS = 86_400_000;

function parseUTC(iso: string): number {
  return Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
}

function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Nível 0…5 (5 = 5 ou mais eventos). */
export function heatmapLevel(count: number): number {
  return Math.max(0, Math.min(5, Math.floor(count)));
}

/**
 * ActivityHeatmap — mapa de calor por dia (colunas = semanas, linhas = seg…dom).
 * Níveis 0 · 1 · 2 · 3 · 4 · 5+ com HEATMAP_LEVEL_TOKENS; cada célula tem título
 * e o conjunto tem um resumo em texto (a cor não é o único canal).
 */
export function ActivityHeatmap({
  days,
  variant = "standard",
  unit = "eventos",
  ariaLabel,
  showLegend = true,
  ...rest
}: ActivityHeatmapProps) {
  const cell = variant === "compact" ? 12 : 18;
  const gap = 4; // grade de 4 (células fluidas encolhem até 7px)
  const minCell = 7;

  const { weeks, total, peakWeek } = useMemo(() => {
    if (days.length === 0) return { weeks: [] as { date: string; count: number }[][], total: 0, peakWeek: 0 };
    const counts = new Map(days.map((d) => [d.date.slice(0, 10), d.count]));
    const times = days.map((d) => parseUTC(d.date));
    const first = Math.min(...times);
    const last = Math.max(...times);
    // Segunda-feira da primeira semana (getUTCDay: 0 = domingo).
    const start = first - ((new Date(first).getUTCDay() + 6) % 7) * DAY_MS;
    const cols: { date: string; count: number }[][] = [];
    for (let t = start; t <= last; t += 7 * DAY_MS) {
      const col: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const ms = t + d * DAY_MS;
        const iso = toISO(ms);
        col.push({ date: iso, count: ms < first || ms > last ? -1 : (counts.get(iso) ?? 0) });
      }
      cols.push(col);
    }
    const sums = cols.map((c) => c.reduce((s, d) => s + Math.max(0, d.count), 0));
    return { weeks: cols, total: sums.reduce((a, b) => a + b, 0), peakWeek: Math.max(0, ...sums) };
  }, [days]);

  const label =
    ariaLabel ??
    `Mapa de calor de atividade nas últimas ${weeks.length} semanas: ${formatChartNumber(total)} ${unit}; semana mais ativa com ${formatChartNumber(peakWeek)} ${unit}`;

  const swatch = (level: number) => (
    <chakra.span
      key={level}
      display="block"
      boxSize={`${cell}px`}
      borderRadius="4px"
      bg={HEATMAP_LEVEL_TOKENS[level]}
      flex="none"
    />
  );

  return (
    <Box display="flex" flexDirection="column" gap="2" maxW="full" minW="0" overflowX="auto" {...rest}>
      {/* Grade fluida: as colunas encolhem até `minCell` para caber na largura do bloco; abaixo disso, rola dentro dele. */}
      <chakra.figure
        m="0"
        display="grid"
        role="img"
        aria-label={label}
        gridTemplateColumns={`${variant === "compact" ? "0px" : "24px"} repeat(${weeks.length}, minmax(${minCell}px, ${cell}px))`}
        justifyContent="start"
        gridTemplateRows="repeat(7, auto)"
        gridAutoFlow="column"
        columnGap={`${gap}px`}
        rowGap={`${gap}px`}
        minW="0"
      >
        {WEEKDAY_LABELS.map((d, i) => (
          <chakra.span
            key={`l${i}`}
            aria-hidden="true"
            fontSize="xs"
            lineHeight="1"
            color="fg.muted"
            alignSelf="center"
            whiteSpace="nowrap"
          >
            {variant === "compact" ? "" : d}
          </chakra.span>
        ))}
        {weeks.flatMap((col) =>
          col.map((d) =>
            d.count < 0 ? (
              <chakra.span key={d.date} aria-hidden="true" display="block" aspectRatio="1" />
            ) : (
              <chakra.span
                key={d.date}
                aria-hidden="true"
                display="block"
                aspectRatio="1"
                borderRadius="22%"
                bg={HEATMAP_LEVEL_TOKENS[heatmapLevel(d.count)]}
                title={`${d.date.split("-").reverse().join("/")}: ${formatChartNumber(d.count)} ${unit}`}
              />
            ),
          ),
        )}
      </chakra.figure>
      {showLegend && (
        <Flex align="center" gap="1.5" fontSize="xs" lineHeight="1rem" color="fg.muted">
          <Text as="span">Menos</Text>
          <Flex gap="4px" aria-hidden="true">
            {HEATMAP_LEVEL_TOKENS.map((_, level) => swatch(level))}
          </Flex>
          <Text as="span">Mais</Text>
          <VisuallyHidden>(de 0 a 5 ou mais {unit} por dia)</VisuallyHidden>
        </Flex>
      )}
    </Box>
  );
}
