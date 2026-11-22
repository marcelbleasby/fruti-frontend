"use client";

import { Box } from "@chakra-ui/react";
import { LandPlot, Sprout, TreeDeciduous, Warehouse } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  ActivityHeatmap,
  BarChart,
  ChartCard,
  ChartContainer,
  ChartTable,
  type ChartVariant,
  DEFAULT_REPORT_FILTERS,
  DoughnutChart,
  LineChart,
  MetricGroup,
  type MetricGroupItem,
  ReportFilters,
  type ReportFiltersValue,
} from "@/components/charts";
import { FlowDiagram } from "@/components/diagrams";
import {
  ACTIVITY_DAYS,
  AREA_OPTIONS,
  MONTHS,
  NEW_PLANTINGS,
  NEW_PLANTINGS_PREV,
  PLANTS_BY_SPECIES,
  SPECIES_OPTIONS,
} from "../fixtures";
import { Demo, ShowcaseSection, Variant, VariantGrid } from "../showcase";

/** Item da VariantGrid; `full` ocupa a linha inteira (variante expanded). */
function Cell({ full, children }: { full?: boolean; children: ReactNode }) {
  return (
    <Box gridColumn={full ? "1 / -1" : undefined} minW="0">
      {children}
    </Box>
  );
}

const VARIANTS: ChartVariant[] = ["compact", "standard", "expanded"];
/** Largura típica de cada variante (1 · 2 · 4 colunas do Bento). */
const VARIANT_MAX_W: Record<ChartVariant, string> = {
  compact: "300px",
  standard: "640px",
  expanded: "100%",
};

const METRICS: MetricGroupItem[] = [
  {
    label: "Área cultivada",
    value: "18,4",
    unit: "ha",
    icon: <LandPlot />,
    trend: { value: "+4,2 ha", direction: "up", label: "em 12 meses" },
  },
  { label: "Plantios em campo", value: 9, icon: <Sprout /> },
  { label: "Plantas", value: 6480, icon: <TreeDeciduous /> },
  {
    label: "Mudas livres",
    value: 1150,
    icon: <Warehouse />,
    description: "1 lote com estoque baixo",
  },
];

const MONTHLY_TABLE = {
  caption: "Novos plantios por mês",
  columns: [
    { key: "mes", label: "Mês" },
    { key: "n", label: "Plantios", align: "end" as const },
  ],
  rows: MONTHS.slice(0, 5).map((m, i) => ({
    mes: m,
    n: NEW_PLANTINGS.data[i],
  })),
};

const FLOW = `flowchart LR
  L["Lote LM-2026-014<br/>500 mudas"] --> P["Plantio PL-0042<br/>12/03/2026"] --> A["Área A-03<br/>2,4 ha"]`;

