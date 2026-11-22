import { Box, Button, Flex, Heading, type BoxProps } from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import NextLink from "next/link";
import { RecordDetails, type RecordDetailsItem } from "@/components/data-display/record-details";
import { TextLink } from "@/components/navigation/text-link";
import { SeedlingOriginDisplay } from "@/modules/seedlings";
import { formatDate } from "../../format";
import type { AreaId, BatchId, Planting, SpeciesId } from "../../types";
import { PLANT_CONTROL_LABEL } from "../utils";

import type { HeadingLevel } from "../../typography";
export interface PlantingDetailsProps extends Omit<BoxProps, "children"> {
  planting: Planting;
  /** Título da seção (padrão "Dados do plantio"). */
  title?: string;
  /** Mostra o botão Editar (ação) … */
  onEdit?: () => void;
  /** … ou como link. */
  editHref?: string;
  speciesHref?: (id: SpeciesId) => string;
  areaHref?: (id: AreaId) => string;
  batchHref?: (id: BatchId) => string;
  /** Colunas a partir de 768px (padrão 2). */
  columns?: 1 | 2 | 3;
  /** Nível do título (padrão h2; tamanho de título de seção). */
  headingAs?: HeadingLevel;
}

/**
 * PlantingDetails — dados cadastrais do plantio em pares rótulo/valor.
 * Chakra v3: RecordDetails · Link.
 */
export function PlantingDetails({
  planting,
  title = "Dados do plantio",
  onEdit,
  editHref,
  speciesHref,
  areaHref,
  batchHref,
  columns = 2,
  headingAs = "h2",
  ...rest
}: PlantingDetailsProps) {
  const areaLabel = `${planting.area.code} · ${planting.area.name}`;
  const items: RecordDetailsItem[] = [
    {
      key: "species",
      label: "Espécie",
      value: speciesHref ? (
        <TextLink href={speciesHref(planting.species.id)}>{planting.species.name}</TextLink>
      ) : (
        planting.species.name
      ),
    },
    { key: "cultivar", label: "Cultivo", value: planting.cultivar?.name },
    {
      key: "area",
      label: "Área",
      value: areaHref ? <TextLink href={areaHref(planting.area.id)}>{areaLabel}</TextLink> : areaLabel,
    },
    { key: "plantedAt", label: "Data de plantio", value: planting.plantedAt ? formatDate(planting.plantedAt) : null },
    {
      key: "origin",
      label: "Origem",
      value: <SeedlingOriginDisplay origin={planting.origin} batchHref={batchHref} linkToBatch={Boolean(batchHref)} />,
    },
    { key: "control", label: "Controle", value: PLANT_CONTROL_LABEL[planting.control] },
    ...(planting.notes !== undefined
      ? [{ key: "notes", label: "Observações", value: planting.notes, span: "full" as const }]
      : []),
  ];

  const editIcon = <Pencil strokeWidth={1.75} aria-hidden="true" />;

  return (
    <Box display="flex" flexDirection="column" gap="3" {...rest}>
      <Flex align="center" justify="space-between" gap="2">
        <Heading as={headingAs} textStyle="heading.md" color="fg.heading">
          {title}
        </Heading>
        {editHref ? (
          <Button asChild variant="outline" size="sm">
            <NextLink href={editHref}>
              {editIcon}
              Editar
            </NextLink>
          </Button>
        ) : onEdit ? (
          <Button variant="outline" size="sm" onClick={onEdit}>
            {editIcon}
            Editar
          </Button>
        ) : null}
      </Flex>
      <RecordDetails items={items} columns={columns} />
    </Box>
  );
}
