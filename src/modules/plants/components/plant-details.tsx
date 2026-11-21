"use client";

import { Box, Button, Flex, Heading, chakra, type BoxProps } from "@chakra-ui/react";
import { ImagePlus, Pencil } from "lucide-react";
import NextLink from "next/link";
import { ActivityTimeline } from "@/components/data-display/activity-timeline";
import { RecordDetails } from "@/components/data-display/record-details";
import { TextLink } from "@/components/navigation/text-link";
import { ImageGallery } from "@/components/files";
import { formatDate } from "../../format";
import type { HistoryEvent, ImageRef, Plant } from "../../types";
import { historyToActivity } from "../../plantings/utils";

import { type HeadingLevel, nextHeadingLevel } from "../../typography";
export interface PlantDetailsProps extends Omit<BoxProps, "children"> {
  plant: Plant;
  images?: ImageRef[];
  /** Eventos do mais recente ao mais antigo (seção oculta quando ausente). */
  history?: HistoryEvent[];
  /** Link do plantio da planta. */
  plantingHref?: string;
  onEdit?: () => void;
  editHref?: string;
  /** Mostra "Adicionar" na galeria. */
  onAddImage?: () => void;
  onOpenImage?: (index: number) => void;
  /** Quantas miniaturas mostrar antes de "+N" (padrão 4). */
  maxImages?: number;
  /** Nível do título da planta (padrão h2; subtítulos usam o nível seguinte). */
  headingAs?: HeadingLevel;
}

/**
 * PlantDetails — dados da planta individual, galeria compacta e histórico.
 * Chakra v3: RecordDetails · ImageGallery (compacta) · ActivityTimeline.
 */
export function PlantDetails({
  plant,
  images = [],
  history,
  plantingHref,
  onEdit,
  editHref,
  onAddImage,
  onOpenImage,
  maxImages = 4,
  headingAs = "h2",
  ...rest
}: PlantDetailsProps) {
  const subHeading = nextHeadingLevel(headingAs);
  const editIcon = <Pencil strokeWidth={1.75} aria-hidden="true" />;
  const position = plant.row != null || plant.position != null ? `${plant.row ?? "—"} / ${plant.position ?? "—"}` : null;

  return (
    <Box display="flex" flexDirection="column" gap="4" {...rest}>
      <Flex align="center" justify="space-between" gap="2" wrap="wrap">
        <Heading as={headingAs} textStyle="heading.md" color="fg.heading" display="flex" alignItems="baseline" gap="2">
          <chakra.span fontFamily="mono" css={{ fontVariantLigatures: "none" }}>
            {plant.code}
          </chakra.span>
          {plant.label && (
            <chakra.span textStyle="body" fontWeight="500" color="fg.muted">
              {plant.label}
            </chakra.span>
          )}
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

      <RecordDetails
        columns={2}
        items={[
          {
            key: "planting",
            label: "Plantio",
            value: plantingHref ? <TextLink href={plantingHref}>{plant.plantingCode}</TextLink> : plant.plantingCode,
          },
          { key: "control", label: "Controle", value: "Individual" },
          { key: "position", label: "Linha / posição", value: position },
          { key: "createdAt", label: "Registrada em", value: formatDate(plant.createdAt) },
        ]}
      />

      <ImageGallery
        headingAs={subHeading}
        images={images}
        columns={4}
        maxVisible={maxImages}
        onOpen={onOpenImage}
        emptyText="Nenhuma imagem desta planta ainda."
        action={
          onAddImage ? (
            <Button variant="outline" size="sm" onClick={onAddImage}>
              <ImagePlus strokeWidth={1.75} aria-hidden="true" />
              Adicionar
            </Button>
          ) : undefined
        }
      />

      {history && (
        <Box bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="l3" boxShadow="xs" p="4">
          <Heading as={subHeading} textStyle="heading.sm" color="fg.heading" mb="3">
            Histórico
          </Heading>
          <ActivityTimeline items={historyToActivity(history)} emptyText="Nenhum evento registrado para esta planta." />
        </Box>
      )}
    </Box>
  );
}
