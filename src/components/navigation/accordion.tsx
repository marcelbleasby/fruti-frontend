"use client";

import { Accordion as ChakraAccordion, Heading } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface AccordionItem {
  value: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps
  extends Omit<ChakraAccordion.RootProps, "children" | "variant" | "size"> {
  items: AccordionItem[];
  /** Nível do título que envolve cada gatilho. */
  headingLevel?: "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * Seções de um formulário ou detalhe longo (Accordion.Root `multiple`).
 * Várias podem ficar abertas ao mesmo tempo.
 */
export function Accordion(props: AccordionProps) {
  const { items, headingLevel = "h4", multiple = true, collapsible = true, ...rootProps } = props;

  return (
    <ChakraAccordion.Root
      multiple={multiple}
      collapsible={collapsible}
      variant="plain"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="2xl"
      px="3.5"
      py="1"
      {...rootProps}
    >
      {items.map((item) => (
        <ChakraAccordion.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          borderBottomWidth="1px"
          borderColor="primary.subtle"
          _last={{ borderBottomWidth: "0" }}
        >
          <Heading as={headingLevel} m="0" fontSize="inherit" lineHeight="inherit">
            <ChakraAccordion.ItemTrigger
              minH="12"
              px="1"
              py="0"
              gap="2"
              justifyContent="space-between"
              fontSize="md"
              fontWeight="600"
              color="fg.heading"
              cursor="pointer"
              focusVisibleRing="inside"
            >
              {item.title}
              <ChakraAccordion.ItemIndicator color="fg.muted" display="flex" css={{ "& svg": { width: "20px", height: "20px" } }}>
                <ChevronDown size={20} strokeWidth={1.75} aria-hidden />
              </ChakraAccordion.ItemIndicator>
            </ChakraAccordion.ItemTrigger>
          </Heading>
          <ChakraAccordion.ItemContent>
            <ChakraAccordion.ItemBody px="1" pt="0" pb="3.5" textStyle="body.sm" color="fg">
              {item.content}
            </ChakraAccordion.ItemBody>
          </ChakraAccordion.ItemContent>
        </ChakraAccordion.Item>
      ))}
    </ChakraAccordion.Root>
  );
}
