"use client";

import {
  Box,
  Button,
  Pagination as ChakraPagination,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationVariant = "full" | "compact" | "responsive";

export interface PaginationProps
  extends Omit<ChakraPagination.RootProps, "children" | "onPageChange" | "translations" | "asChild"> {
  /** Total de itens. */
  count: number;
  /** Itens por página. */
  pageSize?: number;
  /**
   * `full` (desktop) · `compact` ("Página 2 de 8", tablet) ·
   * `responsive` (padrão: compacta abaixo de `lg`, completa a partir dele).
   * No mobile prefira `PaginationLoadMore`.
   */
  variant?: PaginationVariant;
  onPageChange?: (page: number) => void;
  /** Rótulo do `nav`. */
  label?: string;
}

const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;

const itemStyles = {
  minW: "9",
  h: "9",
  px: "2",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "l2",
  borderWidth: "1px",
  borderColor: "border.control",
  bg: "bg.panel",
  color: "fg",
  textStyle: "body.sm",
  cursor: "pointer",
  transitionProperty: "background-color, border-color, color",
  transitionDuration: "fast",
  focusVisibleRing: "outside",
  _hover: { bg: "bg.subtle" },
  _disabled: { layerStyle: "disabled", _hover: { bg: "bg.muted" } },
} as const;

const translations = {
  rootLabel: "Paginação",
  prevTriggerLabel: "Página anterior",
  nextTriggerLabel: "Próxima página",
  itemLabel: ({ page, totalPages }: { page: number; totalPages: number }) =>
    page === totalPages ? `Última página, página ${page}` : `Página ${page}`,
};

/** Paginação numérica (Pagination.Root). Página atual tem aria-current="page". */
/** Largura mínima do contêiner para a paginação completa (variante `responsive`). */
const FULL_MIN_WIDTH = "440px";

export function Pagination(props: PaginationProps) {
  const {
    count,
    pageSize = 20,
    variant = "responsive",
    onPageChange,
    label,
    siblingCount = 1,
    ...rootProps
  } = props;

  // `responsive` decide pela largura do próprio contêiner (container query), não da
  // janela: a paginação cabe inteira num card estreito sem quebrar linha.
  const responsive = variant === "responsive";
  const fullDisplay = responsive
    ? { display: "none", css: { [`@container (min-width: ${FULL_MIN_WIDTH})`]: { display: "flex" } } }
    : {};
  const compactDisplay = responsive
    ? { css: { [`@container (min-width: ${FULL_MIN_WIDTH})`]: { display: "none" } } }
    : {};

  return (
    <ChakraPagination.Root
      count={count}
      pageSize={pageSize}
      siblingCount={siblingCount}
      onPageChange={(details) => onPageChange?.(details.page)}
      translations={{ ...translations, rootLabel: label ?? translations.rootLabel }}
      asChild
      {...rootProps}
    >
      <chakra.nav containerType={responsive ? "inline-size" : undefined} minW="0">
        {variant !== "compact" && (
          <Box display="flex" gap="1" flexWrap="nowrap" {...fullDisplay}>
            <ChakraPagination.PrevTrigger {...itemStyles}>
              <ChevronLeft {...ICON} />
            </ChakraPagination.PrevTrigger>
            <ChakraPagination.Context>
              {({ pages }) =>
                pages.map((page, index) =>
                  page.type === "page" ? (
                    <ChakraPagination.Item
                      key={`page-${page.value}`}
                      {...page}
                      {...itemStyles}
                      _selected={{
                        bg: "primary",
                        borderColor: "primary",
                        color: "fg.inverted",
                        fontWeight: "600",
                        _hover: { bg: "primary.hover" },
                      }}
                    >
                      {page.value}
                    </ChakraPagination.Item>
                  ) : (
                    <ChakraPagination.Ellipsis
                      key={`ellipsis-${index}`}
                      index={index}
                      minW="9"
                      h="9"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      color="fg.muted"
                      textStyle="body.sm"
                    >
                      …
                    </ChakraPagination.Ellipsis>
                  ),
                )
              }
            </ChakraPagination.Context>
            <ChakraPagination.NextTrigger {...itemStyles}>
              <ChevronRight {...ICON} />
            </ChakraPagination.NextTrigger>
          </Box>
        )}
        {variant !== "full" && (
          <Box display="flex" alignItems="center" gap="2" {...compactDisplay}>
            <ChakraPagination.PrevTrigger {...itemStyles}>
              <ChevronLeft {...ICON} />
            </ChakraPagination.PrevTrigger>
            <ChakraPagination.Context>
              {({ page, totalPages }) => (
                <Text as="span" textStyle="body.sm" color="fg" aria-live="polite">
                  Página <strong>{page}</strong> de {totalPages}
                </Text>
              )}
            </ChakraPagination.Context>
            <ChakraPagination.NextTrigger {...itemStyles}>
              <ChevronRight {...ICON} />
            </ChakraPagination.NextTrigger>
          </Box>
        )}
      </chakra.nav>
    </ChakraPagination.Root>
  );
}

export interface PaginationLoadMoreProps {
  /** Itens já exibidos. */
  loaded: number;
  /** Total de itens. */
  total: number;
  /** Quantos itens o próximo carregamento traz. */
  increment?: number;
  /** Substantivo no plural para o status (ex.: "plantas"). */
  itemLabel?: string;
  onLoadMore: () => void;
  loading?: boolean;
  /** Texto do botão; recebe quantos itens serão carregados. */
  buttonLabel?: (next: number) => string;
}

const numberFormatter = new Intl.NumberFormat("pt-BR");

/** Paginação mobile: botão "Carregar mais" + status "40 de 142 plantas". */
export function PaginationLoadMore(props: PaginationLoadMoreProps) {
  const {
    loaded,
    total,
    increment = 20,
    itemLabel = "itens",
    onLoadMore,
    loading = false,
    buttonLabel = (next) => `Carregar mais ${next}`,
  } = props;
  const remaining = Math.max(total - loaded, 0);
  const next = Math.min(increment, remaining);

  return (
    <Stack gap="1.5" align="stretch">
      {remaining > 0 && (
        <Button
          variant="outline"
          size="md"
          h="11"
          w="full"
          loading={loading}
          onClick={onLoadMore}
        >
          {buttonLabel(next)}
        </Button>
      )}
      <Text role="status" m="0" fontSize="sm" color="fg.muted" textAlign="center">
        {numberFormatter.format(loaded)} de {numberFormatter.format(total)} {itemLabel}
      </Text>
    </Stack>
  );
}
