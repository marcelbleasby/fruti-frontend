"use client";

import { Portal, Select as ChakraSelect, chakra, createListCollection } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { splitFieldProps } from "@/components/forms/field-utils";
import { FormField } from "@/components/forms/form-field";
import { listContentStyles, listItemStyles, triggerStyles } from "@/components/forms/styles";
import type { FieldBaseProps } from "@/components/forms/types";
import { areaSquareMeters, formatHectares, plural } from "../../format";
import type { Area, AreaId } from "../../types";
import { RecordCode } from "../../typography";

export interface AreaSelectorProps extends FieldBaseProps {
  areas: Area[];
  value?: AreaId | null;
  defaultValue?: AreaId;
  onChange?: (value: AreaId | null, area: Area | undefined) => void;
  /** Restringe as opções (ex.: só áreas sem plantio ativo). */
  filter?: (area: Area) => boolean;
  /** Desabilita (sem esconder) as opções que não passam no critério. */
  isAreaDisabled?: (area: Area) => boolean;
  placeholder?: string;
  /** Texto quando nenhuma área passa no `filter`. */
  emptyText?: string;
  name?: string;
  portalled?: boolean;
}

function activeText(area: Area): string {
  const n = area.activePlantings ?? 0;
  return n > 0 ? plural(n, "plantio ativo", "plantios ativos") : "Sem plantio ativo";
}

function areaSize(area: Area): string {
  return formatHectares(areaSquareMeters(area.length, area.width));
}

function Code({ children }: { children: string }) {
  return (
    <RecordCode color="fg.heading">{children}</RecordCode>
  );
}

/**
 * AreaSelector — Select.Root com código, nome, tamanho e situação de plantio
 * em cada opção: o essencial para decidir sem abrir outra tela.
 */
export function AreaSelector(props: AreaSelectorProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    areas,
    value,
    defaultValue,
    onChange,
    filter,
    isAreaDisabled,
    placeholder = "Selecione uma área",
    emptyText = "Nenhuma área disponível",
    name,
    portalled = true,
  } = rest;

  const items = useMemo(() => (filter ? areas.filter(filter) : areas), [areas, filter]);
  const collection = useMemo(
    () =>
      createListCollection<Area>({
        items,
        itemToString: (a) => `${a.code} · ${a.name}`,
        itemToValue: (a) => a.id,
        isItemDisabled: (a) => Boolean(isAreaDisabled?.(a)),
      }),
    [items, isAreaDisabled],
  );

  return (
    <FormField {...fieldProps}>
      <ChakraSelect.Root
        collection={collection}
        value={value === undefined ? undefined : value ? [value] : []}
        defaultValue={defaultValue ? [defaultValue] : undefined}
        onValueChange={onChange ? (d) => onChange(d.value[0] ?? null, d.items[0]) : undefined}
        name={name}
        positioning={{ sameWidth: true, gutter: 4 }}
        width="full"
      >
        <ChakraSelect.HiddenSelect />
        <ChakraSelect.Control>
          <ChakraSelect.Trigger css={triggerStyles} pe="10">
            <ChakraSelect.Context>
              {(api) => {
                const a = api.selectedItems[0] as Area | undefined;
                return a ? (
                  <chakra.span flex="1" minW="0" truncate textAlign="start">
                    <Code>{a.code}</Code> · {a.name} — {areaSize(a)}
                  </chakra.span>
                ) : (
                  <chakra.span flex="1" minW="0" truncate textAlign="start" color="fg.muted">
                    {placeholder}
                  </chakra.span>
                );
              }}
            </ChakraSelect.Context>
          </ChakraSelect.Trigger>
          <ChakraSelect.IndicatorGroup pe="1">
            <ChakraSelect.Indicator color="fg.muted">
              <ChevronDown size={20} strokeWidth={1.75} />
            </ChakraSelect.Indicator>
          </ChakraSelect.IndicatorGroup>
        </ChakraSelect.Control>
        <Portal disabled={!portalled}>
          <ChakraSelect.Positioner>
            <ChakraSelect.Content css={listContentStyles}>
              {collection.items.length === 0 && (
                <chakra.div px="3" py="2.5" textStyle="body.sm" color="fg.muted">
                  {emptyText}
                </chakra.div>
              )}
              {collection.items.map((area) => (
                <ChakraSelect.Item key={area.id} item={area} css={listItemStyles} minH="12">
                  <chakra.span flex="1" minW="0" display="flex" flexDirection="column">
                    <ChakraSelect.ItemText textStyle="body.sm" color="fg">
                      <Code>{area.code}</Code> · {area.name}
                    </ChakraSelect.ItemText>
                    <chakra.span textStyle="caption" color="fg.muted">
                      {activeText(area)}
                    </chakra.span>
                  </chakra.span>
                  <chakra.span textStyle="label" fontWeight="600" color="fg" whiteSpace="nowrap">
                    {areaSize(area)}
                  </chakra.span>
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
    </FormField>
  );
}