export function GraficosSection() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    ...DEFAULT_REPORT_FILTERS,
    areaId: "ar-03",
  });

  return (
    <ShowcaseSection
      id="graficos"
      title="Gráficos e diagramas"
      description="Indicadores com react-chartjs-2 e Mermaid. A variante de conteúdo segue a largura do bloco: 1 coluna (compact), 2 (standard) e 4 (expanded)."
    >
      <Demo
        name="ReportFilters"
        importPath="@/components/charts"
        description="Período, área e espécie; filtros aplicados viram chips removíveis."
      >
        <Variant label="Controlado · área A-03">
          <ReportFilters
            value={filters}
            onChange={setFilters}
            areas={AREA_OPTIONS}
            species={SPECIES_OPTIONS}
          />
        </Variant>
      </Demo>

      <Demo name="MetricGroup" importPath="@/components/charts">
        <Variant label="Pronto">
          <MetricGroup metrics={METRICS} />
        </Variant>
        <Variant label="Carregando">
          <MetricGroup metrics={[]} loading />
        </Variant>
      </Demo>

      <Demo
        name="BarChart"
        importPath="@/components/charts"
        description="Barras horizontais ordenadas, com valor direto."
      >
        <VariantGrid min="300px">
          {VARIANTS.map((v) => (
            <Cell key={v} full={v === "expanded"}>
              <Variant label={`variant ${v}`}>
                <BarChart
                  data={PLANTS_BY_SPECIES}
                  unit="plantas"
                  variant={v}
                  showShare={v !== "compact"}
                />
              </Variant>
            </Cell>
          ))}
        </VariantGrid>
      </Demo>

      <Demo
        name="LineChart"
        importPath="@/components/charts"
        description="Série mensal; no expanded, comparação com o período anterior (tracejada)."
      >
        <VariantGrid min="300px">
          <Variant label="variant compact">
            <LineChart
              labels={MONTHS}
              series={NEW_PLANTINGS}
              variant="compact"
              height={80}
              unit="plantios"
            />
          </Variant>
          <Variant label="variant standard">
            <LineChart
              labels={MONTHS}
              series={NEW_PLANTINGS}
              variant="standard"
              unit="plantios"
            />
          </Variant>
          <Cell full>
            <Variant label="variant expanded · com comparação">
              <LineChart
                labels={MONTHS}
                series={NEW_PLANTINGS}
                comparison={NEW_PLANTINGS_PREV}
                variant="expanded"
                unit="plantios"
              />
            </Variant>
          </Cell>
        </VariantGrid>
      </Demo>

      <Demo
        name="DoughnutChart"
        importPath="@/components/charts"
        description="Parte do todo, total no centro e legenda com %."
      >
        <VariantGrid min="300px">
          {VARIANTS.map((v) => (
            <Variant key={v} label={`variant ${v}`}>
              <DoughnutChart
                data={PLANTS_BY_SPECIES}
                centerLabel="plantas"
                variant={v}
                moreLabel="espécies"
              />
            </Variant>
          ))}
        </VariantGrid>
      </Demo>

      <Demo
        name="ActivityHeatmap"
        importPath="@/components/charts"
        description="Atividade por dia (semanas em colunas), níveis 0 a 5+."
      >
        <VariantGrid min="300px">
          {VARIANTS.map((v) => (
            <Cell key={v} full={v === "expanded"}>
              <Variant label={`variant ${v}`}>
                <ActivityHeatmap
                  days={
                    v === "compact"
                      ? ACTIVITY_DAYS.slice(-12 * 7)
                      : ACTIVITY_DAYS
                  }
                  variant={v}
                  unit="registros"
                />
              </Variant>
            </Cell>
          ))}
        </VariantGrid>
      </Demo>

      <Demo
        name="ChartContainer"
        importPath="@/components/charts"
        description="Reserva a altura do gráfico em todos os estados."
      >
        <VariantGrid min="300px">
          <Variant label="state loading">
            <ChartContainer state="loading" fallbackTable={MONTHLY_TABLE} />
          </Variant>
          <Variant label="state empty">
            <ChartContainer
              state="empty"
              emptyTitle="Sem dados no período"
              emptyDescription="Amplie o período para ver plantios."
            />
          </Variant>
          <Variant label="state error">
            <ChartContainer state="error" onRetry={() => undefined} />
          </Variant>
          <Variant label="state ready">
            <ChartContainer state="ready" fallbackTable={MONTHLY_TABLE}>
              <LineChart
                labels={MONTHS}
                series={NEW_PLANTINGS}
                unit="plantios"
              />
            </ChartContainer>
          </Variant>
          <Variant label="showTable">
            <ChartContainer
              state="ready"
              fallbackTable={MONTHLY_TABLE}
              showTable
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="ChartTable" importPath="@/components/charts">
        <Variant label="Tabela alternativa" maxW="420px">
          <ChartTable {...MONTHLY_TABLE} />
        </Variant>
      </Demo>

      <Demo
        name="ChartCard"
        importPath="@/components/charts"
        description="Card com abas Gráfico/Tabela (alternativa acessível)."
      >
        <VariantGrid min="360px">
          <Variant label="type bar" p="0" bg="transparent" borderWidth="0">
            <ChartCard headingAs="h4"
              type="bar"
              title="Plantas por espécie"
              description="Plantios em campo · do maior para o menor"
              data={PLANTS_BY_SPECIES}
              unit="plantas"
              categoryLabel="Espécie"
              valueLabel="Plantas"
              summary="Total: 6.480 plantas em 5 espécies"
            />
          </Variant>
          <Variant label="type doughnut" p="0" bg="transparent" borderWidth="0">
            <ChartCard headingAs="h4"
              type="doughnut"
              title="Participação por espécie"
              data={PLANTS_BY_SPECIES}
              centerLabel="plantas"
              categoryLabel="Espécie"
              valueLabel="Plantas"
            />
          </Variant>
          <Cell full>
            <Variant
              label="type line · comparação"
              p="0"
              bg="transparent"
              borderWidth="0"
            >
              <ChartCard headingAs="h4"
                type="line"
                title="Novos plantios por mês"
                description="Últimos 12 meses · por data de plantio"
                labels={MONTHS}
                series={NEW_PLANTINGS}
                comparison={NEW_PLANTINGS_PREV}
                unit="plantios"
                categoryLabel="Mês"
                summary="16 plantios · +100% vs. ano anterior"
              />
            </Variant>
          </Cell>
          <Variant label="state loading" p="0" bg="transparent" borderWidth="0">
            <ChartCard headingAs="h4"
              type="bar"
              title="Plantas por espécie"
              data={[]}
              state="loading"
            />
          </Variant>
          <Variant label="state empty" p="0" bg="transparent" borderWidth="0">
            <ChartCard headingAs="h4"
              type="bar"
              title="Plantas por espécie"
              data={[]}
              state="empty"
              emptyTitle="Nenhum plantio em campo"
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="FlowDiagram"
        importPath="@/components/diagrams"
        description="Mermaid carregado só quando entra na tela; a legenda em texto descreve o mesmo fluxo."
      >
        <Box maxW={VARIANT_MAX_W.standard}>
          <FlowDiagram headingAs="h4"
            title="Rastreabilidade"
            definition={FLOW}
            description="O lote LM-2026-014 originou o plantio PL-0042, realizado na área A-03."
          />
        </Box>
      </Demo>
    </ShowcaseSection>
  );
}
