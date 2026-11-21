"use client";

import { Box, Tabs as ChakraTabs } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type TabsVariant = "line" | "enclosed";

export interface TabsItem {
  value: string;
  label: ReactNode;
  /** Contagem exibida ao lado do rótulo (só na variante `line`). */
  count?: number;
  disabled?: boolean;
  /** Painel da aba. Omita quando o conteúdo é renderizado fora do componente. */
  content?: ReactNode;
}

export interface TabsProps
  extends Omit<ChakraTabs.RootProps, "variant" | "size" | "children" | "fitted" | "orientation"> {
  items: TabsItem[];
  /** `line` (padrão, com contagens) · `enclosed` (troca de visualização). */
  variant?: TabsVariant;
  /** Rótulo acessível da lista de abas. */
  "aria-label"?: string;
}

const countFormatter = new Intl.NumberFormat("pt-BR");

/**
 * Abas do Fruti. Setas do teclado navegam entre abas (Ark).
 * Na variante `line` a lista rola na horizontal no mobile, com esmaecimento
 * à direita, e a aba ativa é mantida visível.
 */
export function Tabs(props: TabsProps) {
  const { items, variant = "line", "aria-label": ariaLabel, ...rootProps } = props;
  const hasContent = items.some((item) => item.content !== undefined);

  return (
    <ChakraTabs.Root
      variant={variant}
      size="md"
      lazyMount
      unmountOnExit
      {...rootProps}
      css={{ "--tabs-content-padding": "spacing.4" }}
    >
      {variant === "line" ? (
        <LineList items={items} ariaLabel={ariaLabel} />
      ) : (
        <EnclosedList items={items} ariaLabel={ariaLabel} />
      )}
      {hasContent &&
        items.map((item) =>
          item.content !== undefined ? (
            <ChakraTabs.Content key={item.value} value={item.value}>
              {item.content}
            </ChakraTabs.Content>
          ) : null,
        )}
    </ChakraTabs.Root>
  );
}

interface ListProps {
  items: TabsItem[];
  ariaLabel?: string;
}

function LineList({ items, ariaLabel }: ListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [fadeEnd, setFadeEnd] = useState(false);

  const updateFade = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setFadeEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    updateFade();
    const observer = new ResizeObserver(updateFade);
    observer.observe(el);
    // Mantém a aba ativa visível quando a seleção muda.
    const mutation = new MutationObserver(() => {
      const selected = el.querySelector<HTMLElement>("[aria-selected=true]");
      selected?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    mutation.observe(el, { subtree: true, attributeFilter: ["aria-selected"] });
    el.querySelector<HTMLElement>("[aria-selected=true]")?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [updateFade]);

  return (
    <Box position="relative">
      <ChakraTabs.List
        ref={listRef}
        aria-label={ariaLabel}
        onScroll={updateFade}
        gap="1"
        borderBottomWidth="0"
        boxShadow="inset 0 -1px 0 {colors.border}"
        overflowX="auto"
        flexWrap="nowrap"
        scrollbarWidth="none"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        {items.map((item) => (
          <ChakraTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            flexShrink={0}
            h="auto"
            minH="11"
            px="3"
            gap="1.5"
            textStyle="body.sm"
            fontWeight="500"
            color="fg.muted"
            whiteSpace="nowrap"
            _hover={{ color: "fg.heading" }}
            _selected={{
              color: "fg.heading",
              fontWeight: "600",
              "--indicator-offset-y": "0px",
              "--indicator-color": "colors.primary",
            }}
            css={{
              "&[aria-selected=true] [data-count]": { bg: "primary.subtle", color: "fg.heading" },
            }}
            _focusVisible={{ outlineOffset: "-2px", borderRadius: "l2" }}
          >
            {item.label}
            {item.count !== undefined && (
              <Box
                as="span"
                data-count=""
                px="2"
                borderRadius="full"
                textStyle="caption"
                fontWeight="600"
                lineHeight="1.25rem"
                bg="bg.muted"
                color="slate.700"
              >
                {countFormatter.format(item.count)}
              </Box>
            )}
          </ChakraTabs.Trigger>
        ))}
      </ChakraTabs.List>
      {fadeEnd && (
        <Box
          aria-hidden="true"
          pointerEvents="none"
          position="absolute"
          top="0"
          bottom="1px"
          insetEnd="0"
          w="12"
          bgGradient="to-r"
          gradientFrom="bg.panel/0"
          gradientTo="bg.panel"
        />
      )}
    </Box>
  );
}

function EnclosedList({ items, ariaLabel }: ListProps) {
  return (
    <ChakraTabs.List
      aria-label={ariaLabel}
      display="inline-flex"
      gap="1"
      p="1"
      bg="bg.muted"
      borderRadius="l3"
      minH="auto"
    >
      {items.map((item) => (
        <ChakraTabs.Trigger
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          h="auto"
          minH="9"
          px="3.5"
          textStyle="body.sm"
          fontWeight="500"
          color="fg.muted"
          borderRadius="l2"
          _hover={{ color: "fg.heading" }}
          _selected={{ bg: "bg.panel", color: "fg.heading", fontWeight: "600", boxShadow: "xs" }}
        >
          {item.label}
        </ChakraTabs.Trigger>
      ))}
    </ChakraTabs.List>
  );
}
