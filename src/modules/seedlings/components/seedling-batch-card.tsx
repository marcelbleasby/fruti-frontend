import { Box, Flex, Heading, LinkBox, LinkOverlay, type LinkBoxProps } from "@chakra-ui/react";
import NextLink from "next/link";
import { formatDate } from "@/modules/format";
import type { SeedlingBatch } from "@/modules/types";
import { type HeadingLevel, RecordCode } from "@/modules/typography";
import { batchMaterialLabel, batchUnit, DEFAULT_LOW_THRESHOLD } from "../utils";
import { SeedlingAvailability } from "./seedling-availability";

export interface SeedlingBatchCardProps extends Omit<LinkBoxProps, "children"> {
  batch: SeedlingBatch;
  /** Destino do card (detalhes do lote). Sem `href`, o card não é clicável. */
  href?: string;
  lowThreshold?: number;
  /** Nível do título do card (padrão h3; tamanho de título de card). */
  headingAs?: HeadingLevel;
}

/**
 * SeedlingBatchCard — código, material, recebimento e disponibilidade do lote.
 * O card inteiro é um único link. Chakra v3: Card.Root · LinkOverlay · SeedlingAvailability.
 */
export function SeedlingBatchCard({
  batch,
  href,
  lowThreshold = DEFAULT_LOW_THRESHOLD,
  headingAs = "h3",
  ...rest
}: SeedlingBatchCardProps) {
  const label = batchMaterialLabel(batch);
  return (
    <LinkBox
      as="article"
      display="flex"
      flexDirection="column"
      gap="3"
      p="4"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      transitionProperty="border-color, box-shadow"
      transitionDuration="fast"
      _hover={href ? { borderColor: "primary" } : undefined}
      _focusWithin={href ? { outline: "2px solid", outlineColor: "primary", outlineOffset: "2px" } : undefined}
      {...rest}
    >
      <Flex direction="column" gap="0.5">
        <RecordCode color="primary">{batch.code}</RecordCode>
        <Heading as={headingAs} textStyle="heading.sm" color="fg.heading">
          {href ? (
            <LinkOverlay asChild outline="none">
              <NextLink href={href}>{label}</NextLink>
            </LinkOverlay>
          ) : (
            label
          )}
        </Heading>
        <Box as="span" textStyle="body.sm" color="fg.muted">
          Recebido em {formatDate(batch.receivedAt)}
          {batch.supplier ? ` · ${batch.supplier}` : ""}
        </Box>
      </Flex>
      <SeedlingAvailability total={batch.total} used={batch.used} unit={batchUnit(batch)} lowThreshold={lowThreshold} />
    </LinkBox>
  );
}
