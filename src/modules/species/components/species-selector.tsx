"use client";

import { Button, Combobox, Portal, chakra, createListCollection, useFilter, type ComboboxRootProps } from "@chakra-ui/react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { HighlightText } from "@/components/data-display/mark";
import { splitFieldProps } from "@/components/forms/field-utils";
import { FormField, resolveInvalid } from "@/components/forms/form-field";
import { controlFrameStyles, listContentStyles, listItemStyles } from "@/components/forms/styles";
import type { FieldBaseProps } from "@/components/forms/types";
import { plural } from "@/modules/format";
import type { Species, SpeciesId } from "@/modules/types";

export interface SpeciesSelectorProps extends FieldBaseProps {
  /** Catálogo global de espécies. */
  species: Species[];
  value?: SpeciesId | null;
  onChange?: (value: SpeciesId | null, species: Species | undefined) => void;
  /** Mostra "Cadastrar espécie" quando a busca não encontra nada (exige `onCreate`). */
  allowCreate?: boolean;
  /** Recebe o texto buscado, para pré-preencher o cadastro. */
  onCreate?: (query: string) => void;
  placeholder?: string;
  name?: string;
  /** Renderiza a lista em Portal (padrão: true). */
  portalled?: boolean;
  positioning?: ComboboxRootProps["positioning"];
}

function cultivarCountLabel(count: number | undefined): string | null {
  if (count == null) return null;
  return count === 0 ? "sem cultivos" : plural(count, "cultivo", "cultivos");
}

/**
 * SpeciesSelector — Combobox de espécie. Busca por nome popular ou científico,
 * com o nome científico sempre visível para desambiguar.
 * Chakra v3: Combobox.Root · Combobox.Input · Combobox.Content · Combobox.Empty.
 */
export function SpeciesSelector(props: SpeciesSelectorProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    species,
    value,
    onChange,
    allowCreate,
    onCreate,
    placeholder = "Buscar espécie",
    name,
    portalled = true,
    positioning,
  } = rest;
  const invalid = resolveInvalid(fieldProps.invalid, fieldProps.errorText);
  const [query, setQuery] = useState("");
  const { contains } = useFilter({ sensitivity: "base" });

  const collection = useMemo(
    () =>
      createListCollection<Species>({
        items: query
          ? species.filter((s) => contains(s.name, query) || contains(s.scientificName, query))
          : species,
        itemToString: (s) => s.name,
        itemToValue: (s) => s.id,
      }),
    [species, query, contains],
  );

  const showCreate = Boolean(allowCreate && onCreate);

  return (
    <FormField {...fieldProps}>
      <Combobox.Root
        collection={collection}
        value={value === undefined ? undefined : value ? [value] : []}
        defaultInputValue={species.find((s) => s.id === value)?.name ?? ""}
        onValueChange={(d) => {
          const id = d.value[0] ?? null;
          onChange?.(id, species.find((s) => s.id === id));
        }}
        onInputValueChange={(d) => setQuery(d.reason === "input-change" ? d.inputValue : "")}
        openOnClick
        name={name}
        disabled={fieldProps.disabled}
        readOnly={fieldProps.readOnly}
        invalid={invalid}
        required={fieldProps.required}
        positioning={{ sameWidth: true, gutter: 4, ...positioning }}
        width="full"
      >
        <Combobox.Control
          css={controlFrameStyles}
          data-invalid={invalid ? "" : undefined}
          data-disabled={fieldProps.disabled ? "" : undefined}
          position="relative"
          alignItems="center"
          h="10"
          boxSizing="border-box"
        >
          <chakra.span position="absolute" insetStart="3" color="fg.muted" display="flex" pointerEvents="none" aria-hidden="true">
            <Search size={20} strokeWidth={1.75} />
          </chakra.span>
          <Combobox.Input
            unstyled
            placeholder={placeholder}
            flex="1"
            minW="0"
            h="full"
            ps="10"
            pe="11"
            textOverflow="ellipsis"
            bg="transparent"
            color="fg"
            textStyle="body"
            outline="none"
            _placeholder={{ color: "fg.muted" }}
          />
          <Combobox.IndicatorGroup position="absolute" insetEnd="1">
            <Combobox.Trigger color="fg.muted" aria-label="Mostrar espécies" display="flex" p="1.5">
              <ChevronDown size={20} strokeWidth={1.75} />
            </Combobox.Trigger>
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal disabled={!portalled}>
          <Combobox.Positioner>
            <Combobox.Content css={listContentStyles}>
              <Combobox.Empty
                role="status"
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                gap="2"
                p="2.5"
                textStyle="body.sm"
                color="fg.muted"
              >
                {query ? `Nenhuma espécie encontrada para “${query}”.` : "Nenhuma espécie cadastrada."}
                {showCreate && (
                  <Button size="sm" variant="subtle" onClick={() => onCreate?.(query)}>
                    <Plus strokeWidth={1.75} aria-hidden="true" />
                    Cadastrar espécie
                  </Button>
                )}
              </Combobox.Empty>
              {collection.items.map((s) => {
                const countLabel = cultivarCountLabel(s.cultivarCount);
                return (
                  <Combobox.Item
                    key={s.id}
                    item={s}
                    css={{ ...listItemStyles, minH: "11", justifyContent: "space-between" }}
                  >
                    <chakra.span flex="1" minW="0" display="flex" flexDirection="column">
                      <Combobox.ItemText textStyle="body.sm" color="fg">
                        {query ? <HighlightText query={query}>{s.name}</HighlightText> : s.name}
                      </Combobox.ItemText>
                      <chakra.span textStyle="caption" fontWeight="400" fontStyle="italic" color="fg.muted">
                        {s.scientificName}
                      </chakra.span>
                    </chakra.span>
                    {countLabel && (
                      <chakra.span textStyle="caption" color="fg.muted" whiteSpace="nowrap">
                        {countLabel}
                      </chakra.span>
                    )}
                  </Combobox.Item>
                );
              })}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </FormField>
  );
}
