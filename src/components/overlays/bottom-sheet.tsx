"use client";

import { Box, Drawer as ChakraDrawer, IconButton, Portal } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export interface BottomSheetProps
  extends Omit<ChakraDrawer.RootProps, "children" | "placement" | "size" | "contained"> {
  title: ReactNode;
  children: ReactNode;
  /** Ações no rodapé (ex.: botão principal de largura total). */
  footer?: ReactNode;
  /** Elemento que abre a folha (envolvido em Drawer.Trigger). */
  trigger?: ReactElement;
  /** Alça de arraste no topo (visual). */
  showHandle?: boolean;
  /** Mostra o botão fechar no cabeçalho (Esc e toque fora sempre fecham). */
  showCloseButton?: boolean;
  closeLabel?: string;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4" | "h5";
}

/**
 * Bottom sheet para mobile: Drawer com `placement="bottom"`, cantos arredondados,
 * flutuando 6px das bordas e com alça. Prende o foco e devolve ao gatilho ao fechar.
 */
export function BottomSheet(props: BottomSheetProps) {
  const {
    title,
    children,
    footer,
    trigger,
    showHandle = true,
    showCloseButton = false,
    closeLabel = "Fechar",
    headingAs = "h4",
    ...rootProps
  } = props;

  return (
    <ChakraDrawer.Root placement="bottom" {...rootProps}>
      {trigger && <ChakraDrawer.Trigger asChild>{trigger}</ChakraDrawer.Trigger>}
      <Portal>
        <ChakraDrawer.Backdrop bg="green.900/30" />
        <ChakraDrawer.Positioner p="1.5" pb="calc(6px + env(safe-area-inset-bottom))">
          <ChakraDrawer.Content
            borderRadius="3xl"
            boxShadow="lg"
            maxH="calc(100dvh - 48px)"
            pt="2"
            px="3.5"
            pb="3.5"
            gap="2"
          >
            {showHandle && (
              <Box
                aria-hidden="true"
                alignSelf="center"
                flex="none"
                w="10"
                h="1"
                borderRadius="full"
                bg="border.disabled"
              />
            )}
            <ChakraDrawer.Header p="0" gap="2" justifyContent="space-between">
              <ChakraDrawer.Title
                as={headingAs}
                m="0"
                textStyle="heading.md"
                color="fg.heading"
              >
                {title}
              </ChakraDrawer.Title>
              {showCloseButton && (
                <ChakraDrawer.CloseTrigger asChild position="static">
                  <IconButton aria-label={closeLabel} variant="ghost" size="md" color="fg.muted">
                    <X size={20} strokeWidth={1.75} aria-hidden />
                  </IconButton>
                </ChakraDrawer.CloseTrigger>
              )}
            </ChakraDrawer.Header>
            <ChakraDrawer.Body
              p="0"
              display="flex"
              flexDirection="column"
              gap="2"
              textStyle="body.sm"
              color="fg"
            >
              {children}
            </ChakraDrawer.Body>
            {footer && (
              <ChakraDrawer.Footer
                p="0"
                pt="1"
                display="flex"
                flexDirection="column"
                alignItems="stretch"
                gap="2"
              >
                {footer}
              </ChakraDrawer.Footer>
            )}
          </ChakraDrawer.Content>
        </ChakraDrawer.Positioner>
      </Portal>
    </ChakraDrawer.Root>
  );
}
