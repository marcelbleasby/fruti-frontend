"use client";

import { Portal, Select as ChakraSelect, chakra, createListCollection, type SelectRootProps } from "@chakra-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { splitFieldProps } from "@/components/forms/field-utils";
import { FormField } from "@/components/forms/form-field";
import { listContentStyles, listItemStyles, triggerStyles } from "@/components/forms/styles";
import type { FieldBaseProps } from "@/components/forms/types";
import { plural } from "@/modules/format";
import type { Cultivar, CultivarId, SpeciesId } from "@/modules/types";

/** Por que o valor mudou: escolha do usuário ou limpeza por troca de espécie. */
export type CultivarChangeReason = "select" | "species-change";

export interface CultivarSelectorProps extends FieldBaseProps {
  /** Espécie escolhida. Sem espécie o campo fica desabilitado, com explicação. */
  speciesId: SpeciesId | null | undefined;
  /** Cultivares disponíveis (são filtradas por `speciesId`). */
  cultivars: Cultivar[];
  value?: CultivarId | null;
  onChange?: (value: CultivarId | null, cultivar: Cultivar | undefined, reason: CultivarChangeReason) => void;
  /** Oferece "Sem cultivar definida" (o plantio usa só a espécie). Padrão: true. */
  allowNone?: boolean;
  placeholder?: string;
  name?: string;
  portalled?: boolean;
  positioning?: SelectRootProps["positioning"];
}

const NONE = "__none__";

interface Option {
  value: string;
  label: string;
  description?: string;
  meta?: string;
}

/**
 * CultivarSelector — Select de cultivar dependente da espécie.
 * Desabilitado até haver espécie; ao trocar a espécie a cultivar escolhida é
 * limpa (`onChange(null, undefined, "species-change")`) para o formulário avisar.
 * Chakra v3: Select.Root · Select.Trigger · Select.Content · Field.
 */
export function CultivarSelector(props: CultivarSelectorProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    speciesId,
    cultivars,
    value,
    onChange,
    allowNone = true,
    placeholder,
    name,
    portalled = true,
    positioning,
  } = rest;

  const available = useMemo(
    () => (speciesId ? cultivars.filter((c) => c.speciesId === speciesId) : []),
    [cultivars, speciesId],
  );

  const options = useMemo<Option[]>(() => {
    const list: Option[] = available.map((c) => ({
      value: c.id,
      label: c.name,
      description: c.origin,
      meta: c.plantingCount ? plural(c.plantingCount, "plantio") : "—",
    }));
    if (allowNone && speciesId) {
      list.unshift({ value: NONE, label: "Sem cultivar definida", description: "o plantio usa só a espécie" });
    }
    return list;
  }, [available, allowNone, speciesId]);

  const collection = useMemo(
    () => createListCollection<Option>({ items: options, itemToString: (o) => o.label, itemToValue: (o) => o.value }),
    [options],
  );

  // Valor efetivo: uma cultivar de outra espécie nunca aparece selecionada.
  const effective = value && available.some((c) => c.id === value) ? value : null;

  // Troca de espécie → limpa a cultivar escolhida e avisa o formulário.
  const prevSpecies = useRef(speciesId);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    const previous = prevSpecies.current;
    prevSpecies.current = speciesId;
    if (previous && previous !== speciesId && value) {
      onChangeRef.current?.(null, undefined, "species-change");
    }
    // Só reage à troca de espécie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speciesId]);

  const disabled = fieldProps.disabled || !speciesId;
  const helperText = !speciesId ? (fieldProps.helperText ?? "A lista depende da espécie escolhida.") : fieldProps.helperText;
  const placeholderText = !speciesId
    ? "Selecione uma espécie primeiro"
    : (placeholder ?? (available.length === 0 ? "Nenhuma cultivar para esta espécie" : "Selecione a cultivar"));

  return (
    <FormField optional={!fieldProps.required} {...fieldProps} disabled={disabled} helperText={helperText}>
      <ChakraSelect.Root
        collection={collection}
        value={effective ? [effective] : []}
        onValueChange={(d) => {
          const v = d.value[0];
          if (!v || v === NONE) onChange?.(null, undefined, "select");
          else onChange?.(v, available.find((c) => c.id === v), "select");
        }}
        name={name}
        disabled={disabled}
        positioning={{ sameWidth: true, gutter: 4, ...positioning }}
        width="full"
      >
        <ChakraSelect.HiddenSelect />
        <ChakraSelect.Control>
          <ChakraSelect.Trigger css={triggerStyles} pe="10">
            <ChakraSelect.ValueText placeholder={placeholderText} />
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
              {collection.items.map((o) => (
                <ChakraSelect.Item
                  key={o.value}
                  item={o}
                  css={{ ...listItemStyles, minH: "11", justifyContent: "space-between" }}
                  borderBottomWidth={o.value === NONE ? "1px" : undefined}
                  borderColor="green.100"
                >
                  <chakra.span flex="1" minW="0" display="flex" flexDirection="column">
                    <ChakraSelect.ItemText textStyle="body.sm" color="fg">
                      {o.label}
                    </ChakraSelect.ItemText>
                    {o.description && (
                      <chakra.span
                        textStyle="caption"
                        fontWeight="400"
                        fontStyle={o.value === NONE ? "normal" : "italic"}
                        color="fg.muted"
                      >
                        {o.description}
                      </chakra.span>
                    )}
                  </chakra.span>
                  {o.meta && (
                    <chakra.span textStyle="caption" color="fg.muted" whiteSpace="nowrap">
                      {o.meta}
                    </chakra.span>
                  )}
                  <ChakraSelect.ItemIndicator color="primary" display="flex">
                    <Check size={16} strokeWidth={1.75} />
                  </ChakraSelect.ItemIndicator>
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
    </FormField>
  );
}
