"use client";

import { Drawer as ChakraDrawer, IconButton, Portal, Stack, Text, useBreakpointValue, type StackProps } from "@chakra-ui/react";
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
 *
 * Espaçamento (board "Navegação" do DS): cabeçalho 14/16 px e rodapé 12/16 px,
 * ambos com linha `border`; o corpo tem 16 px nas laterais e 12 px em cima e
 * embaixo, para o conteúdo não encostar nessas linhas. Conteúdo em blocos:
 * use `DrawerSection`.
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
            <ChakraDrawer.Body px="4" py="3" textStyle="body.sm" color="fg">
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

export interface DrawerSectionProps extends Omit<StackProps, "title"> {
  /** Título do bloco (ex.: "Status", "Origem"). */
  title?: ReactNode;
}

/**
 * Bloco do corpo do Drawer, como no DS: 12 px acima e abaixo, 8 px entre o
 * título e o conteúdo e uma linha `green.100` (mais suave que a do cabeçalho e
 * do rodapé) separando um bloco do próximo. O primeiro bloco não repete o
 * respiro de cima, que já vem do corpo do Drawer.
 */
export function DrawerSection({ title, children, ...rest }: DrawerSectionProps) {
  return (
    <Stack
      as="section"
      gap="2"
      py="3"
      borderBottomWidth="1px"
      borderColor="green.100"
      _first={{ pt: "0" }}
      {...rest}
    >
      {title && (
        <Text as="h5" m="0" textStyle="label" fontWeight="600" color="fg.heading">
          {title}
        </Text>
      )}
      {children}
    </Stack>
  );
}
