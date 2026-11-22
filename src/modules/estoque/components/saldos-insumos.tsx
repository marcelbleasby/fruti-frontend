"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { PackageSearch } from "lucide-react";
import { SearchField } from "@/components/forms/search-field";
import { DataTable, type ColumnDef } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { Select } from "@/components/forms/select";
import { PageToolbar, type AppliedFilterChip } from "@/components/layout/page-toolbar";
import { formatMoeda, formatQuantidade, hojeISO, toNumber } from "@/lib/estoque/format";
import { CATEGORIA_DE_INSUMO_LABEL, UNIDADE_LABEL, type SaldoDeInsumo } from "@/lib/estoque/types";
import { useEstoqueUrl } from "../use-estoque-url";
import { ValidadeBadge } from "./validade-badge";

/** Insumos: saldo somado por insumo. Clicar abre os lotes daquele insumo. */
export function SaldosInsumos({
  saldos,
  total,
  pagina,
  tamanhoDaPagina,
  podeRegistrar = false,
}: {
  saldos: SaldoDeInsumo[];
  total: number;
  pagina: number;
  tamanhoDaPagina: number;
  podeRegistrar?: boolean;
}) {
  const url = useEstoqueUrl();
  const hoje = hojeISO();
  const busca = url.get("busca");
  const categoria = url.get("categoria_insumo");

  const chips: AppliedFilterChip[] = [];
  if (busca) chips.push({ id: "busca", label: `“${busca}”` });
  if (categoria && categoria in CATEGORIA_DE_INSUMO_LABEL)
    chips.push({
      id: "categoria_insumo",
      label: CATEGORIA_DE_INSUMO_LABEL[categoria as keyof typeof CATEGORIA_DE_INSUMO_LABEL],
    });

  const columns: ColumnDef<SaldoDeInsumo>[] = [
    {
      key: "nome",
      header: "Insumo",
      mobile: "title",
      cell: (s) => (
        <Flex direction="column" minW="0">
          <Text as="span" fontWeight="600" color="fg.heading" truncate>
            {s.nome}
          </Text>
          <Text as="span" fontSize="xs" color="fg.muted">
            {CATEGORIA_DE_INSUMO_LABEL[s.categoria]}
          </Text>
        </Flex>
      ),
    },
    {
      key: "saldo",
      header: "Saldo",
      numeric: true,
      cell: (s) =>
        toNumber(s.saldo) > 0 ? (
          <Text as="span" fontWeight="600" color="fg.heading" whiteSpace="nowrap">
            {formatQuantidade(s.saldo, s.unidade)}
          </Text>
        ) : (
          <Text as="span" color="fg.muted">
            Esgotado
          </Text>
        ),
    },
    {
      key: "lotes",
      header: "Lotes",
      numeric: true,
      cell: (s) => s.lotes,
    },
    {
      key: "custo_medio",
      header: "Custo médio",
      numeric: true,
      cell: (s) =>
        s.custo_medio === null ? (
          <Text as="span" color="fg.muted">
            —
          </Text>
        ) : (
          <Text as="span" whiteSpace="nowrap">
            {formatMoeda(s.custo_medio)}
            <Text as="span" color="fg.muted" fontSize="xs">
              /{UNIDADE_LABEL[s.unidade].curta}
            </Text>
          </Text>
        ),
    },
    {
      key: "validade_mais_proxima",
      header: "Validade mais próxima",
      cell: (s) => <ValidadeBadge validade={s.validade_mais_proxima} hoje={hoje} />,
    },
  ];

  return (
    <Flex direction="column" gap="4">
      <PageToolbar
        search={
          <SearchField
            label="Buscar insumos"
            placeholder="Nome do insumo"
            defaultValue={busca ?? ""}
            onSearch={(termo) => url.setFiltros({ busca: termo || null })}
          />
        }
        filters={
          <Box flex="1 1 200px" maxW={{ base: "full", md: "230px" }}>
            <Select
              label="Categoria do insumo"
              hideLabel
              placeholder="Todas as categorias"
              options={Object.entries(CATEGORIA_DE_INSUMO_LABEL).map(([value, label]) => ({ value, label }))}
              value={categoria}
              clearable
              onValueChange={(v) => url.setFiltros({ categoria_insumo: v })}
            />
          </Box>
        }
        appliedFilters={chips}
        onRemoveFilter={(id) => url.setFiltros({ [id]: null })}
        onClearFilters={() => url.limparFiltros(["busca", "categoria_insumo"])}
      />
      <Box opacity={url.isPending ? 0.6 : 1} transition="opacity 150ms ease" aria-busy={url.isPending}>
        <DataTable<SaldoDeInsumo>
          caption={`Saldos por insumo — ${total} no total`}
          columns={columns}
          data={saldos}
          getRowId={(s) => s.insumo_id}
          getRowLabel={(s) => `Ver lotes de ${s.nome}`}
          pagination={{ page: pagina, pageSize: tamanhoDaPagina, total }}
          onPageChange={(p) => url.setFiltros({ pagina: p > 1 ? String(p) : null })}
          onRowClick={(s) =>
            url.setFiltros({
              visao: "lotes",
              insumo: s.insumo_id,
              busca: null,
              categoria_insumo: null,
            })
          }
          emptyState={
            chips.length > 0 ? (
              <EmptyState
                variant="no-results"
                size="md"
                icon={PackageSearch}
                title="Nenhum insumo com esses filtros"
                actions={
                  <Button variant="outline" onClick={() => url.limparFiltros(["busca", "categoria_insumo"])}>
                    Limpar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                variant="first-use"
                size="md"
                icon={PackageSearch}
                title="Nenhum insumo em estoque"
                description="Registre a entrada de fertilizantes, defensivos e outros."
                actions={podeRegistrar ? <Button onClick={url.abrirEntrada}>Registrar entrada</Button> : undefined}
              />
            )
          }
        />
      </Box>
    </Flex>
  );
}
