"use client";

import { Box, Button, Flex, chakra, type FlexProps } from "@chakra-ui/react";
import { ArrowRightLeft, Check } from "lucide-react";
import { STATUS_DEFINITIONS, StatusBadge } from "@/components/data-display/status-badge";
import { ActionMenu, type ActionMenuEntry } from "@/components/navigation/action-menu";
import type { PlantingStatus as PlantingStatusValue } from "../../types";
import { PLANTING_FLOW } from "../utils";

export type PlantingStatusVariant = "badge" | "steps";

export interface PlantingStatusProps extends Omit<FlexProps, "children" | "onChange"> {
  status: PlantingStatusValue;
  /** badge (padrão): StatusBadge · steps: badge + ciclo do plantio. */
  variant?: PlantingStatusVariant;
  /** Transições permitidas a partir do status atual (vêm da API). Sem elas, o menu não aparece. */
  allowedTransitions?: PlantingStatusValue[];
  /** Chamado com o novo status escolhido em "Alterar status". */
  onChange?: (next: PlantingStatusValue) => void;
  /** Código do plantio, para o rótulo acessível do menu (ex.: "PL-0042"). */
  plantingCode?: string;
  size?: "sm" | "md";
}

function StatusSteps({ status }: { status: Exclude<PlantingStatusValue, "cancelado"> }) {
  const current = PLANTING_FLOW.indexOf(status);
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      p="4"
      overflowX="auto"
    >
      <chakra.ol aria-label="Ciclo do plantio" m="0" p="0" listStyleType="none" display="flex" minW="0">
        {PLANTING_FLOW.map((step, i) => {
          const done = i < current || (i === current && step === "encerrado");
          const isCurrent = i === current;
          const last = i === PLANTING_FLOW.length - 1;
          const label = STATUS_DEFINITIONS[step].label;
          return (
            <chakra.li
              key={step}
              display="flex"
              flex={last ? "0 1 auto" : "1 1 0"}
              minW="0"
              gap="1"
              aria-current={isCurrent ? "step" : undefined}
            >
              <Flex direction="column" align="center" gap="2" w="16" minW="12" flex="0 1 auto">
                {done ? (
                  <Flex boxSize="7" borderRadius="full" bg="primary" color="fg.inverted" align="center" justify="center">
                    <Check size={16} strokeWidth={2.25} aria-hidden="true" />
                  </Flex>
                ) : isCurrent ? (
                  <Flex
                    boxSize="7"
                    borderRadius="full"
                    borderWidth="2px"
                    borderColor="primary"
                    bg="bg.panel"
                    align="center"
                    justify="center"
                  >
                    <Box boxSize="2.5" borderRadius="full" bg="primary" />
                  </Flex>
                ) : (
                  <Box boxSize="7" borderRadius="full" borderWidth="2px" borderColor="border.control" bg="bg.panel" />
                )}
                <chakra.span
                  textStyle="caption"
                  textAlign="center"
                  fontWeight={isCurrent ? "600" : "500"}
                  color={isCurrent ? "fg.heading" : done ? "fg" : "fg.muted"}
                >
                  {label}
                  <chakra.span srOnly>
                    {done ? " (concluído)" : isCurrent ? " (atual)" : " (pendente)"}
                  </chakra.span>
                </chakra.span>
              </Flex>
              {!last && (
                <Box flex="1 1 auto" h="2px" mt="3" bg={i < current ? "primary" : "border"} aria-hidden="true" />
              )}
            </chakra.li>
          );
        })}
      </chakra.ol>
    </Box>
  );
}

/**
 * PlantingStatus — status do plantio como badge (com "Alterar status") ou como ciclo.
 * Cancelado fica fora do fluxo e aparece só como badge. As transições vêm da API.
 * Chakra v3: StatusBadge · Steps · Menu.
 */
export function PlantingStatus({
  status,
  variant = "badge",
  allowedTransitions,
  onChange,
  plantingCode,
  size = "md",
  ...rest
}: PlantingStatusProps) {
  const transitions = (allowedTransitions ?? []).filter((s) => s !== status);
  const menuItems: ActionMenuEntry[] = transitions.map((s) => ({
    value: s,
    label: STATUS_DEFINITIONS[s].label,
    icon: STATUS_DEFINITIONS[s].icon,
    destructive: s === "cancelado",
  }));
  const showMenu = Boolean(onChange) && menuItems.length > 0;
  const showSteps = variant === "steps" && status !== "cancelado";

  return (
    <Flex direction="column" gap="3" {...rest}>
      <Flex align="center" justify="space-between" gap="2" wrap="wrap">
        <StatusBadge status={status} size={size} />
        {showMenu && (
          <ActionMenu
            label={plantingCode ? `Alterar status do plantio ${plantingCode}` : "Alterar status do plantio"}
            items={menuItems}
            onSelect={(value) => onChange?.(value as PlantingStatusValue)}
            trigger={
              <Button variant="outline" size="sm">
                <ArrowRightLeft strokeWidth={1.75} aria-hidden="true" />
                Alterar status
              </Button>
            }
          />
        )}
      </Flex>
      {showSteps && <StatusSteps status={status as Exclude<PlantingStatusValue, "cancelado">} />}
    </Flex>
  );
}
