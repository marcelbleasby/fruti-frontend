"use client";

import { Box, type BoxProps, Flex, IconButton, Link, Stack, Text, chakra } from "@chakra-ui/react";
import { X } from "lucide-react";
import NextLink from "next/link";
import { LoadingState } from "@/components/data-display/loading-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { plural } from "@/modules/format";
import type { Cultivar, SpeciesRef } from "@/modules/types";

export interface CultivarListProps extends Omit<BoxProps, "children"> {
  items: Cultivar[];
  /** Espécie que filtra a lista (mostrada como filtro removível). */
  speciesFilter?: SpeciesRef | null;
  /** Remover o filtro chama com `null`. */
  onSpeciesFilterChange?: (species: SpeciesRef | null) => void;
  getHref?: (cultivar: Cultivar) => string;
  /** Nome da espécie de cada cultivar (útil sem filtro de espécie, quando a lista mistura espécies). */
  getSpeciesName?: (cultivar: Cultivar) => string | undefined;
  loading?: boolean;
}

/**
 * CultivarList — lista de cultivares; a relação espécie → cultivares fica
 * explícita pelo filtro de espécie sempre visível. Chakra v3: Stack · Tag.
 */
export function CultivarList({
  items,
  speciesFilter,
  onSpeciesFilterChange,
  getHref,
  getSpeciesName,
  loading,
  ...rest
}: CultivarListProps) {
  return (
    <Box display="flex" flexDirection="column" gap="3" {...rest}>
      {speciesFilter && (
        <Flex wrap="wrap" gap="2" align="center">
          <chakra.span textStyle="body.sm" color="fg.muted">
            Filtrado por
          </chakra.span>
          <chakra.span
            display="inline-flex"
            alignItems="center"
            gap="1"
            h="8"
            ps="2.5"
            pe={onSpeciesFilterChange ? "1" : "2.5"}
            borderRadius="full"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.control"
            textStyle="body.sm"
            color="fg"
          >
            Espécie: {speciesFilter.name}
            {onSpeciesFilterChange && (
              <IconButton
                aria-label="Remover filtro de espécie"
                size="sm"
                variant="ghost"
                minW="6"
                h="6"
                w="6"
                borderRadius="full"
                color="fg.muted"
                onClick={() => onSpeciesFilterChange(null)}
              >
                <X strokeWidth={1.75} />
              </IconButton>
            )}
          </chakra.span>
        </Flex>
      )}

      {loading ? (
        <LoadingState variant="table" rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          variant="in-card"
          size="sm"
          title="Nenhum cultivo"
          description={
            speciesFilter
              ? `${speciesFilter.name} ainda não tem cultivos.`
              : "Cadastre cultivos para detalhar os plantios."
          }
        />
      ) : (
        <Stack
          as="ul"
          listStyleType="none"
          gap="0"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="l3"
          overflow="hidden"
          aria-label={speciesFilter ? `Cultivos de ${speciesFilter.name}` : "Cultivos"}
        >
          {items.map((c) => {
            const count = c.plantingCount;
            const especie = !speciesFilter ? getSpeciesName?.(c) : undefined;
            const detalhe = c.origin ?? c.characteristics;
            const content = (
              <>
                <Box display="flex" flexDirection="column" minW="0" flex="1">
                  <chakra.span textStyle="body.sm" fontWeight="600" color="fg.heading">
                    {c.name}
                    {especie ? (
                      <chakra.span fontWeight="400" color="fg.muted">
                        {" "}
                        · {especie}
                      </chakra.span>
                    ) : null}
                  </chakra.span>
                  {detalhe && (
                    <chakra.span
                      textStyle="caption"
                      fontWeight="400"
                      fontStyle={c.origin ? "italic" : undefined}
                      color="fg.muted"
                      lineClamp={1}
                    >
                      {detalhe}
                    </chakra.span>
                  )}
                </Box>
                {/* Contagem só quando conhecida: sem ela, "sem plantios" seria enganoso. */}
                {count !== undefined && (
                  <Text as="span" textStyle="caption" color="fg.muted" whiteSpace="nowrap">
                    {count > 0 ? plural(count, "plantio") : "sem plantios"}
                  </Text>
                )}
              </>
            );
            const row = {
              display: "flex",
              alignItems: "center",
              gap: "3",
              minH: "14",
              px: "4",
              py: "2",
            } as const;
            return (
              <chakra.li key={c.id} borderBottomWidth="1px" borderColor="green.100" _last={{ borderBottomWidth: 0 }}>
                {getHref ? (
                  <Link
                    asChild
                    {...row}
                    color="inherit"
                    textDecoration="none"
                    _hover={{ bg: "bg.hover", textDecoration: "none" }}
                    focusVisibleRing="inside"
                  >
                    <NextLink href={getHref(c)}>{content}</NextLink>
                  </Link>
                ) : (
                  <Box {...row}>{content}</Box>
                )}
              </chakra.li>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
