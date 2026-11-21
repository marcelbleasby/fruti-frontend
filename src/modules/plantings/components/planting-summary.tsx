import { Box, Flex, Heading, chakra, type BoxProps } from "@chakra-ui/react";
import { Sprout } from "lucide-react";
import NextLink from "next/link";
import { StatusBadge } from "@/components/data-display/status-badge";
import { SeedlingOriginDisplay } from "@/modules/seedlings";
import { formatDate, formatNumber } from "../../format";
import type { PlantingSummary as PlantingSummaryData } from "../../types";
import { type HeadingLevel, RecordCode } from "../../typography";
import { plantingTitle } from "../utils";

export interface PlantingSummaryProps extends Omit<BoxProps, "children"> {
  planting: PlantingSummaryData;
  /** O card inteiro vira um link (um único alvo de clique). */
  href?: string;
  /** Compacto: sem a linha de plantas e origem, padding menor (listas densas). */
  compact?: boolean;
  /** Nível do título (espécie · cultivar). Padrão h3; tamanho de título de card. */
  headingAs?: HeadingLevel;
}

/** Código de plantio em Fira Code verde (RecordCode). */
export function PlantingCode({ children, size = "md" }: { children: string; size?: "md" | "sm" }) {
  return (
    <RecordCode size={size} color="primary">
      {children}
    </RecordCode>
  );
}

/**
 * PlantingSummary — código, status, espécie · cultivar, área, data, plantas e origem.
 * Chakra v3: Card.Root · LinkOverlay · StatusBadge · SeedlingOriginDisplay.
 */
export function PlantingSummary({ planting, href, compact, headingAs = "h3", ...rest }: PlantingSummaryProps) {
  const title = plantingTitle(planting);
  const area = `${planting.area.code} · ${planting.area.name}`;
  const when = planting.plantedAt ? ` · plantado em ${formatDate(planting.plantedAt)}` : "";

  const body = (
    <>
      <Flex justify="space-between" align="center" gap="2">
        <PlantingCode>{planting.code}</PlantingCode>
        <StatusBadge status={planting.status} size="sm" />
      </Flex>
      <Flex direction="column" gap="0.5" minW="0">
        <Heading as={headingAs} textStyle="heading.sm" color="fg.heading" truncate>
          {title}
        </Heading>
        <chakra.span textStyle="body.sm" color="fg.muted">
          {area}
          {when}
        </chakra.span>
      </Flex>
      {!compact && (
        <Flex wrap="wrap" rowGap="2" columnGap="4" textStyle="body.sm" color="fg" align="center">
          <Flex align="center" gap="1">
            <chakra.span color="primary" display="flex" aria-hidden="true">
              <Sprout size={16} strokeWidth={1.75} />
            </chakra.span>
            {formatNumber(planting.plants)} {planting.plants === 1 ? "planta" : "plantas"}
          </Flex>
          <SeedlingOriginDisplay origin={planting.origin} linkToBatch={false} />
        </Flex>
      )}
    </>
  );

  const frame: BoxProps = {
    display: "flex",
    flexDirection: "column",
    gap: compact ? "2" : "2.5",
    p: compact ? "3" : "4",
    bg: "bg.panel",
    borderWidth: "1px",
    borderColor: "border",
    borderRadius: "l3",
    boxShadow: "xs",
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
