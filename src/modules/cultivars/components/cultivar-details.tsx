import { Box, type BoxProps, Button, Flex, Heading, Link, Stack, Text, chakra } from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import NextLink from "next/link";
import { RecordDetails } from "@/components/data-display/record-details";
import { StatusBadge } from "@/components/data-display/status-badge";
import { formatDate, plural } from "@/modules/format";
import type { Cultivar, PlantingRef, SpeciesRef } from "@/modules/types";
import type { HeadingLevel } from "@/modules/typography";

export interface CultivarDetailsProps extends Omit<BoxProps, "children"> {
  cultivar: Cultivar;
  species: SpeciesRef;
  /** Plantios que usam a cultivar. */
  plantings: PlantingRef[];
  speciesHref?: string;
  getPlantingHref?: (planting: PlantingRef) => string;
  editHref?: string;
  onEdit?: () => void;
  /** Nível do nome da cultivar (padrão h2; tamanho de título de seção). */
  headingAs?: HeadingLevel;
}

/**
 * CultivarDetails — dados da cultivar e plantios que a usam.
 * Chakra v3: RecordDetails · Link · lista de plantios com StatusBadge.
 */
export function CultivarDetails({
  cultivar,
  species,
  plantings,
  speciesHref,
  getPlantingHref,
  editHref,
  onEdit,
  headingAs = "h2",
  ...rest
}: CultivarDetailsProps) {
  const listId = `cultivar-${cultivar.id}-plantings`;

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      p="4.5"
      display="flex"
      flexDirection="column"
      gap="4"
      {...rest}
    >
      <Flex justify="space-between" align="flex-start" gap="3">
        <Stack gap="0.5" minW="0">
          <Heading as={headingAs} textStyle="heading.md" color="fg.heading">
            {cultivar.name}
          </Heading>
          <Text textStyle="body.sm" color="fg.muted">
            Cultivar de {species.name}
          </Text>
        </Stack>
        {editHref ? (
          <Button asChild size="sm" variant="outline">
            <NextLink href={editHref}>
              <Pencil strokeWidth={1.75} aria-hidden="true" />
              Editar
            </NextLink>
          </Button>
        ) : onEdit ? (
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil strokeWidth={1.75} aria-hidden="true" />
            Editar
          </Button>
        ) : null}
      </Flex>

      <RecordDetails
        surface="none"
        columns={3}
        items={[
          {
            label: "Espécie",
            value: speciesHref ? (
              <Link asChild color="primary" fontWeight="600" textDecoration="underline" textUnderlineOffset="4px">
                <NextLink href={speciesHref}>{species.name}</NextLink>
              </Link>
            ) : (
              species.name
            ),
          },
          { label: "Origem", value: cultivar.origin },
          { label: "Cadastrada em", value: cultivar.createdAt ? formatDate(cultivar.createdAt) : null },
          {
            label: "Características",
            span: "full",
            value: cultivar.characteristics ?? (
              <chakra.span color="fg.muted" fontWeight="400">
                Registre aqui atributos agronômicos relevantes para o manejo.
              </chakra.span>
            ),
          },
        ]}
      />

      <Stack gap="2" pt="3" borderTopWidth="1px" borderColor="green.100">
        <chakra.span id={listId} textStyle="label" color="fg.muted">
          Plantios com esta cultivar
        </chakra.span>
        {plantings.length === 0 ? (
          <Text textStyle="body.sm" color="fg.muted">
            Nenhum plantio usa esta cultivar ainda.
          </Text>
        ) : (
          <Stack as="ul" listStyleType="none" gap="0" aria-labelledby={listId}>
            {plantings.map((p) => {
              const row = (
                <>
                  <chakra.span textStyle="code" color="primary">
                    {p.code}
                  </chakra.span>
                  <chakra.span flex="1" minW="0" textStyle="body.sm" color="fg">
                    {p.areaCode} · {plural(p.plants, "planta")}
                  </chakra.span>
                  <StatusBadge status={p.status} size="sm" />
                </>
              );
              const rowStyles = {
                display: "flex",
                alignItems: "center",
                gap: "3",
                minH: "11",
                px: "1",
                borderBottomWidth: "1px",
                borderColor: "green.100",
              } as const;
              return (
                <chakra.li key={p.id} _last={{ "& > *": { borderBottomWidth: 0 } }}>
                  {getPlantingHref ? (
                    <Link
                      asChild
                      {...rowStyles}
                      color="inherit"
                      textDecoration="none"
                      borderRadius="l2"
                      _hover={{ bg: "bg.hover", textDecoration: "none" }}
                      focusVisibleRing="inside"
                    >
                      <NextLink href={getPlantingHref(p)}>{row}</NextLink>
                    </Link>
                  ) : (
                    <Box {...rowStyles}>{row}</Box>
                  )}
                </chakra.li>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
