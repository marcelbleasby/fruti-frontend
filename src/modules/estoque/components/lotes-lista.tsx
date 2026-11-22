"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { PackageSearch, Plus } from "lucide-react";
import { SearchField } from "@/components/forms/search-field";
import { Badge } from "@/components/data-display/badge";
import { DataTable, type ColumnDef, type DataTableSort } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Select } from "@/components/forms/select";
import { Switch } from "@/components/forms/switch";
import { PageToolbar, type AppliedFilterChip } from "@/components/layout/page-toolbar";
import { formatData, formatMoeda, hojeISO } from "@/lib/estoque/format";
import {
  CATEGORIA_DE_INSUMO_LABEL,
  CATEGORIA_LABEL,
  ORIGEM_LABEL,
  UNIDADE_LABEL,
  type Lote,
  type OpcaoCatalogo,
  type TipoDeEstoque,
} from "@/lib/estoque/types";
import { useEstoqueUrl } from "../use-estoque-url";
import { SaldoCell } from "./saldo-cell";
import { ValidadeBadge } from "./validade-badge";

export interface LotesListaProps {
  tipo: TipoDeEstoque;
  lotes: Lote[];
  total: number;
  pagina: number;
  tamanhoDaPagina: number;
  /** Espécies (vegetal/produção) para o filtro. */
  especies?: OpcaoCatalogo[];
  /** Mostra "Registrar entrada" no estado vazio (só Proprietário). */
  podeRegistrar?: boolean;
}

const FILTROS = ["busca", "categoria", "especie", "origem", "categoria_insumo", "insumo", "saldo"];

const CATEGORIA_TOM = {
  SEMENTE: "harvest",
  MUDA: "green",
  INSUMO: "gray",
  PRODUTO_COLHIDO: "green",
  PRODUTO_BENEFICIADO: "sky",
} as const;

function ordenacaoDaUrl(ordenar: string | null): DataTableSort | null {
  if (!ordenar) return null;
  return {
    key: ordenar.replace(/^-/, ""),
    dir: ordenar.startsWith("-") ? "desc" : "asc",
  };
}

function colunas(tipo: TipoDeEstoque, hoje: string): ColumnDef<Lote>[] {
  const material: ColumnDef<Lote> = {
    key: "material",
    header: tipo === "insumos" ? "Insumo" : tipo === "producao" ? "Produção" : "Material",
    mobile: "title",
    cell: (l) => (
      <Flex direction="column" minW="0">
        <Text as="span" fontWeight="600" color="fg.heading" truncate>
          {l.material}
        </Text>
        {l.materialDetalhe ? (
          <Text as="span" fontSize="xs" color="fg.muted" fontStyle={tipo === "vegetal" ? "italic" : undefined} truncate>
            {l.materialDetalhe}
          </Text>
        ) : null}
      </Flex>
    ),
  };
  const codigo: ColumnDef<Lote> = {
    key: "codigo",
    header: "Código",
    sortable: true,
    mobile: "subtitle",
    cell: (l) =>
      l.codigo ? (
        <Text as="span" fontFamily="mono" fontSize="sm">
          {l.codigo}
        </Text>
      ) : (
        <Text as="span" color="fg.muted">
          Sem código
        </Text>
      ),
  };
  const categoria: ColumnDef<Lote> = {
    key: "categoria",
    header: "Tipo",
    mobile: "badge",
    cell: (l) => (
      <Badge tone={CATEGORIA_TOM[l.categoria]} whiteSpace="nowrap">
        {CATEGORIA_LABEL[l.categoria]}
      </Badge>
    ),
  };
  const origem: ColumnDef<Lote> = {
    key: "origem",
    header: "Origem",
    cell: (l) => ORIGEM_LABEL[l.origem],
  };
  const entrada: ColumnDef<Lote> = {
    key: "data_de_entrada",
    header: "Entrada",
    sortable: true,
    cell: (l) => (
      <Text as="span" fontVariantNumeric="tabular-nums">
        {formatData(l.data_de_entrada)}
      </Text>
    ),
  };
  const saldo: ColumnDef<Lote> = {
    key: "saldo",
    header: "Saldo",
    cell: (l) => <SaldoCell saldo={l.saldo} inicial={l.quantidade_inicial} unidade={l.unidade} />,
  };
  const validade: ColumnDef<Lote> = {
    key: "validade",
    header: "Validade",
    sortable: true,
    cell: (l) => <ValidadeBadge validade={l.validade} hoje={hoje} />,
  };
  const custo: ColumnDef<Lote> = {
    key: "custo_unitario",
    header: "Custo unit.",
    numeric: true,
    cell: (l) =>
      l.custo_unitario === null ? (
        <Text as="span" color="fg.muted" title="Lote sem valor informado">
          —
        </Text>
      ) : (
        <Text as="span" whiteSpace="nowrap" title={l.custo_completo ? undefined : "Custo incompleto"}>
          {formatMoeda(l.custo_unitario)}
          <Text as="span" color="fg.muted" fontSize="xs">
            /{UNIDADE_LABEL[l.unidade].curta}
          </Text>
          {l.custo_completo ? null : (
            <Text as="span" color="fg.warning" ms="1" aria-label="custo incompleto">
              *
            </Text>
          )}
        </Text>
      ),
  };

  if (tipo === "vegetal") return [material, codigo, categoria, origem, entrada, saldo, validade, custo];
  if (tipo === "insumos") return [material, codigo, origem, entrada, saldo, validade, custo];
  return [material, codigo, categoria, entrada, saldo, validade, custo];
}

