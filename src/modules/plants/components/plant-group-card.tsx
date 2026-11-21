"use client";

import { Flex, Heading, IconButton, chakra, type FlexProps } from "@chakra-ui/react";
import { Ellipsis, Pencil, Split } from "lucide-react";
import { Badge } from "@/components/data-display/badge";
import { ActionMenu, type ActionMenuEntry } from "@/components/navigation/action-menu";
import { formatDate, formatNumber } from "../../format";
import type { PlantGroup } from "../../types";
import { type HeadingLevel, MetricValue, RecordCode } from "../../typography";

export interface PlantGroupCardProps extends Omit<FlexProps, "children"> {
  group: PlantGroup;
  onEdit?: () => void;
  /** Dividir o grupo (ex.: tornar parte das plantas individuais). */
  onSplit?: () => void;
  /** Nível do nome do grupo (padrão h3; tamanho de título de card). */
  headingAs?: HeadingLevel;
}

/**
 * PlantGroupCard — grupo de plantas com quantidade, descrição e ações.
 * Chakra v3: Card.Root · Badge · Menu.
 */
export function PlantGroupCard({ group, onEdit, onSplit, headingAs = "h3", ...rest }: PlantGroupCardProps) {
  const actions: ActionMenuEntry[] = [
    ...(onEdit ? [{ value: "edit", label: "Editar grupo", icon: Pencil, onSelect: onEdit }] : []),
    ...(onSplit ? [{ value: "split", label: "Dividir grupo", icon: Split, onSelect: onSplit }] : []),
  ];

  return (
    <Flex
      direction="column"
      gap="2"
      p="4"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      minW="0"
      {...rest}
    >
      <Flex justify="space-between" align="flex-start" gap="2">
        <Flex direction="column" gap="0.5" minW="0">
          <Heading as={headingAs} textStyle="heading.sm" color="fg.heading" truncate>
            {group.name}
          </Heading>
          <RecordCode size="sm">{group.code}</RecordCode>
        </Flex>
        <Flex align="center" gap="1" flex="none">
          <Badge tone="gray">Grupo</Badge>
          {actions.length > 0 && (
            <ActionMenu
              label={`Ações do grupo ${group.name}`}
              items={actions}
              trigger={
                <IconButton aria-label={`Ações do grupo ${group.name}`} variant="ghost" size="sm" color="fg.muted">
                  <Ellipsis size={20} strokeWidth={1.75} aria-hidden="true" />
                </IconButton>
              }
            />
          )}
        </Flex>
      </Flex>
      <chakra.p m="0">
        <MetricValue value={formatNumber(group.quantity)} unit={group.quantity === 1 ? "planta" : "plantas"} color="fg" />
      </chakra.p>
      <chakra.p m="0" textStyle="body.sm" color="fg.muted">
        {group.description ?? "Controle agrupado"} · registrado em {formatDate(group.createdAt)}
      </chakra.p>
    </Flex>
  );
}
