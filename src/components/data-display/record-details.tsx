import { Box, type BoxProps, DataList, Heading, Stack, Text } from "@chakra-ui/react";
import type { HeadingLevel } from "./heading-level";
import { Fragment, type ReactNode } from "react";

export interface RecordDetailsItem {
  label: ReactNode;
  /** Valor; vazio (null/undefined/"") mostra `emptyValue`. */
  value: ReactNode;
  /** Quantas colunas ocupa (ou "full" para a linha inteira). */
  span?: 1 | 2 | 3 | "full";
  key?: string;
}

export interface RecordDetailsSection {
  title?: ReactNode;
  description?: ReactNode;
  items: RecordDetailsItem[];
  key?: string;
}

export interface RecordDetailsProps extends Omit<BoxProps, "children"> {
  /** Pares de uma seção única. Use `sections` para agrupar. */
  items?: RecordDetailsItem[];
  sections?: RecordDetailsSection[];
  /** Colunas a partir de 768px (no celular é sempre 1). Padrão 2. */
  columns?: 1 | 2 | 3;
  /** Texto para valores vazios. Padrão "—". */
  emptyValue?: ReactNode;
  /** card (padrão): superfície branca com borda e sombra xs · none: sem moldura. */
  surface?: "card" | "none";
  /** Nível dos títulos de seção (o tamanho vem do papel). Padrão h3. */
  headingAs?: HeadingLevel;
}

const isEmpty = (v: ReactNode) => v === null || v === undefined || v === "";

function DetailsGrid({
  items,
  columns,
  emptyValue,
}: {
  items: RecordDetailsItem[];
  columns: 1 | 2 | 3;
  emptyValue: ReactNode;
}) {
  return (
    <DataList.Root
      orientation="vertical"
      display="grid"
      gridTemplateColumns={{ base: "minmax(0, 1fr)", md: `repeat(${columns}, minmax(0, 1fr))` }}
      columnGap="5"
      rowGap="3.5"
    >
      {items.map((item, i) => (
        <DataList.Item
          key={item.key ?? i}
          minW="0"
          gap="0.5"
          gridColumn={{
            base: "auto",
            md: item.span === "full" ? "1 / -1" : item.span ? `span ${Math.min(item.span, columns)}` : "auto",
          }}
        >
          <DataList.ItemLabel fontSize="sm" color="fg.muted" fontWeight="400" minW="0">
            {item.label}
          </DataList.ItemLabel>
          <DataList.ItemValue display="block" fontSize="sm" fontWeight="500" color="fg" overflowWrap="break-word">
            {isEmpty(item.value) ? emptyValue : item.value}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}

/**
 * RecordDetails — detalhes de um registro em pares rótulo/valor, opcionalmente em seções.
 * Chakra v3: DataList.Root · DataList.Item · DataList.ItemLabel · DataList.ItemValue.
 */
export function RecordDetails({
  items,
  sections,
  columns = 2,
  emptyValue = "—",
  surface = "card",
  headingAs = "h3",
  ...rest
}: RecordDetailsProps) {
  const all: RecordDetailsSection[] = sections ?? [{ items: items ?? [] }];
  const frame: BoxProps =
    surface === "card"
      ? { bg: "bg.panel", borderWidth: "1px", borderColor: "border", borderRadius: "l3", boxShadow: "xs", p: "4.5" }
      : {};

  return (
    <Box {...frame} {...rest}>
      <Stack gap="5">
        {all.map((section, i) => (
          <Fragment key={section.key ?? i}>
            {i > 0 && <Box as="hr" borderTopWidth="1px" borderColor="green.100" />}
            <Stack as="section" gap="3.5">
              {(section.title || section.description) && (
                <Stack gap="0.5">
                  {section.title && (
                    <Heading as={headingAs} textStyle="heading.sm" color="fg.heading">
                      {section.title}
                    </Heading>
                  )}
                  {section.description && (
                    <Text fontSize="sm" color="fg.muted">
                      {section.description}
                    </Text>
                  )}
                </Stack>
              )}
              <DetailsGrid items={section.items} columns={columns} emptyValue={emptyValue} />
            </Stack>
          </Fragment>
        ))}
      </Stack>
    </Box>
  );
}
