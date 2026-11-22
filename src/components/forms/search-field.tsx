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
  type InputElementProps,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import { useMemo, useRef, useState, type ReactElement, type ReactNode, type Ref } from "react";
import { DEBOUNCE_BUSCA_MS, useDebouncedCallback } from "@/hooks";
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
  /**
   * Termo inicial (ex.: o `?busca=` da URL). Se mudar por fora para um termo
   * diferente do último buscado — chip removido, "Limpar filtros", voltar no
   * navegador —, o campo passa a mostrar o novo valor. Quando a mudança é o
   * eco da própria busca, o que a pessoa está digitando não é sobrescrito.
   */
  defaultValue?: string;
  /** Mudança imediata do texto (para controle). */
  onValueChange?: (value: string) => void;
  /**
   * Busca com debounce (padrão 300 ms) a partir do que o usuário digita, com o
   * termo já sem espaços nas pontas e só quando ele muda ("manga" e "manga "
   * não buscam duas vezes). Limpar (×, Esc ou apagar tudo) e Enter buscam na
   * hora. Mudar `value`/`defaultValue` por fora não dispara: quem mudou já sabe.
   */
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
 * SearchField — o campo de busca do DS (board "Componentes compartilhados"):
 * Input · InputGroup · CloseButton · Spinner, 40 px, lupa de 16 px à esquerda,
 * "×" para limpar (o nativo do navegador fica escondido), debounce de 300 ms
 * (`useDebouncedCallback`) e, com `results`, lista com o termo destacado.
 * Em listas, vai no slot `search` do `PageToolbar`.
 */
export function SearchField(props: SearchFieldProps) {
  const {
    label = "Buscar",
    showLabel,
    value,
    defaultValue,
    onValueChange,
    onSearch,
    debounceMs = DEBOUNCE_BUSCA_MS,
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

  const [internal, setInternal] = useState(defaultValue ?? "");
  const query = value ?? internal;
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Último termo entregue a `onSearch` (já sem espaços nas pontas).
  const [lastSearched, setLastSearched] = useState((value ?? defaultValue ?? "").trim());

  const dispatch = (q: string) => {
    const term = q.trim();
    if (term === lastSearched) return;
    setLastSearched(term);
    onSearch?.(term);
  };
  const search = useDebouncedCallback(dispatch, debounceMs);

  // `defaultValue` mudou por fora (ver a prop): adota se não for o eco da última busca.
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (defaultValue !== prevDefault) {
    setPrevDefault(defaultValue);
    const external = (defaultValue ?? "").trim();
    if (value === undefined && external !== lastSearched) {
      search.cancel();
      setInternal(defaultValue ?? "");
      setLastSearched(external);
    }
  }

  /** Texto mudou pelo usuário: atualiza na hora e agenda a busca (vazio busca já). */
  const changeQuery = (next: string) => {
    if (next === query) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    if (next.trim() === "") {
      search.cancel();
      dispatch("");
    } else {
      search(next);
    }
  };

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const clear = () => {
    changeQuery("");
    inputRef.current?.focus();
  };

  const startElement = loading ? (
    <Spinner size="sm" color="fg.muted" aria-label="Carregando" />
  ) : (
    <Search size={16} strokeWidth={1.75} aria-hidden="true" />
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
    enterKeyHint: "search" as const,
    autoComplete: "off",
    placeholder,
    name,
    // O "×" é o CloseButton do DS; o nativo do type=search ficaria duplicado.
    css: { "&::-webkit-search-cancel-button": { display: "none" } },
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
        {group(
          <Input
            ref={setRefs}
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search.flush();
              if (e.key === "Escape" && query) {
                e.preventDefault();
                changeQuery("");
              }
            }}
            {...inputCommon}
          />,
        )}
      </FormField>
    );
  }

  const count = results.length;

  return (
    <FormField {...fieldShell}>
      <Combobox.Root
        collection={collection}
        inputValue={query}
        onInputValueChange={(d) => changeQuery(d.inputValue)}
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
