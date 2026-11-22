"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Plus, SearchX, Truck } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/data-display/data-table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { DateRangePicker } from "@/components/forms/date-range-picker";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Select } from "@/components/forms/select";
import { PageToolbar, type AppliedFilterChip } from "@/components/layout/page-toolbar";
import { TIPO_DE_DESTINACAO_LABEL, type Destinacao, type TipoDeDestinacao } from "@/lib/beneficiamento/types";
import { formatData, formatMoeda, formatQuantidade } from "@/lib/estoque/format";
import { useListaUrl } from "@/lib/use-lista-url";
import { TipoDeDestinacaoBadge } from "./tipo-de-destinacao";

const FILTROS = ["de", "ate", "situacao", "tipo"];

const columns: ColumnDef<Destinacao>[] = [
  {
    key: "lotes",
    header: "O que saiu",
    mobile: "title",
    cell: (d) => {
      const [primeiro, ...resto] = d.lotes;
      if (!primeiro) return <Text as="span" color="fg.muted">—</Text>;
      return (
        <Flex direction="column" minW="0">
          <Text as="span" fontWeight="600" color="fg.heading" truncate>
            {primeiro.nome}
            {resto.length ? (
              <Text as="span" fontWeight="400" color="fg.muted">
                {" "}
                +{resto.length}
              </Text>
            ) : null}
          </Text>
          <Text as="span" fontSize="xs" color="fg.muted" truncate>
            {d.lotes.map((l) => (l.unidade ? formatQuantidade(l.quantidade, l.unidade) : l.quantidade)).join(" · ")}
          </Text>
        </Flex>
      );
    },
  },
  {
    key: "data",
    header: "Data",
    sortable: true,
    mobile: "subtitle",
    cell: (d) => <Text as="span" fontVariantNumeric="tabular-nums">{formatData(d.data)}</Text>,
  },
  {
    key: "tipo",
    header: "Tipo",
    mobile: "badge",
    cell: (d) => <TipoDeDestinacaoBadge tipo={d.tipo} />,
  },
  {
    key: "comprador",
    header: "Comprador",
    cell: (d) => (d.comprador ? d.comprador : <Text as="span" color="fg.muted">—</Text>),
  },
  {
    key: "valor_total",
    header: "Valor",
    numeric: true,
    cell: (d) => (d.valor_total === null ? <Text as="span" color="fg.muted">—</Text> : formatMoeda(d.valor_total)),
  },
  {
    key: "situacao",
    header: "Situação",
    cell: (d) => <StatusBadge status={d.situacao === "CANCELADO" ? "cancelado" : "registrado"} size="sm" />,
  },
];

export function DestinacoesLista({
  destinacoes,
  total,
  pagina,
  tamanhoDaPagina,
  podeRegistrar,
}: {
  destinacoes: Destinacao[];
  total: number;
  pagina: number;
  tamanhoDaPagina: number;
  podeRegistrar: boolean;
}) {
  const url = useListaUrl();
  const de = url.get("de");
  const ate = url.get("ate");
  const situacao = url.get("situacao");
  const tipo = url.get("tipo") as TipoDeDestinacao | null;

  const chips: AppliedFilterChip[] = [];
  if (de || ate) chips.push({ id: "periodo", label: `${de ? formatData(de) : "…"} – ${ate ? formatData(ate) : "…"}` });
  if (tipo && tipo in TIPO_DE_DESTINACAO_LABEL) chips.push({ id: "tipo", label: TIPO_DE_DESTINACAO_LABEL[tipo] });
  if (situacao === "REGISTRADO") chips.push({ id: "situacao", label: "Só registradas" });
  if (situacao === "CANCELADO") chips.push({ id: "situacao", label: "Só canceladas" });

  const vazio =
    chips.length > 0 ? (
      <EmptyState
        variant="no-results"
        size="md"
        icon={SearchX}
        title="Nenhuma destinação com esses filtros"
        description="Tente outro período ou limpe os filtros."
        actions={
          <Button variant="outline" onClick={() => url.limparFiltros(FILTROS)}>
            Limpar filtros
          </Button>
        }
      />
    ) : (
      <EmptyState
        variant="first-use"
        size="md"
        icon={Truck}
        title="Nenhuma destinação registrada"
        description="Registre vendas, doações, perdas e compostagem."
        actions={
          podeRegistrar ? (
            <Button onClick={() => url.abrir("registrar")}>
              <Plus aria-hidden /> Registrar destinação
            </Button>
          ) : undefined
        }
      />
    );

  return (
    <Flex direction="column" gap="4">
      <PageToolbar
        filters={
          <>
            <Box flex="1 1 260px" maxW={{ base: "full", md: "320px" }}>
              <DateRangePicker
                label="Período"
                hideLabel
                placeholder="Qualquer período"
                value={{ start: de, end: ate }}
                onValueChange={(v) => url.setFiltros({ de: v.start, ate: v.end })}
              />
            </Box>
            <Box flex="1 1 200px" maxW={{ base: "full", md: "230px" }}>
              <Select
                label="Tipo"
                hideLabel
                placeholder="Todos os tipos"
                clearable
                options={Object.entries(TIPO_DE_DESTINACAO_LABEL).map(([value, label]) => ({ value, label }))}
                value={tipo}
                onValueChange={(v) => url.setFiltros({ tipo: v })}
              />
            </Box>
            <Box flex="0 0 auto">
              <SegmentedControl
                label="Situação"
                items={[
                  { value: "todos", label: "Todas" },
                  { value: "REGISTRADO", label: "Registradas" },
                  { value: "CANCELADO", label: "Canceladas" },
                ]}
                value={situacao ?? "todos"}
                onValueChange={(v) => url.setFiltros({ situacao: !v || v === "todos" ? null : v })}
              />
            </Box>
          </>
        }
        appliedFilters={chips}
        onRemoveFilter={(id) => url.setFiltros(id === "periodo" ? { de: null, ate: null } : { [id]: null })}
        onClearFilters={() => url.limparFiltros(FILTROS)}
      />

      <Box opacity={url.isPending ? 0.6 : 1} transition="opacity 150ms ease" aria-busy={url.isPending}>
        <DataTable<Destinacao>
          caption={`Destinações — ${total} no total`}
          columns={columns}
          data={destinacoes}
          getRowId={(d) => d.id}
          getRowLabel={(d) => `${TIPO_DE_DESTINACAO_LABEL[d.tipo]} de ${formatData(d.data)}`}
          manualSorting
          sort={(() => {
            const o = url.get("ordenar");
            return o ? { key: "data", dir: o.startsWith("-") ? "desc" : "asc" } : null;
          })()}
          onSortChange={(s) => url.setFiltros({ ordenar: s ? `${s.dir === "desc" ? "-" : ""}data` : null })}
          pagination={{ page: pagina, pageSize: tamanhoDaPagina, total }}
          onPageChange={(p) => url.setFiltros({ pagina: p > 1 ? String(p) : null })}
          onRowClick={(d) => url.abrir("destinacao", d.id)}
          emptyState={vazio}
          minTableWidth="820px"
        />
      </Box>
    </Flex>
  );
}
