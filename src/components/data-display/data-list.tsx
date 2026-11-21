import { DataList as ChakraDataList, List } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";

export interface DataListItem {
  label: ReactNode;
  value: ReactNode;
  /** Chave estável; padrão: índice. */
  key?: string;
}

export interface DataListProps extends Omit<ChakraDataList.RootProps, "children" | "variant" | "size"> {
  items: DataListItem[];
  /** Largura mínima de cada par antes de quebrar linha. Padrão 90px. */
  minItemWidth?: string;
  /** Valor exibido quando `value` é vazio. Padrão "—". */
  emptyValue?: ReactNode;
}

const isEmpty = (v: ReactNode) => v === null || v === undefined || v === "";

/**
 * DataList — pares rótulo (16px, fg.muted) / valor (16px/500) que fluem em linha e quebram.
 * Chakra v3: DataList.Root · DataList.Item · DataList.ItemLabel · DataList.ItemValue.
 */
export const DataList = forwardRef<HTMLDListElement, DataListProps>(function DataList(
  { items, minItemWidth = "88px", emptyValue = "—", ...rest },
  ref,
) {
  return (
    <ChakraDataList.Root
      ref={ref}
      orientation="vertical"
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      columnGap="5"
      rowGap="3.5"
      {...rest}
    >
      {items.map((item, i) => (
        <ChakraDataList.Item key={item.key ?? i} flex={`1 1 ${minItemWidth}`} minW="0" gap="0.5">
          <ChakraDataList.ItemLabel fontSize="sm" color="fg.muted" fontWeight="400" minW="0">
            {item.label}
          </ChakraDataList.ItemLabel>
          <ChakraDataList.ItemValue display="block" fontSize="sm" fontWeight="500" color="fg" overflowWrap="break-word">
            {isEmpty(item.value) ? emptyValue : item.value}
          </ChakraDataList.ItemValue>
        </ChakraDataList.Item>
      ))}
    </ChakraDataList.Root>
  );
});

export interface TextListProps extends Omit<List.RootProps, "children" | "as"> {
  items: ReactNode[];
  /** Lista numerada (passos) ou com marcadores. Padrão true. */
  ordered?: boolean;
}

/** Lista simples de texto (passos numerados ou marcadores). Chakra v3: List.Root · List.Item. */
export function TextList({ items, ordered = true, ...rest }: TextListProps) {
  return (
    <List.Root as={ordered ? "ol" : "ul"} ps="5" textStyle="body.sm" lineHeight="1.75rem" color="fg" {...rest}>
      {items.map((item, i) => (
        <List.Item key={i}>{item}</List.Item>
      ))}
    </List.Root>
  );
}
