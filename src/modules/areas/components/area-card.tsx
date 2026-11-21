import { Box, Flex, Heading, chakra, type BoxProps } from "@chakra-ui/react";
import { Sprout } from "lucide-react";
import NextLink from "next/link";
import { areaSquareMeters, formatHectares, plural } from "../../format";
import type { Area } from "../../types";
import { type HeadingLevel, MetricValue, RecordCode } from "../../typography";
import { AreaMeasurementDisplay } from "./area-measurement-display";

export interface AreaCardProps extends Omit<BoxProps, "children"> {
  area: Area;
  /** Nível do nome da área (padrão h3; o tamanho é sempre o de título de card). */
  headingAs?: HeadingLevel;
  /** Plantios ativos (padrão: `area.activePlantings`). */
  activePlantings?: number;
  /** Total de plantas (padrão: `area.plants`). */
  plants?: number;
  /** O card inteiro vira um link (um único alvo de clique). */
  href?: string;
}

/** Valor em ha com a unidade menor e esmaecida (MetricValue). */
export function HectareValue({ squareMeters, size = "md" }: { squareMeters: number; size?: "lg" | "md" }) {
  const [num, unit] = formatHectares(squareMeters).split(" ");
  return <MetricValue value={num} unit={unit} size={size} />;
}

/** Código de área em Fira Code (RecordCode). */
export function AreaCode({ children, color = "fg.muted" }: { children: string; color?: string }) {
  return <RecordCode color={color}>{children}</RecordCode>;
}

/**
 * AreaCard — código, nome, tamanho, desenho proporcional e situação.
 * Chakra v3: Card.Root · LinkOverlay · Stat.
 */
export function AreaCard({ area, activePlantings, plants, href, headingAs = "h3", ...rest }: AreaCardProps) {
  const active = activePlantings ?? area.activePlantings ?? 0;
  const plantCount = plants ?? area.plants;
  const m2 = areaSquareMeters(area.length, area.width);

  const body = (
    <>
      <Flex justify="space-between" gap="2" align="flex-start">
        <Flex direction="column" gap="0.5" minW="0">
          <AreaCode>{area.code}</AreaCode>
          <Heading as={headingAs} textStyle="heading.sm" color="fg.heading" truncate>
            {area.name}
          </Heading>
        </Flex>
        <HectareValue squareMeters={m2} />
      </Flex>
      <AreaMeasurementDisplay length={area.length} width={area.width} maxWidth={250} maxHeight={100} />
      <Flex justify="space-between" gap="2" textStyle="body.sm" color="fg" flexWrap="wrap">
        <Flex align="center" gap="1">
          <chakra.span color="primary" display="flex" aria-hidden="true">
            <Sprout size={16} strokeWidth={1.75} />
          </chakra.span>
          {active > 0 ? plural(active, "plantio ativo", "plantios ativos") : "Sem plantio ativo"}
        </Flex>
        {plantCount != null && plantCount > 0 && <span>{plural(plantCount, "planta")}</span>}
      </Flex>
    </>
  );

  const frame: BoxProps = {
    display: "flex",
    flexDirection: "column",
    gap: "3",
    p: "4",
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
        <NextLink href={href}>
          {body}
        </NextLink>
      </Box>
    );
  }

  return (
    <Box {...frame} {...rest}>
      {body}
    </Box>
  );
}
