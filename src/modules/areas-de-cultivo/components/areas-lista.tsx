"use client";

import { Box, Button, Flex, SimpleGrid } from "@chakra-ui/react";
import { LandPlot, Maximize, Plus, SearchX, Sprout, SquareDashed } from "lucide-react";
import { MetricGroup } from "@/components/charts/metric-group";
import { EmptyState } from "@/components/feedback/empty-state";
import { SearchField } from "@/components/forms/search-field";
import { PageToolbar } from "@/components/layout/page-toolbar";
import { useListaUrl } from "@/lib/use-lista-url";
import { AreaCard } from "@/modules/areas";
import { formatHectares, formatNumber } from "@/modules/format";
import type { Area } from "@/modules/types";

/** Indicadores da propriedade (todas as áreas, sem filtro de busca). */
export function AreasResumo({ areas }: { areas: Area[] }) {
  const totalM2 = areas.reduce((s, a) => s + a.length * a.width, 0);
  const unidadesM2 = areas.reduce((s, a) => s + (a.unitsAreaM2 ?? 0), 0);
  const emCampo = areas.reduce((s, a) => s + (a.activePlantings ?? 0), 0);
  const pct = totalM2 > 0 ? (unidadesM2 / totalM2) * 100 : 0;
  const [ha, haUnit] = formatHectares(totalM2).split(" ");
  const [livre, livreUnit] = formatHectares(Math.max(0, totalM2 - unidadesM2)).split(" ");

  return (
    <MetricGroup
      minChildWidth="150px"
      metrics={[
        { id: "areas", label: "Áreas", value: areas.length, icon: <LandPlot />, description: "Cadastradas" },
        {
          id: "total",
          label: "Área total",
          value: ha,
          unit: haUnit,
          icon: <Maximize />,
          description: "Soma das áreas",
        },
        {
          id: "livre",
          label: "Sem unidade",
          value: livre,
          unit: livreUnit,
          icon: <SquareDashed />,
          description: totalM2 > 0 ? `${formatNumber(Math.round(pct))}% já dividido em unidades` : "Nada cadastrado",
        },
        {
          id: "campo",
          label: "Em campo",
          value: emCampo,
          icon: <Sprout />,
          description: emCampo === 1 ? "Plantio em campo" : "Plantios em campo",
        },
      ]}
    />
  );
}

export function AreasLista({ areas, podeCadastrar }: { areas: Area[]; podeCadastrar: boolean }) {
  const url = useListaUrl();
  const busca = url.get("busca") ?? "";

  const vazio = busca ? (
    <EmptyState
      variant="no-results"
      size="md"
      icon={SearchX}
      title={`Nenhuma área para “${busca}”`}
      description="Busque pelo nome ou pelo código."
      actions={
        <Button variant="outline" onClick={() => url.setFiltros({ busca: null })}>
          Limpar busca
        </Button>
      }
    />
  ) : (
    <EmptyState
      variant="first-use"
      size="md"
      icon={LandPlot}
      title="Nenhuma área de cultivo"
      description="Cadastre estufas e setores com as medidas; depois divida em canteiros e talhões."
      actions={
        podeCadastrar ? (
          <Button onClick={() => url.setFiltros({ form: "area" })}>
            <Plus aria-hidden /> Nova área
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
            label="Buscar áreas"
            placeholder="Nome ou código"
            defaultValue={busca}
            onSearch={(termo) => url.setFiltros({ busca: termo.trim() || null })}
          />
        }
      />
      <Box opacity={url.isPending ? 0.6 : 1} transition="opacity 150ms ease" aria-busy={url.isPending}>
        {areas.length ? (
          <SimpleGrid
            as="ul"
            listStyleType="none"
            m="0"
            p="0"
            templateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
            gap="4"
            aria-label="Áreas de cultivo"
          >
            {areas.map((a) => (
              <Box as="li" key={a.id} display="flex" minW="0" css={{ "& > *": { flex: "1" } }}>
                <AreaCard area={a} href={`/areas-de-cultivo/${a.id}`} headingAs="h2" />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          vazio
        )}
      </Box>
    </Flex>
  );
}
