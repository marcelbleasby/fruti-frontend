import { Box, type BoxProps, Button, Flex, Heading, SimpleGrid, Stat, chakra } from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { areaSquareMeters, formatDate, formatHectares, formatNumber } from "../../format";
import type { Area } from "../../types";
import type { HeadingLevel } from "../../typography";
import { AreaCode } from "./area-card";

export interface AreaOverviewStats {
  plantings?: number;
  plants?: number;
  /** Plantas por hectare (padrão: calculada de plantas ÷ área). */
  density?: number;
}

export interface AreaOverviewProps extends Omit<BoxProps, "children"> {
  area: Area;
  stats?: AreaOverviewStats;
  /** Link de edição (ou use `onEdit`). */
  editHref?: string;
  onEdit?: () => void;
  /** Nível do título (padrão h3; o tamanho é sempre o de título de seção). */
  headingAs?: HeadingLevel;
}

function OverviewStat({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return (
    <Stat.Root gap="0.5" p="3" bg="bg" borderRadius="lg" minW="0">
      <Stat.Label textStyle="caption" color="fg.muted">
        {label}
      </Stat.Label>
      <Stat.ValueText
        textStyle="heading.md"
        fontWeight="700"
        color="fg.heading"
        alignItems="baseline"
        gap="1"
        css={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
        {unit && (
          <Stat.ValueUnit textStyle="label" color="fg.muted">
            {unit}
          </Stat.ValueUnit>
        )}
      </Stat.ValueText>
    </Stat.Root>
  );
}

/**
 * AreaOverview — resumo da área: tamanho, plantios, plantas, densidade e medidas.
 * Chakra v3: Card · Stat · SimpleGrid.
 */
export function AreaOverview({ area, stats, editHref, onEdit, headingAs = "h3", ...rest }: AreaOverviewProps) {
  const m2 = areaSquareMeters(area.length, area.width);
  const ha = m2 / 10_000;
  const plantings = stats?.plantings ?? area.activePlantings ?? 0;
  const plants = stats?.plants ?? area.plants ?? 0;
  const density = stats?.density ?? (ha > 0 && plants > 0 ? Math.round(plants / ha) : undefined);
  const [haValue] = formatHectares(m2).split(" ");

  const editLabel = (
    <>
      <Pencil aria-hidden="true" />
      Editar
    </>
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="3.5"
      p="5"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      {...rest}
    >
      <Flex justify="space-between" gap="2" align="flex-start">
        <Flex direction="column" gap="0.5" minW="0">
          <AreaCode>{area.code}</AreaCode>
          <Heading as={headingAs} textStyle="heading.md" color="fg.heading">
            {area.name}
          </Heading>
        </Flex>
        {editHref ? (
          <Button asChild variant="outline" size="sm" aria-label={`Editar área ${area.code}`}>
            <NextLink href={editHref}>{editLabel}</NextLink>
          </Button>
        ) : onEdit ? (
          <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Editar área ${area.code}`}>
            {editLabel}
          </Button>
        ) : null}
      </Flex>
      <SimpleGrid minChildWidth="112px" gap="2">
        <OverviewStat label="Área calculada" value={haValue} unit="ha" />
        <OverviewStat label="Plantios ativos" value={formatNumber(plantings)} />
        <OverviewStat label="Plantas" value={formatNumber(plants)} />
        <OverviewStat label="Densidade" value={density != null ? formatNumber(density) : "—"} unit={density != null ? "pl/ha" : undefined} />
      </SimpleGrid>
      <chakra.dl
        display="flex"
        flexWrap="wrap"
        columnGap="5"
        rowGap="1"
        textStyle="body.sm"
        color="fg.muted"
        css={{ "& dd": { color: "fg", fontWeight: "500", marginInlineStart: "4px" } }}
      >
        <Flex>
          <dt>Comprimento</dt>
          <dd>{formatNumber(area.length)} m</dd>
        </Flex>
        <Flex>
          <dt>Largura</dt>
          <dd>{formatNumber(area.width)} m</dd>
        </Flex>
        {area.createdAt && (
          <Flex>
            <dt>Cadastrada em</dt>
            <dd>{formatDate(area.createdAt)}</dd>
          </Flex>
        )}
      </chakra.dl>
    </Box>
  );
}
