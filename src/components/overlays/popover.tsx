"use client";

import { IconButton, Popover as ChakraPopover, Portal } from "@chakra-ui/react";
import { CircleHelp, X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export interface PopoverProps extends Omit<ChakraPopover.RootProps, "children"> {
  /** Título do popover (vira o nome acessível do diálogo). */
  title: ReactNode;
  /** Conteúdo interativo (links, botões) — informação que não cabe num Tooltip. */
  children: ReactNode;
  /**
   * Gatilho próprio. Padrão: botão circular de ajuda (?) com `triggerLabel`.
   */
  trigger?: ReactElement;
  /** Nome acessível do gatilho padrão (ex.: "O que é densidade?"). */
  triggerLabel?: string;
  placement?: NonNullable<ChakraPopover.RootProps["positioning"]>["placement"];
  showArrow?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4" | "h5";
  /** Largura do conteúdo. */
  width?: string;
  /** Renderiza fora de um Portal (ex.: dentro de Dialog). */
  portalled?: boolean;
}

/** Popover com título, botão fechar e seta (Popover.Root · Popover.Arrow). */
export function Popover(props: PopoverProps) {
  const {
    title,
    children,
    trigger,
    triggerLabel = "Mais informações",
    placement = "bottom-start",
    showArrow = true,
    showCloseButton = true,
    closeLabel = "Fechar",
    headingAs = "h4",
    width = "300px",
    portalled = true,
    positioning,
    ...rootProps
  } = props;

  return (
    <ChakraPopover.Root positioning={{ placement, ...positioning }} {...rootProps}>
      <ChakraPopover.Trigger asChild>
        {trigger ?? (
          <IconButton
            aria-label={triggerLabel}
            size="sm"
            minW="7"
            w="7"
            h="7"
            borderRadius="full"
            bg="primary.subtle"
            color="fg.heading"
            _hover={{ bg: "green.200" }}
          >
            <CircleHelp size={16} strokeWidth={1.75} aria-hidden />
          </IconButton>
        )}
      </ChakraPopover.Trigger>
      <Portal disabled={!portalled}>
        <ChakraPopover.Positioner>
          <ChakraPopover.Content
            css={{ "--popover-size": width }}
            borderWidth="1px"
            borderColor="border"
            borderRadius="2xl"
            boxShadow="lg"
            p="3.5"
            gap="2"
          >
            {showArrow && (
              <ChakraPopover.Arrow>
                <ChakraPopover.ArrowTip borderColor="border" />
              </ChakraPopover.Arrow>
            )}
            <ChakraPopover.Header
              p="0"
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              gap="2"
            >
              <ChakraPopover.Title
                as={headingAs}
                m="0"
                textStyle="heading.sm"
                color="fg.heading"
              >
                {title}
              </ChakraPopover.Title>
              {showCloseButton && (
                <ChakraPopover.CloseTrigger asChild>
                  <IconButton
                    aria-label={closeLabel}
                    variant="ghost"
                    size="sm"
                    minW="7"
                    w="7"
                    h="7"
                    flex="none"
                    color="fg.muted"
                  >
                    <X size={16} strokeWidth={1.75} aria-hidden />
                  </IconButton>
                </ChakraPopover.CloseTrigger>
              )}
            </ChakraPopover.Header>
            <ChakraPopover.Body
              p="0"
              display="flex"
              flexDirection="column"
              gap="2"
              textStyle="body.sm"
              color="fg"
            >
              {children}
            </ChakraPopover.Body>
          </ChakraPopover.Content>
        </ChakraPopover.Positioner>
      </Portal>
    </ChakraPopover.Root>
  );
}
