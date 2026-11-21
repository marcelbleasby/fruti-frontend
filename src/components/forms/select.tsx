"use client";

import { Portal, Select as ChakraSelect, chakra, createListCollection, type SelectRootProps } from "@chakra-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import { listContentStyles, listGroupLabelStyles, listItemStyles, triggerStyles } from "./styles";
import type { FieldBaseProps, FieldOption } from "./types";

export interface SelectOption extends FieldOption {
  /** Nome do grupo (ex.: "Com plantio ativo"). Opções com grupo são agrupadas com rótulo. */
  group?: string;
}

export interface SelectProps extends FieldBaseProps {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null, option: SelectOption | undefined) => void;
  /** Texto quando vazio (padrão "Selecione"). */
  placeholder?: string;
  name?: string;
  /** Mostra botão para limpar a seleção. */
  clearable?: boolean;
  /** Renderiza a lista em Portal (padrão: true). Desligue dentro de Dialog se necessário. */
  portalled?: boolean;
  positioning?: SelectRootProps["positioning"];
  onOpenChange?: (open: boolean) => void;
}

/**
 * Select — Select.Root + createListCollection, com grupos, descrição por item
 * e item desabilitado. Para listas curtas no mobile, prefira NativeSelectField.
 */
export function Select(props: SelectProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = "Selecione",
    name,
    clearable,
    portalled = true,
    positioning,
    onOpenChange,
  } = rest;

  const hasGroups = options.some((o) => o.group);
  const collection = useMemo(
    () =>
      createListCollection<SelectOption>({
        items: options,
        itemToString: (o) => o.label,
        itemToValue: (o) => o.value,
        isItemDisabled: (o) => Boolean(o.disabled),
        groupBy: hasGroups ? (o) => o.group ?? "" : undefined,
      }),
    [options, hasGroups],
  );

  const renderItem = (option: SelectOption) => (
    <ChakraSelect.Item key={option.value} item={option} css={listItemStyles}>
      <chakra.span flex="1" minW="0" display="flex" flexDirection="column">
        <ChakraSelect.ItemText textStyle="body.sm" color="fg">
          {option.label}
        </ChakraSelect.ItemText>
        {option.description && (
          <chakra.span textStyle="caption" fontWeight="normal" color="fg.muted">
            {option.description}
          </chakra.span>
        )}
      </chakra.span>
      <ChakraSelect.ItemIndicator color="primary" display="flex">
        <Check size={16} strokeWidth={1.75} />
      </ChakraSelect.ItemIndicator>
    </ChakraSelect.Item>
  );

  return (
    <FormField {...fieldProps}>
      <ChakraSelect.Root
        collection={collection}
        value={value === undefined ? undefined : value ? [value] : []}
        defaultValue={defaultValue ? [defaultValue] : undefined}
        onValueChange={onValueChange ? (d) => onValueChange(d.value[0] ?? null, d.items[0]) : undefined}
        onOpenChange={onOpenChange ? (d) => onOpenChange(d.open) : undefined}
        name={name}
        positioning={{ sameWidth: true, gutter: 4, ...positioning }}
        width="full"
      >
        <ChakraSelect.HiddenSelect />
        <ChakraSelect.Control>
          <ChakraSelect.Trigger css={triggerStyles} pe={clearable ? "16" : "10"}>
            <ChakraSelect.ValueText placeholder={placeholder} />
          </ChakraSelect.Trigger>
          <ChakraSelect.IndicatorGroup pe="1">
            {clearable && <ChakraSelect.ClearTrigger color="fg.muted" aria-label="Limpar seleção" />}
            <ChakraSelect.Indicator color="fg.muted">
              <ChevronDown size={20} strokeWidth={1.75} />
            </ChakraSelect.Indicator>
          </ChakraSelect.IndicatorGroup>
        </ChakraSelect.Control>
        <Portal disabled={!portalled}>
          <ChakraSelect.Positioner>
            <ChakraSelect.Content css={listContentStyles}>
              {hasGroups
                ? collection.group().map(([group, items]) => (
                    <ChakraSelect.ItemGroup key={group || "_"}>
                      {group && <ChakraSelect.ItemGroupLabel css={listGroupLabelStyles}>{group}</ChakraSelect.ItemGroupLabel>}
                      {items.map(renderItem)}
                    </ChakraSelect.ItemGroup>
                  ))
                : collection.items.map(renderItem)}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
    </FormField>
  );
}
