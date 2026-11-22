"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Factory, Plus, SearchX } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/data-display/data-table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { DateRangePicker } from "@/components/forms/date-range-picker";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { PageToolbar, type AppliedFilterChip } from "@/components/layout/page-toolbar";
import type { ItemDoProcessamento, Processamento } from "@/lib/beneficiamento/types";
import { formatData, formatMoeda, formatQuantidade, toNumber } from "@/lib/estoque/format";
import { useListaUrl } from "@/lib/use-lista-url";

export interface ProcessamentosListaProps {
  processamentos: Processamento[];
  total: number;
  pagina: number;
  tamanhoDaPagina: number;
  podeRegistrar: boolean;
}

const FILTROS = ["de", "ate", "situacao"];

function resumoDeItens(itens: ItemDoProcessamento[]) {
  if (itens.length === 0) return <Text as="span" color="fg.muted">—</Text>;
  const [primeiro, ...resto] = itens;
  return (
    <Flex direction="column" minW="0">
      <Text as="span" fontWeight="600" color="fg.heading" truncate>
        {primeiro.nome}
        {resto.length > 0 ? (
          <Text as="span" fontWeight="400" color="fg.muted">
            {" "}
            +{resto.length}
          </Text>
        ) : null}
      </Text>
      <Text as="span" fontSize="xs" color="fg.muted" truncate>
        {itens
          .map((i) => (i.unidade ? formatQuantidade(i.quantidade, i.unidade) : i.quantidade))
          .join(" · ")}
      </Text>
    </Flex>
  );
}

const columns: ColumnDef<Processamento>[] = [
  {
    key: "produtos",
    header: "Produtos gerados",
    mobile: "title",
    cell: (p) => resumoDeItens(p.produtosGerados),
  },
  {
    key: "data",
    header: "Data",
    sortable: true,
    mobile: "subtitle",
    cell: (p) => <Text as="span" fontVariantNumeric="tabular-nums">{formatData(p.data)}</Text>,
  },
  {
    key: "entradas",
    header: "Entradas",
    cell: (p) => resumoDeItens(p.lotesDeEntrada),
  },
  {
    key: "rendimento",
    header: "Rendimento",
    numeric: true,
    cell: (p) =>
      p.rendimento.rendimento_pct === null ? (
        <Text as="span" color="fg.muted" title="Sem entradas em kg">
          —
        </Text>
      ) : (
        `${toNumber(p.rendimento.rendimento_pct).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
      ),
  },
  {
    key: "perda_kg",
    header: "Descarte",
    numeric: true,
    cell: (p) => (toNumber(p.perda_kg) > 0 ? formatQuantidade(p.perda_kg, "QUILOGRAMA") : "—"),
  },
  {
    key: "custo",
    header: "Custo",
    numeric: true,
    cell: (p) =>
      p.custoTotal === null ? (
        <Text as="span" color="fg.muted">
          —
        </Text>
      ) : (
        <Text as="span" title={p.custoIncompleto ? "Alguma entrada sem custo" : undefined}>
          {formatMoeda(p.custoTotal)}
          {p.custoIncompleto ? (
            <Text as="span" color="fg.warning" ms="1" aria-label="custo incompleto">
              *
            </Text>
          ) : null}
        </Text>
      ),
  },
  {
    key: "situacao",
    header: "Situação",
    mobile: "badge",
    cell: (p) => <StatusBadge status={p.situacao === "CANCELADO" ? "cancelado" : "registrado"} size="sm" />,
  },
];

export function ProcessamentosLista({ processamentos, total, pagina, tamanhoDaPagina, podeRegistrar }: ProcessamentosListaProps) {
  const url = useListaUrl();
  const de = url.get("de");
  const ate = url.get("ate");
  const situacao = url.get("situacao");

  const chips: AppliedFilterChip[] = [];
  if (de || ate) chips.push({ id: "periodo", label: `${de ? formatData(de) : "…"} – ${ate ? formatData(ate) : "…"}` });
  if (situacao === "REGISTRADO") chips.push({ id: "situacao", label: "Só registrados" });
  if (situacao === "CANCELADO") chips.push({ id: "situacao", label: "Só cancelados" });

  const vazio =
    chips.length > 0 ? (
      <EmptyState
        variant="no-results"
        size="md"
        icon={SearchX}
        title="Nenhum processamento com esses filtros"
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
        icon={Factory}
        title="Nenhum processamento registrado"
        description="Registre a fruta transformada em polpa, suco ou geleia."
        actions={
          podeRegistrar ? (
            <Button onClick={() => url.abrir("registrar")}>
              <Plus aria-hidden /> Registrar processamento
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
            <Box flex="0 0 auto">
              <SegmentedControl
                label="Situação"
                items={[
                  { value: "todos", label: "Todos" },
                  { value: "REGISTRADO", label: "Registrados" },
                  { value: "CANCELADO", label: "Cancelados" },
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
        <DataTable<Processamento>
          caption={`Processamentos — ${total} no total`}
          columns={columns}
          data={processamentos}
          getRowId={(p) => p.id}
          getRowLabel={(p) => `Processamento de ${formatData(p.data)}`}
          manualSorting
          sort={(() => {
            const o = url.get("ordenar");
            return o ? { key: "data", dir: o.startsWith("-") ? "desc" : "asc" } : null;
          })()}
          onSortChange={(s) => url.setFiltros({ ordenar: s ? `${s.dir === "desc" ? "-" : ""}data` : null })}
          pagination={{ page: pagina, pageSize: tamanhoDaPagina, total }}
          onPageChange={(p) => url.setFiltros({ pagina: p > 1 ? String(p) : null })}
          onRowClick={(p) => url.abrir("processamento", p.id)}
          emptyState={vazio}
          minTableWidth="880px"
        />
      </Box>
    </Flex>
  );
}
