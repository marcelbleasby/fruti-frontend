import { Box, type BoxProps, Button, Flex, Heading, Link, Stack, Text, chakra } from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import NextLink from "next/link";
import { RecordDetails } from "@/components/data-display/record-details";
import { plural } from "@/modules/format";
import type { Cultivar, Species, SpeciesCycle } from "@/modules/types";
import type { HeadingLevel } from "@/modules/typography";

const CYCLE_LABEL: Record<SpeciesCycle, string> = {
  perene: "Perene",
  anual: "Anual",
  semiperene: "Semiperene",
};

export interface SpeciesDetailsProps extends Omit<BoxProps, "children"> {
  species: Species;
  relatedCultivars: Cultivar[];
  /** Quantidade de plantios com a espécie. Padrão: `species.plantingCount`. */
  relatedPlantings?: number;
  /** Link para a lista de plantios filtrada pela espécie. */
  plantingsHref?: string;
  /** Monta o link de cada cultivar relacionada. */
  getCultivarHref?: (cultivar: Cultivar) => string;
  /** Link de edição (ou use `onEdit`). */
  editHref?: string;
  onEdit?: () => void;
  /** Nível do nome da espécie (padrão h2; tamanho de título de seção). */
  headingAs?: HeadingLevel;
}

/** Link em pílula (30 px) — cultivares relacionadas. */
export function RelatedChipLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      asChild
      display="inline-flex"
      alignItems="center"
      h="8"
      px="3"
      borderRadius="full"
      bg="primary.subtle"
      color="fg.heading"
      textStyle="label"
      textDecoration="none"
      _hover={{ bg: "green.200", textDecoration: "none" }}
      focusVisibleRing="outside"
    >
      <NextLink href={href}>{children}</NextLink>
    </Link>
  );
}

/**
 * SpeciesDetails — dados da espécie, plantios e cultivares relacionadas.
 * Chakra v3: RecordDetails · Tag · Link.
 */
export function SpeciesDetails({
  species,
  relatedCultivars,
  relatedPlantings,
  plantingsHref,
  getCultivarHref,
  editHref,
  onEdit,
  headingAs = "h2",
  ...rest
}: SpeciesDetailsProps) {
  const plantings = relatedPlantings ?? species.plantingCount;
  const plantingsLabel = plantings != null ? plural(plantings, "plantio") : null;

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
            {species.name}
          </Heading>
          <Text textStyle="body.sm" color="fg.muted" fontStyle="italic">
            {species.scientificName}
          </Text>
        </Stack>
        {(editHref || onEdit) &&
          (editHref ? (
            <Button asChild size="sm" variant="outline">
              <NextLink href={editHref}>
                <Pencil strokeWidth={1.75} aria-hidden="true" />
                Editar
              </NextLink>
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil strokeWidth={1.75} aria-hidden="true" />
              Editar
            </Button>
          ))}
      </Flex>

      <RecordDetails
        surface="none"
        columns={3}
        items={[
          { label: "Nome popular", value: species.name },
          { label: "Nome científico", value: <i>{species.scientificName}</i> },
          { label: "Família", value: species.family },
          { label: "Ciclo", value: species.cycle ? CYCLE_LABEL[species.cycle] : null },
          {
            label: "Plantios",
            value:
              plantingsLabel && plantingsHref ? (
                <Link asChild color="primary" fontWeight="600" textDecoration="underline" textUnderlineOffset="4px">
                  <NextLink href={plantingsHref}>{plantingsLabel}</NextLink>
                </Link>
              ) : (
                plantingsLabel
              ),
          },
        ]}
      />

      <Stack gap="2" pt="3" borderTopWidth="1px" borderColor="green.100">
        <chakra.span textStyle="label" color="fg.muted" id={`species-${species.id}-cultivars`}>
          Cultivares relacionadas
        </chakra.span>
        {relatedCultivars.length === 0 ? (
          <Text textStyle="body.sm" color="fg.muted">
            Nenhuma cultivar cadastrada para esta espécie.
          </Text>
        ) : (
          <Flex
            as="ul"
            listStyleType="none"
            wrap="wrap"
            gap="1.5"
            aria-labelledby={`species-${species.id}-cultivars`}
          >
            {relatedCultivars.map((c) => (
              <li key={c.id}>
                {getCultivarHref ? (
                  <RelatedChipLink href={getCultivarHref(c)}>{c.name}</RelatedChipLink>
                ) : (
                  <chakra.span
                    display="inline-flex"
                    alignItems="center"
                    h="8"
                    px="3"
                    borderRadius="full"
                    bg="primary.subtle"
                    color="fg.heading"
                    textStyle="label"
                  >
                    {c.name}
                  </chakra.span>
                )}
              </li>
            ))}
          </Flex>
        )}
      </Stack>
    </Box>
  );
}
