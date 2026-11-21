"use client";

import { Box, type BoxProps, Button, Flex, Heading, LinkBox, LinkOverlay, chakra } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Switch } from "@/components/forms/switch";
import { formatDate, formatNumber } from "../../format";
import type { AreaId, PlantingSummary } from "../../types";
import { type HeadingLevel, RecordCode } from "../../typography";

export interface AreaPlantingListProps extends Omit<BoxProps, "children"> {
  areaId: AreaId;
  plantings: PlantingSummary[];
  /** Controlado: exibe plantios encerrados e cancelados. */
  showClosed?: boolean;
  defaultShowClosed?: boolean;
  onShowClosedChange?: (show: boolean) => void;
  /** Link de cada plantio. */
  getPlantingHref?: (planting: PlantingSummary) => string;
  /** Link do formulário de novo plantio com a área preenchida (padrão: `/plantios/novo?area=<id>`). */
  newPlantingHref?: string | ((areaId: AreaId) => string);
  /** Esconde a ação de criar plantio (ex.: perfil sem permissão). */
  hideCreate?: boolean;
  title?: string;
  /** Nível do título (padrão h3; tamanho de título de seção). */
  headingAs?: HeadingLevel;
}

const CLOSED = new Set(["encerrado", "cancelado"]);

function yearOf(iso?: string) {
  return iso ? iso.slice(0, 4) : undefined;
}

function periodText(p: PlantingSummary): string {
  if (CLOSED.has(p.status) && p.plantedAt) {
    const start = yearOf(p.plantedAt);
    const end = yearOf(p.endedAt);
    return end && end !== start ? `${start}–${end}` : (start ?? "");
  }
  return p.plantedAt ? `desde ${formatDate(p.plantedAt)}` : "sem data de plantio";
}

/**
 * AreaPlantingList — plantios de uma área, com filtro de encerrados e atalho
 * para criar um plantio já com a área preenchida. Chakra v3: Stack · LinkBox · StatusBadge.
 */
export function AreaPlantingList({
  areaId,
  plantings,
  showClosed,
  defaultShowClosed = false,
  onShowClosedChange,
  getPlantingHref = (p) => `/plantios/${p.id}`,
  newPlantingHref = (id) => `/plantios/novo?area=${encodeURIComponent(id)}`,
  hideCreate,
  title = "Plantios nesta área",
  headingAs = "h3",
  ...rest
}: AreaPlantingListProps) {
  const [innerShow, setInnerShow] = useState(defaultShowClosed);
  const show = showClosed ?? innerShow;
  const setShow = (v: boolean) => {
    if (showClosed === undefined) setInnerShow(v);
    onShowClosedChange?.(v);
  };

  const visible = show ? plantings : plantings.filter((p) => !CLOSED.has(p.status));
  const hiddenCount = plantings.length - visible.length;
  const createHref = typeof newPlantingHref === "function" ? newPlantingHref(areaId) : newPlantingHref;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="3.5"
      p="5"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      {...rest}
    >
      <Flex justify="space-between" align="center" gap="2" flexWrap="wrap">
        <Heading as={headingAs} textStyle="heading.md" color="fg.heading">
          {title}
        </Heading>
        <Box>
          <Switch size="sm" label="Mostrar encerrados e cancelados" labelPosition="end" checked={show} onCheckedChange={setShow} />
        </Box>
      </Flex>

      {visible.length > 0 ? (
        <chakra.ul listStyleType="none" m="0" p="0">
          {visible.map((p) => (
            <chakra.li key={p.id} borderTopWidth="1px" borderColor="green.100">
              <LinkBox
                display="flex"
                alignItems="center"
                gap="3"
                minH="14"
                py="1.5"
                borderRadius="md"
                _hover={{ bg: "bg.subtle" }}
                css={{ "&:has(a:focus-visible)": { outline: "2px solid", outlineColor: "primary", outlineOffset: "2px" } }}
              >
                <Flex direction="column" gap="0.5" flex="1 1 auto" minW="0">
                  <chakra.span textStyle="label" fontWeight="600" color="fg">
                    <LinkOverlay asChild _focusVisible={{ outline: "none" }}>
                      <NextLink href={getPlantingHref(p)}>
                        <RecordCode color="primary">{p.code}</RecordCode>
                        {" · "}
                        {p.species.name}
                        {p.cultivar ? ` · ${p.cultivar.name}` : ""}
                      </NextLink>
                    </LinkOverlay>
                  </chakra.span>
                  <chakra.span textStyle="body.sm" color="fg.muted">
                    {formatNumber(p.plants)} plantas · {periodText(p)}
                  </chakra.span>
                </Flex>
                <StatusBadge status={p.status} size="sm" />
              </LinkBox>
            </chakra.li>
          ))}
        </chakra.ul>
      ) : (
        <chakra.p m="0" textStyle="body.sm" color="fg.muted">
          {hiddenCount > 0
            ? `Nenhum plantio em andamento. ${hiddenCount === 1 ? "1 plantio encerrado ou cancelado oculto" : `${hiddenCount} plantios encerrados ou cancelados ocultos`}.`
            : "Nenhum plantio nesta área ainda."}
        </chakra.p>
      )}

      {!hideCreate && (
        <Flex justify="flex-end" borderTopWidth={visible.length > 0 ? "1px" : undefined} borderColor="green.100" pt={visible.length > 0 ? "3" : undefined}>
          <Button asChild variant="outline" size="sm">
            <NextLink href={createHref}>
              <Plus aria-hidden="true" />
              Novo plantio nesta área
            </NextLink>
          </Button>
        </Flex>
      )}
    </Box>
  );
}
