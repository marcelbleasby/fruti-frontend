"use client";

import { Box, chakra, Flex, Stack, Tag, type StackProps } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface AppliedFilterChip {
  id: string;
  /** Texto do chip, no formato "Campo: valor" (ex.: "Espécie: Manga"). */
  label: string;
}

export interface PageToolbarProps extends Omit<StackProps, "children"> {
  /** Campo de busca (ex.: `<SearchField />`). Ocupa o espaço que sobrar. */
  search?: ReactNode;
  /** Controles de filtro (selects, botão "Filtros"…), na mesma linha da busca. */
  filters?: ReactNode;
  /** Ações à direita (ex.: alternar visualização, exportar). */
  actions?: ReactNode;
  /** Filtros aplicados, exibidos como chips removíveis. */
  appliedFilters?: AppliedFilterChip[];
  onRemoveFilter?: (id: string) => void;
  /** Mostra "Limpar filtros" quando há chips. */
  onClearFilters?: () => void;
  clearLabel?: string;
  removeFilterLabel?: (label: string) => string;
  /** Rótulo da região de busca (`role="search"`). */
  searchLabel?: string;
  /** Conteúdo extra abaixo dos chips. */
  children?: ReactNode;
}

/**
 * Barra de busca, filtros e ações da lista. Os controles chegam por slots;
 * filtros aplicados viram chips removíveis para o usuário ver o que restringe a lista.
 */
export function PageToolbar({
  search,
  filters,
  actions,
  appliedFilters = [],
  onRemoveFilter,
  onClearFilters,
  clearLabel = "Limpar filtros",
  removeFilterLabel = (label) => `Remover filtro ${label}`,
  searchLabel = "Buscar e filtrar",
  children,
  ...rest
}: PageToolbarProps) {
  const hasControls = Boolean(search || filters || actions);

  return (
    <Stack gap="12px" {...rest}>
      {hasControls ? (
        <Flex role="search" aria-label={searchLabel} wrap="wrap" gap="8px" align="center">
          {search ? (
            <Box flex="2 1 200px" minW="0">
              {search}
            </Box>
          ) : null}
          {filters}
          {actions ? (
            <Flex gap="8px" wrap="wrap" ms="auto" align="center">
              {actions}
            </Flex>
          ) : null}
        </Flex>
      ) : null}

      {appliedFilters.length > 0 ? (
        <Flex wrap="wrap" gap="8px" align="center" aria-label="Filtros aplicados" role="group">
          {appliedFilters.map((chip) => (
            <Tag.Root
              key={chip.id}
              unstyled
              display="inline-flex"
              alignItems="center"
              gap="4px"
              h="32px"
              ps="12px"
              pe={onRemoveFilter ? "4px" : "12px"}
              borderRadius="full"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border.control"
              textStyle="body.sm"
              color="fg"
            >
              <Tag.Label>{chip.label}</Tag.Label>
              {onRemoveFilter ? (
                <Tag.EndElement display="inline-flex">
                  <Tag.CloseTrigger
                    aria-label={removeFilterLabel(chip.label)}
                    onClick={() => onRemoveFilter(chip.id)}
                    boxSize="24px"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    border="none"
                    bg="transparent"
                    color="fg.muted"
                    borderRadius="full"
                    cursor="pointer"
                    _hover={{ bg: "bg.hover", color: "fg" }}
                    focusVisibleRing="inside"
                  >
                    <X size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Tag.CloseTrigger>
                </Tag.EndElement>
              ) : null}
            </Tag.Root>
          ))}
          {onClearFilters ? (
            <chakra.button
              type="button"
              onClick={onClearFilters}
              minH="32px"
              px="4px"
              border="none"
              bg="transparent"
              color="primary"
              fontFamily="body"
              fontSize="sm"
              fontWeight="600"
              textDecoration="underline"
              textUnderlineOffset="2px"
              borderRadius="l1"
              cursor="pointer"
              _hover={{ color: "primary.hover" }}
              focusVisibleRing="outside"
            >
              {clearLabel}
            </chakra.button>
          ) : null}
        </Flex>
      ) : null}

      {children}
    </Stack>
  );
}
