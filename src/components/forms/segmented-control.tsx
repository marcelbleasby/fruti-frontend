"use client";

import { SegmentGroup, Stack, Text, chakra } from "@chakra-ui/react";
import { useId, type ReactNode } from "react";

export interface SegmentedControlItem {
  value: string;
  /** Texto curto. Para segmento só com ícone, informe `icon` + `ariaLabel`. */
  label?: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  /** Nome acessível do grupo (ex.: "Período"). Visível só se `showLabel`. */
  label: string;
  showLabel?: boolean;
  name?: string;
  disabled?: boolean;
  /** Segmentos dividem a largura toda (padrão: true). Use false para grupos de ícones. */
  fullWidth?: boolean;
}

/**
 * SegmentedControl — SegmentGroup.Root. Até 4 opções curtas e mutuamente
 * exclusivas (período, visualização lista/grade). Trilho `bg.muted`, segmento ativo branco.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const { items, value, defaultValue, onValueChange, label, showLabel, name, disabled, fullWidth = true } = props;
  const labelId = useId();

  const group = (
    <SegmentGroup.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      name={name}
      disabled={disabled}
      aria-label={showLabel ? undefined : label}
      aria-labelledby={showLabel ? labelId : undefined}
      display="flex"
      alignSelf={fullWidth ? "stretch" : "flex-start"}
      w={fullWidth ? "full" : "fit-content"}
      minW="0"
      maxW="full"
      overflowX="auto"
      p="1"
      bg="bg.muted"
      borderRadius="xl"
      boxShadow="none"
      css={{ "--segment-radius": "8px", "--segment-indicator-bg": "colors.bg.panel", "--segment-indicator-shadow": "shadows.xs" }}
    >
      <SegmentGroup.Indicator />
      {items.map((item) => {
        const iconOnly = item.label == null && item.icon != null;
        return (
          <SegmentGroup.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            aria-label={item.ariaLabel}
            flex={fullWidth ? "1 0 auto" : undefined}
            whiteSpace="nowrap"
            minH="9"
            minW={iconOnly ? "10" : undefined}
            px={iconOnly ? "0" : "3"}
            gap="1.5"
            fontSize="sm"
            fontWeight="medium"
            color="fg.muted"
            cursor="pointer"
            _before={{ display: "none" }}
            _checked={{ color: "fg.heading", fontWeight: "600" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            <SegmentGroup.ItemText display="inline-flex" alignItems="center" gap="1.5">
              {item.icon && (
                <chakra.span display="flex" aria-hidden="true">
                  {item.icon}
                </chakra.span>
              )}
              {item.label}
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        );
      })}
    </SegmentGroup.Root>
  );

  if (!showLabel) return group;

  return (
    <Stack gap="1.5" align={fullWidth ? "stretch" : "flex-start"}>
      <Text id={labelId} textStyle="label" color="fg">
        {label}
      </Text>
      {group}
    </Stack>
  );
}
