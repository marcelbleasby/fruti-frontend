"use client";

import { Box, Portal, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import type { ReactElement, ReactNode } from "react";

export interface TooltipProps extends Omit<ChakraTooltip.RootProps, "children"> {
  /** Texto do tooltip: só repete o nome do controle, nunca informação essencial. */
  content: ReactNode;
  /** Atalho de teclado exibido ao lado (ex.: "E"). */
  shortcut?: string;
  /** Elemento gatilho (precisa aceitar ref e já ter `aria-label` se for só ícone). */
  children: ReactElement;
  placement?: NonNullable<ChakraTooltip.RootProps["positioning"]>["placement"];
  showArrow?: boolean;
  /** Renderiza fora de um Portal (ex.: dentro de Dialog). */
  portalled?: boolean;
}

/** Tooltip no hover e no foco, após 300 ms (Tooltip.Root). */
export function Tooltip(props: TooltipProps) {
  const {
    content,
    shortcut,
    children,
    placement = "top",
    showArrow = true,
    portalled = true,
    openDelay = 300,
    closeDelay = 100,
    positioning,
    disabled,
    ...rootProps
  } = props;

  if (disabled) return children;

  return (
    <ChakraTooltip.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      positioning={{ placement, ...positioning }}
      {...rootProps}
    >
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal disabled={!portalled}>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content
            display="inline-flex"
            alignItems="center"
            gap="2"
            px="2.5"
            py="1.5"
            borderRadius="l2"
            bg="bg.inverted"
            color="fg.inverted"
            textStyle="label"
            whiteSpace="nowrap"
            boxShadow="md"
            css={{ "--tooltip-bg": "colors.bg.inverted" }}
          >
            {showArrow && (
              <ChakraTooltip.Arrow css={{ "--arrow-size": "12px" }}>
                <ChakraTooltip.ArrowTip />
              </ChakraTooltip.Arrow>
            )}
            {content}
            {shortcut && (
              <Box
                as="kbd"
                fontFamily="mono"
                textStyle="code.sm"
                px="1"
                py="0"
                h="5"
                display="inline-flex"
                alignItems="center"
                borderRadius="sm"
                borderWidth="1px"
                borderBottomWidth="2px"
                borderColor="white/35"
                bg="transparent"
                color="fg.inverted"
              >
                {shortcut}
              </Box>
            )}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
}
