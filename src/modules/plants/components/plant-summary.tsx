"use client";

import { Box, Flex, chakra, type BoxProps } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import NextLink from "next/link";
import { Badge } from "@/components/data-display/badge";
import { Image } from "@/components/data-display/image";
import { useTodayISO } from "@/hooks/useTodayISO";
import { formatDate } from "../../format";
import type { Plant } from "../../types";
import { RecordCode } from "../../typography";

export interface PlantSummaryProps extends Omit<BoxProps, "children"> {
  /** Planta individual. */
  plant: Plant;
  /** O card inteiro vira um link. */
  href?: string;
}

/** "linha 3, posição 14" (partes ausentes são omitidas). */
export function plantLocation(plant: Pick<Plant, "row" | "position">): string | undefined {
  const parts = [
    plant.row != null ? `linha ${plant.row}` : null,
    plant.position != null ? `posição ${plant.position}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

/**
 * "registrada hoje" ou "registrada em 20/11/2026".
 * `today` (`YYYY-MM-DD`) vem de `useTodayISO()`; sem ele, mostra sempre a data.
 */
export function registeredLabel(iso: string, today?: string): string {
  return today && iso.slice(0, 10) === today ? "registrada hoje" : `registrada em ${formatDate(iso)}`;
}

/**
 * PlantSummary — planta individual: miniatura, identificação, papel e posição.
 * Chakra v3: Card · Badge · Avatar (miniatura).
 */
export function PlantSummary({ plant, href, ...rest }: PlantSummaryProps) {
  const today = useTodayISO();
  const location = plantLocation(plant);
  const subtitle = [plant.label, location].filter(Boolean).join(" · ");

  const body = (
    <>
      <Image
        src={plant.thumbnailUrl}
        alt={plant.thumbnailUrl ? `Foto da planta ${plant.code}` : ""}
        placeholder="Foto"
        ratio={1}
        w="14"
        flex="none"
        borderRadius="l2"
      />
      <Flex direction="column" gap="0.5" flex="1 1 auto" minW="0">
        <Flex align="center" gap="2">
          <RecordCode color="primary">{plant.code}</RecordCode>
          <Badge tone="harvest">Individual</Badge>
        </Flex>
        {subtitle && (
          <chakra.span textStyle="body.sm" color="fg" truncate>
            {subtitle}
          </chakra.span>
        )}
        <chakra.span textStyle="caption" color="fg.muted">
          {plant.plantingCode} · {registeredLabel(plant.createdAt, today)}
        </chakra.span>
      </Flex>
      {href && (
        <chakra.span color="fg.muted" display="flex" flex="none" aria-hidden="true">
          <ChevronRight size={20} strokeWidth={1.75} />
        </chakra.span>
      )}
    </>
  );

  const frame: BoxProps = {
    display: "flex",
    alignItems: "center",
    gap: "3",
    p: "3",
    bg: "bg.panel",
    borderWidth: "1px",
    borderColor: "border",
    borderRadius: "l3",
    minW: "0",
  };

  if (href) {
    return (
      <Box
        asChild
        {...frame}
        color="inherit"
        textDecoration="none"
        transitionProperty="border-color, box-shadow"
        transitionDuration="fast"
        _hover={{ borderColor: "primary", boxShadow: "md" }}
        _focusVisible={{ outline: "2px solid", outlineColor: "primary", outlineOffset: "2px" }}
        {...rest}
      >
        <NextLink href={href}>{body}</NextLink>
      </Box>
    );
  }

  return (
    <Box {...frame} {...rest}>
      {body}
    </Box>
  );
}
