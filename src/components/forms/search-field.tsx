"use client";

import {
  CloseButton,
  Combobox,
  Highlight,
  Input,
  InputGroup,
  Kbd,
  Portal,
  Spinner,
  chakra,
  createListCollection,
  useControllableState,
  type InputElementProps,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, type ReactElement, type ReactNode, type Ref } from "react";
import { FormField } from "./form-field";
import { listContentStyles, listItemStyles, messageFontSize } from "./styles";
import type { FieldBaseProps } from "./types";

export interface SearchResult {
  value: string;
  label: string;
  /** Texto à direita (nome científico, contexto…). */
  description?: ReactNode;
  disabled?: boolean;
}

export interface SearchFieldProps
  extends Pick<FieldBaseProps, "helperText" | "errorText" | "invalid" | "disabled" | "id" | "fieldProps"> {
  /** Rótulo acessível (padrão "Buscar"); escondido visualmente salvo `showLabel`. */
  label?: string;
  showLabel?: boolean;
  value?: string;
  defaultValue?: string;
  /** Mudança imediata do texto (para controle). */
  onValueChange?: (value: string) => void;
  /** Busca com debounce (padrão 300 ms). */
  onSearch?: (value: string) => void;
  debounceMs?: number;
  /** Mostra Spinner no lugar da lupa. */
  loading?: boolean;
  /** Com `results`, vira combobox com lista de resultados. */
  results?: SearchResult[];
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  /** Atalho exibido à direita quando vazio (ex.: "Ctrl K"). */
  shortcut?: string;
  /** Linha final da lista (role=status). Padrão: "n resultado(s)". */
  resultsSummary?: ReactNode;
  emptyText?: string;
  name?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * SearchField — Input · InputGroup · CloseButton · Spinner. Debounce de 300 ms,
 * botão limpar, estado carregando e, com `results`, lista com o termo destacado.
 */
export function SearchField(props: SearchFieldProps) {
  const {
    label = "Buscar",
    showLabel,
    value,
    defaultValue,
    onValueChange,
    onSearch,
    debounceMs = 300,
    loading,
    results,
    onSelect,
    placeholder = "Buscar",
    shortcut,
    resultsSummary,
    emptyText = "Nenhum resultado",
    name,
    ref,
    helperText,
    errorText,
    invalid,
    disabled,
    id,
    fieldProps,
  } = props;

  const [query, setQuery] = useControllableState({ value, defaultValue: defaultValue ?? "", onChange: onValueChange });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onSearchRef = useRef(onSearch);
  const firstRun = useRef(true);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => onSearchRef.current?.(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const startElement = loading ? (
    <Spinner size="sm" color="fg.muted" aria-label="Carregando" />
  ) : (
    <Search size={20} strokeWidth={1.75} aria-hidden="true" />
  );

  const endElement = query ? (
    <CloseButton size="sm" color="fg.muted" aria-label="Limpar busca" onClick={clear} disabled={disabled} />
  ) : shortcut ? (
    <Kbd size="sm" fontFamily="mono" bg="bg.panel" borderColor="border.control" color="fg">
      {shortcut}
    </Kbd>
  ) : undefined;

  const collection = useMemo(
    () =>
      createListCollection<SearchResult>({
        items: results ?? [],
        itemToString: (r) => r.label,
        itemToValue: (r) => r.value,
        isItemDisabled: (r) => Boolean(r.disabled),
      }),
    [results],
  );

  const inputCommon = {
    type: "search" as const,
    placeholder,
    name,
    ps: "10",
    pe: query ? "11" : shortcut ? "16" : "3",
  };

  const group = (input: ReactElement<InputElementProps>) => (
    <InputGroup
      startElement={startElement}
      endElement={endElement}
      endElementProps={{ px: query ? "0.5" : "2.5" }}
    >
      {input}
    </InputGroup>
  );

  const fieldShell = {
    label,
    hideLabel: !showLabel,
    helperText,
    errorText,
    invalid,
    disabled,
    id,
    fieldProps,
  };

  if (results === undefined) {
    return (
      <FormField {...fieldShell}>
        {group(<Input ref={setRefs} value={query} onChange={(e) => setQuery(e.target.value)} {...inputCommon} />)}
      </FormField>
    );
  }

  const count = results.length;

  return (
    <FormField {...fieldShell}>
      <Combobox.Root
        collection={collection}
        inputValue={query}
        onInputValueChange={(d) => setQuery(d.inputValue)}
        onValueChange={(d) => {
          const item = d.items[0];
          if (item) onSelect?.(item);
        }}
        selectionBehavior="preserve"
        positioning={{ sameWidth: true, gutter: 4 }}
        width="full"
      >
        <Combobox.Control>
          {group(
            <Combobox.Input unstyled asChild>
              <Input ref={setRefs} {...inputCommon} />
            </Combobox.Input>,
          )}
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content css={{ ...listContentStyles, borderRadius: "lg" }}>
              {count === 0 && !loading && query && (
                <Combobox.Empty px="2.5" py="2" textStyle="body.sm" color="fg.muted">
                  {emptyText}
                </Combobox.Empty>
              )}
              {results.map((result) => (
                <Combobox.Item
                  key={result.value}
                  item={result}
                  css={{ ...listItemStyles, minH: "auto", py: "2", borderRadius: "sm", justifyContent: "space-between", gap: "2" }}
                >
                  <Combobox.ItemText textStyle="body.sm" color="fg">
                    <Highlight query={query} styles={{ fontWeight: "700", bg: "transparent", color: "inherit" }}>
                      {result.label}
                    </Highlight>
                  </Combobox.ItemText>
                  {result.description != null && (
                    <chakra.span textStyle="body.sm" color="fg.muted" textAlign="end">
                      {result.description}
                    </chakra.span>
                  )}
                </Combobox.Item>
              ))}
              {count > 0 && (
                <chakra.div role="status" px="2.5" py="2" fontSize={messageFontSize} color="fg.muted">
                  {resultsSummary ?? `${count} ${count === 1 ? "resultado" : "resultados"}`}
                </chakra.div>
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </FormField>
  );
}