export function LotesLista({
  tipo,
  lotes,
  total,
  pagina,
  tamanhoDaPagina,
  especies = [],
  podeRegistrar = false,
}: LotesListaProps) {
  const url = useEstoqueUrl();
  const hoje = hojeISO();
  const comSaldo = url.get("saldo") !== "todos";

  const chips: AppliedFilterChip[] = [];
  const busca = url.get("busca");
  if (busca) chips.push({ id: "busca", label: `“${busca}”` });
  const categoria = url.get("categoria");
  if (categoria && categoria in CATEGORIA_LABEL)
    chips.push({
      id: "categoria",
      label: CATEGORIA_LABEL[categoria as keyof typeof CATEGORIA_LABEL],
    });
  const especie = url.get("especie");
  if (especie)
    chips.push({
      id: "especie",
      label: especies.find((e) => e.value === especie)?.label ?? "Espécie",
    });
  const origem = url.get("origem");
  if (origem && origem in ORIGEM_LABEL)
    chips.push({
      id: "origem",
      label: ORIGEM_LABEL[origem as keyof typeof ORIGEM_LABEL],
    });
  const catInsumo = url.get("categoria_insumo");
  if (catInsumo && catInsumo in CATEGORIA_DE_INSUMO_LABEL)
    chips.push({
      id: "categoria_insumo",
      label: CATEGORIA_DE_INSUMO_LABEL[catInsumo as keyof typeof CATEGORIA_DE_INSUMO_LABEL],
    });
  if (url.get("insumo")) chips.push({ id: "insumo", label: lotes[0]?.material ?? "Insumo" });
  if (!comSaldo) chips.push({ id: "saldo", label: "Inclui esgotados" });

  const filtrando = chips.length > 0;

  const vazio = filtrando ? (
    <EmptyState
      variant="no-results"
      size="md"
      icon={PackageSearch}
      title="Nenhum lote com esses filtros"
      description="Tente outra busca ou limpe os filtros."
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
      icon={PackageSearch}
      title={tipo === "producao" ? "Nenhum lote de produção ainda" : "Nenhum lote em estoque"}
      description={
        tipo === "producao"
          ? "Os lotes vêm das colheitas e dos processamentos."
          : "Registre a primeira entrada para acompanhar o saldo."
      }
      actions={
        podeRegistrar ? (
          <Button onClick={url.abrirEntrada}>
            <Plus aria-hidden /> Registrar entrada
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <Flex direction="column" gap="4">
      <PageToolbar
        search={
          <SearchField
            label="Buscar lotes"
            placeholder={tipo === "insumos" ? "Código, fornecedor ou lote do fabricante" : "Código ou fornecedor"}
            defaultValue={busca ?? ""}
            onSearch={(termo) => url.setFiltros({ busca: termo || null })}
          />
        }
        filters={
          <>
            {tipo === "vegetal" ? (
              <Box flex="0 0 auto">
                <SegmentedControl
                  label="Tipo de material"
                  items={[
                    { value: "todos", label: "Todos" },
                    { value: "SEMENTE", label: "Sementes" },
                    { value: "MUDA", label: "Mudas" },
                  ]}
                  value={categoria ?? "todos"}
                  onValueChange={(v) => url.setFiltros({ categoria: v === "todos" ? null : v })}
                />
              </Box>
            ) : null}
            {tipo !== "insumos" && especies.length > 0 ? (
              <Box flex="1 1 200px" maxW={{ base: "full", md: "230px" }}>
                <Select
                  label="Espécie"
                  hideLabel
                  placeholder="Todas as espécies"
                  options={especies.map((e) => ({
                    value: e.value,
                    label: e.label,
                  }))}
                  value={especie}
                  clearable
                  onValueChange={(v) => url.setFiltros({ especie: v })}
                />
              </Box>
            ) : null}
            {tipo === "insumos" ? (
              <Box flex="1 1 200px" maxW={{ base: "full", md: "230px" }}>
                <Select
                  label="Categoria do insumo"
                  hideLabel
                  placeholder="Todas as categorias"
                  options={Object.entries(CATEGORIA_DE_INSUMO_LABEL).map(([value, label]) => ({ value, label }))}
                  value={catInsumo}
                  clearable
                  onValueChange={(v) => url.setFiltros({ categoria_insumo: v })}
                />
              </Box>
            ) : null}
            {tipo !== "producao" ? (
              <Box flex="1 1 200px" maxW={{ base: "full", md: "230px" }}>
                <Select
                  label="Origem"
                  hideLabel
                  placeholder="Qualquer origem"
                  options={Object.entries(ORIGEM_LABEL).map(([value, label]) => ({ value, label }))}
                  value={origem}
                  clearable
                  onValueChange={(v) => url.setFiltros({ origem: v })}
                />
              </Box>
            ) : null}
            {/* Só insumos: material vegetal e produção mostram só lotes com saldo (padrão do filtro). */}
            {tipo === "insumos" ? (
              <Box flex="0 0 auto">
                <Switch
                  label="Só com saldo"
                  labelPosition="end"
                  checked={comSaldo}
                  onCheckedChange={(c) => url.setFiltros({ saldo: c ? null : "todos" })}
                />
              </Box>
            ) : null}
          </>
        }
        appliedFilters={chips}
        onRemoveFilter={(id) => url.setFiltros({ [id]: null })}
        onClearFilters={() => url.limparFiltros(FILTROS)}
      />

      <Box opacity={url.isPending ? 0.6 : 1} transition="opacity 150ms ease" aria-busy={url.isPending}>
        <DataTable<Lote>
          caption={`Lotes — ${total} no total`}
          columns={colunas(tipo, hoje)}
          data={lotes}
          getRowId={(l) => l.id}
          getRowLabel={(l) => `${l.material}${l.codigo ? ` (${l.codigo})` : ""}`}
          manualSorting
          sort={ordenacaoDaUrl(url.get("ordenar"))}
          onSortChange={(s) =>
            url.setFiltros({
              ordenar: s ? `${s.dir === "desc" ? "-" : ""}${s.key}` : null,
            })
          }
          pagination={{ page: pagina, pageSize: tamanhoDaPagina, total }}
          onPageChange={(p) => url.setFiltros({ pagina: p > 1 ? String(p) : null })}
          onRowClick={(l) => url.abrirLote(l.id)}
          emptyState={vazio}
          minTableWidth="880px"
        />
      </Box>
    </Flex>
  );
}
