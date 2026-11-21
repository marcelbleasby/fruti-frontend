"use client";

import { Box, type BoxProps, Flex, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { LayoutGrid, List } from "lucide-react";
import NextLink from "next/link";
import { Badge } from "@/components/data-display/badge";
import { DataTable, type ColumnDef, type DataTablePagination } from "@/components/data-display/data-table";
import { SearchField } from "@/components/forms/search-field";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Pagination } from "@/components/navigation/pagination";
import { formatNumber, plural } from "@/modules/format";
import type { Species } from "@/modules/types";
import { SpeciesCard } from "./species-card";

export type SpeciesListView = "table" | "grid";

export interface SpeciesListProps extends Omit<BoxProps, "children"> {
  items: Species[];
  /** Total do catálogo (padrão: `pagination.total` ou `items.length`). */
  total?: number;
  view?: SpeciesListView;
  onViewChange?: (view: SpeciesListView) => void;
  /** Busca com debounce (mostra o campo quando presente). */
  onSearch?: (query: string) => void;
  searching?: boolean;
  pagination?: DataTablePagination;
  onPageChange?: (page: number) => void;
  getHref: (species: Species) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

/**
 * SpeciesList — catálogo global em tabela ou grade de SpeciesCard.
 * No celular a tabela vira lista de cards. Chakra v3: DataTable · SpeciesCard.
 */
export function SpeciesList({
  items,
  total,
  view = "table",
  onViewChange,
  onSearch,
  searching,
  pagination,
  onPageChange,
  getHref,
  loading,
  error,
  onRetry,
  ...rest
}: SpeciesListProps) {
  const count = total ?? pagination?.total ?? items.length;

  const columns: ColumnDef<Species>[] = [
    {
      key: "name",
      header: "Espécie",
      sortable: true,
      mobile: "title",
      cell: (s) => (
        <Stack gap="0">
          <Link asChild fontWeight="600" color="fg.heading" textDecoration="none" _hover={{ textDecoration: "underline" }}>
            <NextLink href={getHref(s)}>{s.name}</NextLink>
          </Link>
          <Text textStyle="caption" fontWeight="400" color="fg.muted">
            <i>{s.scientificName}</i>
            {s.family ? ` · ${s.family}` : null}
          </Text>
        </Stack>
      ),
    },
    {
      key: "cultivarCount",
      header: "Cultivares",
      numeric: true,
      sortable: true,
      cell: (s) => formatNumber(s.cultivarCount ?? 0),
    },
    {
      key: "plantingCount",
      header: "Plantios",
      numeric: true,
      sortable: true,
      cell: (s) =>
        s.plantingCount ? (
          formatNumber(s.plantingCount)
        ) : (
          <Badge tone="gray" variant="outline">
            sem plantios
          </Badge>
        ),
    },
  ];

  return (
    <Box display="flex" flexDirection="column" gap="3" {...rest}>
      <Flex justify="space-between" align="center" gap="2" wrap="wrap">
        <Text textStyle="body.sm" color="fg.muted" role="status">
          {plural(count, "espécie")} no catálogo global
        </Text>
        <Flex gap="2" align="center" flex={{ base: "1 1 100%", sm: "0 1 auto" }} justify="flex-end">
          {onSearch && (
            <Box flex="1" minW="200px" maxW="320px">
              <SearchField label="Buscar espécies" placeholder="Buscar espécies" onSearch={onSearch} loading={searching} />
            </Box>
          )}
          {onViewChange && (
            <SegmentedControl
              label="Visualização"
              fullWidth={false}
              value={view}
              onValueChange={(v) => v && onViewChange(v as SpeciesListView)}
              items={[
                { value: "table", icon: <List size={20} strokeWidth={1.75} />, ariaLabel: "Lista" },
                { value: "grid", icon: <LayoutGrid size={20} strokeWidth={1.75} />, ariaLabel: "Grade" },
              ]}
            />
          )}
        </Flex>
      </Flex>

      {view === "table" ? (
        <DataTable<Species>
          caption="Espécies do catálogo global, por nome"
          columns={columns}
          data={items}
          getRowLabel={(s) => s.name}
          pagination={pagination}
          onPageChange={onPageChange}
          loading={loading}
          error={error}
          onRetry={onRetry}
          emptyTitle="Nenhuma espécie no catálogo"
          emptyDescription="Cadastre a primeira espécie para usá-la em plantios."
          minTableWidth="560px"
          renderMobileCard={(s) => <SpeciesCard species={s} href={getHref(s)} />}
        />
      ) : (
        <>
          <SimpleGrid as="ul" listStyleType="none" columns={{ base: 1, sm: 2, lg: 3 }} gap="3" aria-label="Espécies">
            {items.map((s) => (
              <li key={s.id}>
                <SpeciesCard species={s} href={getHref(s)} h="full" />
              </li>
            ))}
          </SimpleGrid>
          {pagination && onPageChange && pagination.total > pagination.pageSize && (
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              count={pagination.total}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </Box>
  );
}
