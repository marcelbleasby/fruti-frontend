import { Box, type BoxProps, Card, Flex, Heading, Icon, chakra } from "@chakra-ui/react";
import { ImageOff } from "lucide-react";
import NextLink from "next/link";
import { Badge } from "@/components/data-display/badge";
import { Image } from "@/components/data-display/image";
import { plural } from "@/modules/format";
import type { Species } from "@/modules/types";
import type { HeadingLevel } from "@/modules/typography";

export interface SpeciesCardProps extends Omit<BoxProps, "children"> {
  species: Species;
  /** Destino (detalhes da espécie). O card inteiro é um único link. */
  href: string;
  /** Contagens exibidas como badges. Padrão: `species.cultivarCount` / `plantingCount`. */
  counts?: { cultivars?: number; plantings?: number };
  /** Nível do nome da espécie (padrão h3; tamanho de título de card). */
  headingAs?: HeadingLevel;
  /** Área de foto (padrão: mostra; com `false` o card fica só com o texto, para catálogos sem fotos). */
  showImage?: boolean;
}

/**
 * SpeciesCard — foto, nome popular, nome científico · família e contagens.
 * O card inteiro é um link (um único alvo de clique). Chakra v3: Card.Root · Image · Badge.
 */
export function SpeciesCard({ species, href, counts, headingAs = "h3", showImage = true, ...rest }: SpeciesCardProps) {
  const cultivars = counts?.cultivars ?? species.cultivarCount;
  const plantings = counts?.plantings ?? species.plantingCount;

  return (
    <Card.Root
      asChild
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      overflow="hidden"
      color="inherit"
      textDecoration="none"
      transitionProperty="border-color, box-shadow"
      transitionDuration="fast"
      _hover={{ borderColor: "primary" }}
      focusVisibleRing="outside"
      {...rest}
    >
      <NextLink href={href}>
        {!showImage ? null : species.imageUrl ? (
          <Image src={species.imageUrl} alt={`Foto de ${species.name}`} ratio={16 / 9} borderRadius="0" />
        ) : (
          <Flex
            aspectRatio={16 / 9}
            bg="bg.muted"
            color="fg.muted"
            direction="column"
            align="center"
            justify="center"
            gap="1"
            textStyle="caption"
            fontWeight="400"
            aria-hidden="true"
          >
            <Icon boxSize="5">
              <ImageOff strokeWidth={1.75} />
            </Icon>
            Sem foto
          </Flex>
        )}
        <Box px="4" py="3.5" display="flex" flexDirection="column" gap="1">
          <Heading as={headingAs} textStyle="heading.sm" color="fg.heading">
            {species.name}
          </Heading>
          <chakra.span textStyle="body.sm" color="fg.muted">
            <i>{species.scientificName}</i>
            {species.family ? ` · ${species.family}` : null}
          </chakra.span>
          {(cultivars != null || plantings != null || species.active === false) && (
            <Flex gap="1.5" wrap="wrap" mt="1.5">
              {species.active === false && (
                <Badge tone="gray" variant="outline">
                  Inativa
                </Badge>
              )}
              {cultivars != null && (
                <Badge tone="green">{plural(cultivars, "cultivo")}</Badge>
              )}
              {plantings != null && (
                <Badge tone="gray">{plural(plantings, "plantio")}</Badge>
              )}
            </Flex>
          )}
        </Box>
      </NextLink>
    </Card.Root>
  );
}
