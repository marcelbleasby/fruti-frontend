"use client";

import { Box, type BoxProps, Flex, Heading, Tabs as ChakraTabs, Text } from "@chakra-ui/react";
import type { HeadingLevel } from "@/components/data-display/heading-level";
import { type ReactNode, useId, useMemo, useState } from "react";
import { BarChart } from "./bar-chart";
import { ChartContainer } from "./chart-container";
import { ChartTable } from "./chart-table";
import { type ChartVariant, formatChartNumber, useChartVariant } from "./chart-theme";
import { DoughnutChart } from "./doughnut-chart";
import { LineChart } from "./line-chart";
import type { CategoryDatum, ChartFallbackTable, ChartState, LineSeries } from "./types";

export type ChartCardType = "bar" | "line" | "doughnut";

type ChartCardData =
  | { type: "bar" | "doughnut"; data: CategoryDatum[]; labels?: never; series?: never; comparison?: never }
  | { type: "line"; labels: string[]; series: LineSeries; comparison?: LineSeries; data?: never };

interface ChartCardBaseProps extends Omit<BoxProps, "children" | "title"> {
  title: ReactNode;
  /** Nível do título (o tamanho vem do papel, não do nível). Padrão h3. */
  headingAs?: HeadingLevel;
  description?: ReactNode;
  /** Unidade dos valores (ex.: "plantas"). */
  unit?: string;
  /** Cabeçalho da 1ª coluna da tabela (ex.: "Espécie", "Mês"). */
  categoryLabel?: string;
  /** Cabeçalho da coluna de valores (barras/rosca; ex.: "Plantas"). */
  valueLabel?: string;
  /** Oferece a aba "Tabela" como alternativa acessível (padrão: true). */
  tableFallback?: boolean;
  /** Substitui a tabela gerada a partir dos dados. */
  fallbackTable?: ChartFallbackTable;
  /** Linha de resumo no rodapé (ex.: "Total: 6.780 plantas em 6 espécies"). */
  summary?: ReactNode;
  /** Conteúdo à direita do cabeçalho (ex.: link "Ver tudo"). */
  actions?: ReactNode;
  state?: ChartState;
  onRetry?: () => void | Promise<unknown>;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Variante do conteúdo; padrão: pela largura do card (1 · 2 · 4 colunas). */
  variant?: ChartVariant;
  /** Altura do gráfico de linha (px). */
  chartHeight?: number;
  /** Rótulo central da rosca. */
  centerLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

export type ChartCardProps = ChartCardBaseProps & ChartCardData;

function buildTable(props: ChartCardProps, fmt: (v: number) => string): ChartFallbackTable {
  if (props.type === "line") {
    const columns = [
      { key: "label", label: props.categoryLabel ?? "Período" },
      { key: "current", label: props.series.label, align: "end" as const },
      ...(props.comparison ? [{ key: "previous", label: props.comparison.label, align: "end" as const }] : []),
    ];
    const rows = props.labels.map((label, i) => ({
      label,
      current: fmt(props.series.data[i] ?? 0),
      previous: props.comparison ? fmt(props.comparison.data[i] ?? 0) : undefined,
    }));
    return { columns, rows };
  }
  const total = props.data.reduce((s, d) => s + d.value, 0);
  const sorted = [...props.data].sort((a, b) => b.value - a.value);
  return {
    columns: [
      { key: "label", label: props.categoryLabel ?? "Categoria" },
      { key: "value", label: props.valueLabel ?? "Valor", align: "end" },
      { key: "share", label: "Participação", align: "end" },
    ],
    rows: sorted.map((d) => ({
      label: d.label,
      value: fmt(d.value),
      share: total
        ? `${formatChartNumber((d.value / total) * 100, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
        : "—",
    })),
  };
}

const OWN_KEYS = new Set<string>([
  "title", "headingAs", "description", "unit", "categoryLabel", "valueLabel", "tableFallback", "fallbackTable", "summary",
  "actions", "state", "onRetry", "emptyTitle", "emptyDescription", "variant", "chartHeight", "centerLabel",
  "formatOptions", "type", "data", "labels", "series", "comparison",
]);

/** Props restantes repassadas ao contêiner (layout: gridColumn, h…). */
function omitChartCardProps(props: ChartCardProps): BoxProps {
  return Object.fromEntries(Object.entries(props).filter(([k]) => !OWN_KEYS.has(k))) as BoxProps;
}

/**
 * ChartCard — card com título, descrição, gráfico (barras, linha ou rosca) e a
 * aba "Tabela" como alternativa acessível. Card · react-chartjs-2 · Tabs.
 */
export function ChartCard(props: ChartCardProps) {
  const {
    title,
    headingAs = "h3",
    description,
    unit,
    tableFallback = true,
    fallbackTable,
    summary,
    actions,
    state = "ready",
    onRetry,
    emptyTitle,
    emptyDescription,
    variant: variantProp,
    chartHeight,
    centerLabel,
    formatOptions,
    type,
  } = props;
  const rest = omitChartCardProps(props);

  const titleId = useId();
  const [view, setView] = useState("grafico");
  const { ref, variant } = useChartVariant(variantProp);
  const fmt = (v: number) => formatChartNumber(v, formatOptions);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const table = useMemo(() => fallbackTable ?? buildTable(props, fmt), [fallbackTable, props]);

  let chart: ReactNode;
  if (props.type === "line") {
    chart = (
      <LineChart
        labels={props.labels}
        series={props.series}
        comparison={variant === "compact" ? undefined : props.comparison}
        variant={variant}
        unit={unit}
        height={chartHeight}
        formatOptions={formatOptions}
      />
    );
  } else if (props.type === "doughnut") {
    chart = (
      <DoughnutChart data={props.data} variant={variant} centerLabel={centerLabel ?? unit} formatOptions={formatOptions} />
    );
  } else {
    chart = (
      <BarChart
        data={props.data}
        variant={variant}
        unit={unit}
        showShare={variant === "expanded"}
        formatOptions={formatOptions}
      />
    );
  }

  const showTabs = tableFallback && state === "ready";

  const container = (showTable: boolean) => (
    <ChartContainer
      state={state}
      onRetry={onRetry}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      fallbackTable={tableFallback ? table : undefined}
      showTable={showTable}
      minHeight={type === "bar" ? 120 : 220}
    >
      {chart}
    </ChartContainer>
  );

  return (
    <Box
      ref={ref}
      as="section"
      aria-labelledby={titleId}
      data-chart-type={type}
      data-variant={variant}
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      p={{ base: "4", md: "5" }}
      display="flex"
      flexDirection="column"
      gap="3"
      minW="0"
      {...rest}
    >
      <ChakraTabs.Root value={view} onValueChange={(d) => setView(d.value)} lazyMount unmountOnExit display="contents">
        <Flex justify="space-between" align="flex-start" gap="2" wrap="wrap">
          <Flex direction="column" gap="0.5" minW="0" flex="1 1 200px">
            <Heading id={titleId} as={headingAs} textStyle="heading.sm" color="fg.heading">
              {title}
            </Heading>
            {description && (
              <Text textStyle="body.sm" color="fg.muted">
                {description}
              </Text>
            )}
          </Flex>
          <Flex align="center" gap="2" flex="none">
            {actions}
            {showTabs && (
              <ChakraTabs.List
                aria-label="Formato"
                display="inline-flex"
                gap="0"
                p="4px"
                bg="bg.muted"
                borderRadius="lg"
                minH="auto"
              >
                {[
                  { value: "grafico", label: "Gráfico" },
                  { value: "tabela", label: "Tabela" },
                ].map((t) => (
                  <ChakraTabs.Trigger
                    key={t.value}
                    value={t.value}
                    h="8"
                    minH="8"
                    px="3"
                    fontSize="sm"
                    fontWeight="500"
                    color="fg.muted"
                    borderRadius="l2"
                    _hover={{ color: "fg.heading" }}
                    _selected={{ bg: "bg.panel", color: "fg.heading", fontWeight: "600", boxShadow: "xs" }}
                  >
                    {t.label}
                  </ChakraTabs.Trigger>
                ))}
              </ChakraTabs.List>
            )}
          </Flex>
        </Flex>

        {showTabs ? (
          <>
            <ChakraTabs.Content value="grafico" p="0" focusVisibleRing="outside">
              {container(false)}
            </ChakraTabs.Content>
            <ChakraTabs.Content value="tabela" p="0" focusVisibleRing="outside">
              <ChartTable {...table} />
            </ChakraTabs.Content>
          </>
        ) : (
          container(false)
        )}
      </ChakraTabs.Root>

      {summary && state === "ready" && (
        <Text fontSize="sm" color="fg.muted">
          {summary}
        </Text>
      )}
    </Box>
  );
}
