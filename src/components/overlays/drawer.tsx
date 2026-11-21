"use client";

import { Drawer as ChakraDrawer, IconButton, Portal, useBreakpointValue } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { BottomSheet } from "./bottom-sheet";

export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps
  extends Omit<ChakraDrawer.RootProps, "children" | "placement" | "size"> {
  title: ReactNode;
  children: ReactNode;
  /** Ações no rodapé. Ex.: "Limpar" (ghost) à esquerda e "Ver 9 plantios" (solid) à direita. */
  footer?: ReactNode;
  /** Elemento que abre o drawer (envolvido em Drawer.Trigger). */
  trigger?: ReactElement;
  /** Lateral do drawer. Padrão `end` (direita). */
  placement?: "start" | "end";
  /** sm 320px (padrão) · md 448px · lg 672px. */
  size?: DrawerSize;
  closeLabel?: string;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4" | "h5";
  /** Abaixo de `md` vira BottomSheet. */
  bottomSheetOnMobile?: boolean;
}

const chakraSize = { sm: "xs", md: "sm", lg: "lg" } as const;

/**
 * Drawer lateral (Drawer.Root placement=end · size sm). Prende o foco e devolve
 * ao gatilho ao fechar.
 */
export function Drawer(props: DrawerProps) {
  const {
    title,
    children,
    footer,
    trigger,
    placement = "end",
    size = "sm",
    closeLabel = "Fechar",
    headingAs = "h4",
    bottomSheetOnMobile = false,
    ...rootProps
  } = props;

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  if (bottomSheetOnMobile && isMobile) {
    return (
      <BottomSheet
        title={title}
        footer={footer}
        trigger={trigger}
        closeLabel={closeLabel}
        headingAs={headingAs}
        {...rootProps}
      >
        {children}
      </BottomSheet>
    );
  }

  return (
    <ChakraDrawer.Root placement={placement} size={chakraSize[size]} {...rootProps}>
      {trigger && <ChakraDrawer.Trigger asChild>{trigger}</ChakraDrawer.Trigger>}
      <Portal>
        <ChakraDrawer.Backdrop bg="green.900/35" />
        <ChakraDrawer.Positioner>
          <ChakraDrawer.Content boxShadow="lg" bg="bg.panel">
            <ChakraDrawer.Header
              px="4"
              py="3.5"
              borderBottomWidth="1px"
              borderColor="border"
              justifyContent="space-between"
            >
              <ChakraDrawer.Title
                as={headingAs}
                m="0"
                textStyle="heading.md"
                color="fg.heading"
              >
                {title}
              </ChakraDrawer.Title>
              <ChakraDrawer.CloseTrigger asChild position="static">
                <IconButton
                  aria-label={closeLabel}
                  variant="ghost"
                  size="sm"
                  minW="9"
                  w="9"
                  h="9"
                  flex="none"
                  color="fg.muted"
                >
                  <X size={20} strokeWidth={1.75} aria-hidden />
                </IconButton>
              </ChakraDrawer.CloseTrigger>
            </ChakraDrawer.Header>
            <ChakraDrawer.Body px="4" py="0" textStyle="body.sm" color="fg">
              {children}
            </ChakraDrawer.Body>
            {footer && (
              <ChakraDrawer.Footer
                px="4"
                py="3"
                borderTopWidth="1px"
                borderColor="border"
                justifyContent="space-between"
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
