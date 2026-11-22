"use client";

import { Flex, type FlexProps, Heading, SimpleGrid, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Tabs } from "@/components/navigation/tabs";
import type { Area, PlantingSummary } from "../../types";
import { AreaCode } from "./area-card";
import { AreaMeasurementDisplay } from "./area-measurement-display";
import { AreaOverview, type AreaOverviewStats } from "./area-overview";
import { AreaPlantingList, type AreaPlantingListProps } from "./area-planting-list";
import { EM_CAMPO } from "@/modules/plantings/utils";

export type AreaDetailsTab = "resumo" | "unidades" | "plantios" | "imagens" | "historico";

export interface AreaDetailsProps extends Omit<FlexProps, "children"> {
  area: Area;
  plantings: PlantingSummary[];
  stats?: AreaOverviewStats;
  /** Aba controlada (ex.: sincronizada com a URL). */
  tab?: AreaDetailsTab;
  defaultTab?: AreaDetailsTab;
  onTabChange?: (tab: AreaDetailsTab) => void;
  /** Conteúdo da aba Unidades de cultivo (ex.: AreaUnitMap + lista). Sem ele, a aba não aparece. */
  units?: ReactNode;
  unitCount?: number;
  /** Mostra as abas Imagens e Histórico (padrão true). Desligue quando o recurso ainda não existe, em vez de exibir um vazio. */
  showImages?: boolean;
  showHistory?: boolean;
  /** Conteúdo da aba Imagens (ex.: ImageGallery). */
  images?: ReactNode;
  imageCount?: number;
  /** Conteúdo da aba Histórico (ex.: RecordHistory). */
  history?: ReactNode;
  /** Ações do cabeçalho (ex.: botão Editar). */
  actions?: ReactNode;
  editHref?: string;
  /** Nível do título da área (padrão h1: a composição é a página de detalhes). */
  headingAs?: "h1" | "h2";
  plantingListProps?: Partial<Omit<AreaPlantingListProps, "areaId" | "plantings">>;
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <chakra.p m="0" py="6" textAlign="center" textStyle="body.sm" color="fg.muted">
      {children}
    </chakra.p>
  );
}

/**
 * AreaDetails — composição da página de detalhes da área: cabeçalho e abas
 * Resumo · Plantios · Imagens · Histórico. Chakra v3: PageHeader · Tabs.
 */
export function AreaDetails({
  area,
  plantings,
  stats,
  tab,
  defaultTab = "resumo",
  onTabChange,
  units,
  unitCount,
  showImages = true,
  showHistory = true,
  images,
  imageCount,
  history,
  actions,
  editHref,
  headingAs = "h1",
  plantingListProps,
  ...rest
}: AreaDetailsProps) {
  // Aba "Plantios": os que a lista mostra por padrão (não encerrados nem cancelados).
  const openCount = plantings.filter((p) => p.status !== "encerrado" && p.status !== "cancelado").length;
  // Resumo "Plantios em campo": implantado, em desenvolvimento ou colhido (glossário).
  const overviewStats: AreaOverviewStats = {
    ...stats,
    plantings: stats?.plantings ?? plantings.filter((p) => EM_CAMPO.includes(p.status)).length,
  };
  const sectionHeading = headingAs === "h1" ? "h2" : "h3";

  return (
    <Flex direction="column" gap="4" minW="0" {...rest}>
      <Flex align="center" justify="space-between" gap="3" flexWrap="wrap">
        <Flex align="baseline" gap="2" minW="0">
          <AreaCode>{area.code}</AreaCode>
          <Heading
            as={headingAs}
            textStyle={headingAs === "h1" ? "heading.xl" : "heading.lg"}
            color="fg.heading"
            truncate
          >
            {area.name}
          </Heading>
        </Flex>
        {actions}
      </Flex>
      <Tabs
        aria-label="Seções da área"
        value={tab}
        defaultValue={tab ? undefined : defaultTab}
        onValueChange={onTabChange ? (d) => onTabChange(d.value as AreaDetailsTab) : undefined}
        lazyMount
        items={[
          {
            value: "resumo",
            label: "Resumo",
            content: (
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4" alignItems="start" pt="4">
                <AreaOverview area={area} stats={overviewStats} editHref={editHref} headingAs={sectionHeading} />
                <Flex
                  direction="column"
                  gap="3"
                  p="5"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l3"
                  boxShadow="xs"
                >
                  <Heading as={sectionHeading} textStyle="heading.md" color="fg.heading">
                    Dimensões
                  </Heading>
                  <AreaMeasurementDisplay length={area.length} width={area.width} showArea />
                </Flex>
              </SimpleGrid>
            ),
          },
          ...(units !== undefined
            ? [
                {
                  value: "unidades",
                  label: "Unidades de cultivo",
                  count: unitCount,
                  content: <chakra.div pt="4">{units}</chakra.div>,
                },
              ]
            : []),
          {
            value: "plantios",
            label: "Plantios",
            count: openCount,
            content: <AreaPlantingList mt="4" areaId={area.id} plantings={plantings} {...plantingListProps} />,
          },
          ...(showImages
            ? [
                {
                  value: "imagens",
                  label: "Imagens",
                  count: imageCount,
                  content: (
                    <chakra.div pt="4">
                      {images ?? <Placeholder>Nenhuma imagem desta área ainda.</Placeholder>}
                    </chakra.div>
                  ),
                },
              ]
            : []),
          ...(showHistory
            ? [
                {
                  value: "historico",
                  label: "Histórico",
                  content: (
                    <chakra.div pt="4">{history ?? <Placeholder>Sem eventos registrados.</Placeholder>}</chakra.div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </Flex>
  );
}
