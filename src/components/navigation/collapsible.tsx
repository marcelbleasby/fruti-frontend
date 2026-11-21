"use client";

import { Box, Collapsible as ChakraCollapsible, type BoxProps } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface CollapsibleProps extends Omit<ChakraCollapsible.RootProps, "children"> {
  /** Rótulo do gatilho fechado (ex.: "Mostrar filtros avançados"). */
  label: string;
  /** Rótulo do gatilho aberto (ex.: "Ocultar filtros avançados"). Padrão: `label`. */
  openLabel?: string;
  children: ReactNode;
  /** Estilos extras do bloco de conteúdo. */
  contentProps?: BoxProps;
}

/** Um único bloco que abre e fecha (Collapsible.Root). */
export function Collapsible(props: CollapsibleProps) {
  const { label, openLabel, children, contentProps, ...rootProps } = props;

  return (
    <ChakraCollapsible.Root display="flex" flexDirection="column" gap="2.5" {...rootProps}>
      <ChakraCollapsible.Context>
        {({ open }) => (
          <ChakraCollapsible.Trigger
            alignSelf="flex-start"
            display="inline-flex"
            alignItems="center"
            gap="1.5"
            minH={{ base: "11", md: "9" }}
            p="0"
            bg="transparent"
            textStyle="body.sm"
            fontWeight="600"
            color="primary"
            cursor="pointer"
            borderRadius="l1"
            focusVisibleRing="outside"
            _hover={{ color: "primary.hover" }}
          >
            <Box
              as="span"
              display="flex"
              transition="rotate 0.2s"
              rotate={open ? "180deg" : "0deg"}
            >
              <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
            </Box>
            {open ? (openLabel ?? label) : label}
          </ChakraCollapsible.Trigger>
        )}
      </ChakraCollapsible.Context>
      <ChakraCollapsible.Content>
        <Box
          display="flex"
          flexDirection="column"
          gap="1.5"
          p="3"
          borderRadius="l3"
          bg="bg"
          textStyle="body.sm"
          color="fg"
          {...contentProps}
        >
          {children}
        </Box>
      </ChakraCollapsible.Content>
    </ChakraCollapsible.Root>
  );
}
