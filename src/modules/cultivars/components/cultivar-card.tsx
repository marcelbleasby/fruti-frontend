import { Box, type BoxProps, Flex, Heading, Icon, Link, Text, chakra } from "@chakra-ui/react";
import { Sprout } from "lucide-react";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { plural } from "@/modules/format";
import type { Cultivar, SpeciesRef } from "@/modules/types";
import type { HeadingLevel } from "@/modules/typography";

export interface CultivarCardProps extends Omit<BoxProps, "children"> {
  cultivar: Cultivar;
  species: SpeciesRef;
  /** Quantidade de plantios. Padrão: `cultivar.plantingCount`. */
  plantings?: number;
  /** Link para os detalhes (o nome vira link). */
  href?: string;
  /** Texto descritivo. Padrão: "Origem: {origin}." */
  description?: ReactNode;
  /** Nível do nome da cultivar (padrão h3; tamanho de título de card). */
  headingAs?: HeadingLevel;
}

/**
 * CultivarCard — nome, espécie, contagem de plantios e origem.
 * Chakra v3: Card.Root · Badge · Link.
 */
export function CultivarCard({ cultivar, species, plantings, href, description, headingAs = "h3", ...rest }: CultivarCardProps) {
  const count = plantings ?? cultivar.plantingCount ?? 0;
  const text = description ?? (cultivar.origin ? `Origem: ${cultivar.origin}.` : null);

  return (
    <Box
      as="article"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      p="4"
      display="flex"
      flexDirection="column"
      gap="2.5"
      {...rest}
    >
      <Flex justify="space-between" align="flex-start" gap="2">
        <Box display="flex" flexDirection="column" gap="0.5" minW="0">
          <Heading as={headingAs} textStyle="heading.sm" color="fg.heading">
            {href ? (
              <Link asChild color="inherit" textDecoration="none" _hover={{ textDecoration: "underline" }}>
                <NextLink href={href}>{cultivar.name}</NextLink>
              </Link>
            ) : (
              cultivar.name
            )}
          </Heading>
          <chakra.span textStyle="body.sm" color="fg.muted">
            {species.name}
            {species.scientificName ? (
              <>
                {" · "}
                <i>{species.scientificName}</i>
              </>
            ) : null}
          </chakra.span>
        </Box>
        <chakra.span
          display="inline-flex"
          alignItems="center"
          gap="1"
          h="7"
          px="2.5"
          borderRadius="full"
          bg={count > 0 ? "primary.subtle" : "bg.muted"}
          color={count > 0 ? "fg.heading" : "fg.muted"}
          textStyle="caption"
          fontWeight="600"
          whiteSpace="nowrap"
          flexShrink={0}
        >
          <Icon boxSize="3" aria-hidden="true">
            <Sprout strokeWidth={2.25} />
          </Icon>
          {count > 0 ? plural(count, "plantio") : "sem plantios"}
        </chakra.span>
      </Flex>
      {text && (
        <Text textStyle="body.sm" color="fg">
          {text}
        </Text>
      )}
    </Box>
  );
}
