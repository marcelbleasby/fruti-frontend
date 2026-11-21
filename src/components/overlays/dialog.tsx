"use client";

import { Dialog as ChakraDialog, IconButton, Portal } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps extends Omit<ChakraDialog.RootProps, "children" | "size"> {
  title: ReactNode;
  /** Linha de apoio sob o título (ex.: "PL-0042 · Manga Tommy Atkins"). */
  subtitle?: ReactNode;
  /** Corpo do diálogo. */
  children?: ReactNode;
  /** Ações no rodapé, alinhadas à direita (Cancelar outline + principal solid). */
  footer?: ReactNode;
  /** Elemento que abre o diálogo (envolvido em Dialog.Trigger). */
  trigger?: ReactElement;
  /**
   * sm 360px (confirmação) · md 460px (formulário curto, padrão) · lg 672px (conteúdo).
   * No mobile, md e lg ocupam a tela toda.
   */
  size?: DialogSize;
  showCloseButton?: boolean;
  closeLabel?: string;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4" | "h5";
}

const maxW: Record<DialogSize, string> = { sm: "360px", md: "460px", lg: "2xl" };

/**
 * Diálogo padrão (Dialog.Root) com cabeçalho, corpo e rodapé.
 * O foco vai para o primeiro campo do corpo (o botão fechar fica no fim da
 * ordem de tabulação) e volta ao gatilho ao fechar. Nunca abra um Dialog sobre outro.
 */
export function Dialog(props: DialogProps) {
  const {
    title,
    subtitle,
    children,
    footer,
    trigger,
    size = "md",
    showCloseButton = true,
    closeLabel = "Fechar",
    headingAs = "h4",
    ...rootProps
  } = props;

  const fullOnMobile = size !== "sm";

  return (
    <ChakraDialog.Root placement="center" scrollBehavior="inside" {...rootProps}>
      {trigger && <ChakraDialog.Trigger asChild>{trigger}</ChakraDialog.Trigger>}
      <Portal>
        <ChakraDialog.Backdrop bg="green.900/45" />
        <ChakraDialog.Positioner px={fullOnMobile ? { base: "0", md: "4" } : "4"}>
          <ChakraDialog.Content
            maxW={fullOnMobile ? { base: "100dvw", md: maxW[size] } : maxW[size]}
            minH={fullOnMobile ? { base: "100dvh", md: "auto" } : undefined}
            maxH={fullOnMobile ? { base: "100dvh", md: "calc(100% - 7.5rem)" } : undefined}
            my={fullOnMobile ? { base: "0", md: "auto" } : "auto"}
            borderRadius={fullOnMobile ? { base: "0", md: "l3" } : "l3"}
            boxShadow="lg"
          >
            <ChakraDialog.Header
              pt="4"
              px="4.5"
              pb="0"
              pe={showCloseButton ? "16" : "4.5"}
              flexDirection="column"
              gap="0.5"
            >
              <ChakraDialog.Title
                as={headingAs}
                m="0"
                textStyle="heading.md"
                color="fg.heading"
              >
                {title}
              </ChakraDialog.Title>
              {subtitle && (
                <ChakraDialog.Description textStyle="body.sm" color="fg.muted">
                  {subtitle}
                </ChakraDialog.Description>
              )}
            </ChakraDialog.Header>
            <ChakraDialog.Body px="4.5" py="3.5" textStyle="body.sm" color="fg">
              {children}
            </ChakraDialog.Body>
            {footer && (
              <ChakraDialog.Footer
                px="4.5"
                py="3"
                borderTopWidth="1px"
                borderColor="primary.subtle"
                justifyContent="flex-end"
                gap="2"
              >
                {footer}
              </ChakraDialog.Footer>
            )}
            {showCloseButton && (
              <ChakraDialog.CloseTrigger asChild top="4" insetEnd="4">
                <IconButton
                  aria-label={closeLabel}
                  variant="ghost"
                  size="sm"
                  minW="9"
                  w="9"
                  h="9"
                  color="fg.muted"
                >
                  <X size={20} strokeWidth={1.75} aria-hidden />
                </IconButton>
              </ChakraDialog.CloseTrigger>
            )}
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
}
