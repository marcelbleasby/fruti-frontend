"use client";

import { Box, Flex } from "@chakra-ui/react";
import { usePathname, useSearchParams } from "next/navigation";
import { SearchField } from "@/components/forms/search-field";
import { Select } from "@/components/forms/select";
import { PageToolbar } from "@/components/layout/page-toolbar";
import { useListaUrl } from "@/lib/use-lista-url";
import { CultivarList } from "@/modules/cultivars/components/cultivar-list";
import type { Cultivar, SpeciesRef } from "@/modules/types";

/** Cultivares (CultivarList do DS) com filtro de espécie e busca na URL. */
export function CultivaresLista({
  cultivares,
  especies,
}: {
  cultivares: Cultivar[];
  especies: SpeciesRef[];
}) {
  const url = useListaUrl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const especieId = url.get("especie");
  const busca = url.get("busca") ?? "";
  const filtro = especies.find((e) => e.id === especieId) ?? null;
  const nomes = new Map(especies.map((e) => [e.id, e.name]));

  const hrefDe = (c: Cultivar) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("cultivar", c.id);
    return `${pathname}?${sp.toString()}`;
  };

  return (
    <Flex direction="column" gap="4">
      <PageToolbar
        search={
          <SearchField
            label="Buscar cultivos"
            placeholder="Nome do cultivo"
            defaultValue={busca}
            debounceMs={350}
            onSearch={(termo) => url.setFiltros({ busca: termo.trim() || null })}
          />
        }
        filters={
          <Box flex="1 1 220px" maxW={{ base: "full", md: "280px" }}>
            <Select
              label="Espécie"
              hideLabel
              placeholder="Todas as espécies"
              clearable
              options={especies.map((e) => ({ value: e.id, label: e.name }))}
              value={especieId}
              onValueChange={(v) => url.setFiltros({ especie: v })}
            />
          </Box>
        }
      />
      <Box opacity={url.isPending ? 0.6 : 1} transition="opacity 150ms ease" aria-busy={url.isPending}>
        <CultivarList
          items={cultivares}
          speciesFilter={filtro}
          onSpeciesFilterChange={(s) => url.setFiltros({ especie: s?.id ?? null })}
          getHref={hrefDe}
          getSpeciesName={(c) => nomes.get(c.speciesId)}
        />
      </Box>
    </Flex>
  );
}
