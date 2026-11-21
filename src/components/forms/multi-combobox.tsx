"use client";

import {
  Combobox,
  Portal,
  Tag,
  chakra,
  createListCollection,
  useControllableState,
  useFilter,
  type ComboboxRootProps,
} from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { FormField, resolveInvalid } from "./form-field";
import { splitFieldProps } from "./field-utils";
import { checkboxBoxStyles, controlFrameStyles, listContentStyles, listItemStyles } from "./styles";
import type { FieldBaseProps, FieldOption } from "./types";

export interface MultiComboboxProps extends FieldBaseProps {
  options: FieldOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  name?: string;
  /** Texto quando a busca não encontra nada. */
  emptyText?: string;
  /** Renderiza a lista em Portal (padrão: true). */
  portalled?: boolean;
  positioning?: ComboboxRootProps["positioning"];
}

/**
 * MultiCombobox — Combobox.Root multiple com tags. Busca por rótulo e descrição
 * (sem acento/caixa); Backspace com campo vazio remove a última tag.
 */
export function MultiCombobox(props: MultiComboboxProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    name,
    emptyText = "Nenhum resultado",
    portalled = true,
    positioning,
  } = rest;
  const invalid = resolveInvalid(fieldProps.invalid, fieldProps.errorText);

  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const [query, setQuery] = useState("");
  const { contains } = useFilter({ sensitivity: "base" });

  const collection = useMemo(
    () =>
      createListCollection<FieldOption>({
        items: query
          ? options.filter((o) => contains(o.label, query) || (o.description ? contains(o.description, query) : false))
          : options,
        itemToString: (o) => o.label,
        itemToValue: (o) => o.value,
        isItemDisabled: (o) => Boolean(o.disabled),
      }),
    [options, query, contains],
  );

  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const remove = (v: string) => setSelected(selected.filter((s) => s !== v));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && query === "" && selected.length > 0) {
      setSelected(selected.slice(0, -1));
    }
  };

  return (
    <FormField {...fieldProps}>
      <Combobox.Root
        multiple
        collection={collection}
        value={selected}
        onValueChange={(d) => setSelected(d.value)}
        inputValue={query}
        onInputValueChange={(d) => setQuery(d.inputValue)}
        closeOnSelect={false}
        selectionBehavior="clear"
        openOnClick
        name={name}
        positioning={{ sameWidth: true, gutter: 4, ...positioning }}
        width="full"
      >
        <Combobox.Control
          css={controlFrameStyles}
          data-invalid={invalid ? "" : undefined}
          data-disabled={fieldProps.disabled ? "" : undefined}
          flexWrap="wrap"
          alignItems="center"
          gap="1"
          py="1"
          px="2"
        >
          {selected.map((v) => (
            <Tag.Root
              key={v}
              size="lg"
              h="7"
              ps="2.5"
              pe="0.5"
              gap="0.5"
              borderRadius="full"
              bg="primary.subtle"
              color="fg.heading"
              textStyle="label"
              boxShadow="none"
            >
              <Tag.Label>{labelOf(v)}</Tag.Label>
              <Tag.EndElement ms="0" me="0" w="auto" h="auto" minW="0">
                <Tag.CloseTrigger
                  aria-label={`Remover ${labelOf(v)}`}
                  boxSize="5"
                  css={{ "& svg": { width: "12px", height: "12px" } }}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  color="fg.heading"
                  _hover={{ bg: "green.200" }}
                  focusVisibleRing="inside"
                  disabled={fieldProps.disabled}
                  onClick={() => remove(v)}
                >
                  <X size={12} strokeWidth={1.75} aria-hidden="true" />
                </Tag.CloseTrigger>
              </Tag.EndElement>
            </Tag.Root>
          ))}
          <Combobox.Input
            unstyled
            placeholder={selected.length === 0 ? placeholder : undefined}
            onKeyDown={handleKeyDown}
            flex="1 1 60px"
            minW="60px"
            h="7"
            px="1"
            bg="transparent"
            color="fg"
            textStyle="body"
            outline="none"
            _placeholder={{ color: "fg.muted" }}
          />
        </Combobox.Control>
        <Portal disabled={!portalled}>
          <Combobox.Positioner>
            <Combobox.Content css={listContentStyles}>
              <Combobox.Empty px="2.5" py="2" textStyle="body.sm" color="fg.muted">
                {emptyText}
              </Combobox.Empty>
              {collection.items.map((option) => (
                <Combobox.Item
                  key={option.value}
                  item={option}
                  css={{
                    ...listItemStyles,
                    "&[data-state=checked]": { bg: "transparent", _highlighted: { bg: "bg.hover" } },
                    "& .fruti-check": checkboxBoxStyles,
                    "& .fruti-check svg": { opacity: 0 },
                    "&[data-state=checked] .fruti-check": { bg: "primary", borderColor: "primary" },
                    "&[data-state=checked] .fruti-check svg": { opacity: 1 },
                  }}
                >
                  <chakra.span className="fruti-check" aria-hidden="true">
                    <Check size={12} strokeWidth={3} />
                  </chakra.span>
                  <chakra.span flex="1" minW="0" display="flex" flexDirection="column">
                    <Combobox.ItemText textStyle="body.sm" color="fg">
                      {option.label}
                    </Combobox.ItemText>
                    {option.description && (
                      <chakra.span textStyle="caption" fontWeight="normal" color="fg.muted">
                        {option.description}
                      </chakra.span>
                    )}
                  </chakra.span>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </FormField>
  );
}
