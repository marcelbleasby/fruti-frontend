"use client";

import {
  Button,
  Dialog as ChakraDialog,
  IconButton,
  Portal,
  useControllableState,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { useRef, useState, type ReactElement, type ReactNode } from "react";

export type ConfirmActionTone = "danger" | "default";

export interface ConfirmActionDialogProps {
  /** Pergunta direta (ex.: "Encerrar PL-0042?"). */
  title: ReactNode;
  /** Consequência da ação (ex.: "As 480 plantas saem dos indicadores…"). */
  description?: ReactNode;
  /** Diz exatamente o que acontece (ex.: "Encerrar plantio"). */
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` (padrão, botão vermelho) · `default` (botão verde). */
  tone?: ConfirmActionTone;
  /**
   * Executada ao confirmar. Se retornar uma Promise, o botão mostra carregamento
   * e o diálogo fecha quando ela resolve; se rejeitar, o diálogo continua aberto
   * (trate o erro dentro da função, ex.: com um toast).
   */
  onConfirm: () => void | Promise<void>;
  /** Força o estado de carregamento (ex.: mutação controlada fora do componente). */
  loading?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Elemento que abre o diálogo. */
  trigger?: ReactElement;
  closeLabel?: string;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4";
}

/**
 * Confirmação de ação (destrutiva por padrão). Foco inicial em Cancelar; Esc fecha.
 * Durante o carregamento não é possível fechar nem cancelar.
 */
export function ConfirmActionDialog(props: ConfirmActionDialogProps) {
  const {
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancelar",
    tone = "danger",
    onConfirm,
    loading = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    trigger,
    closeLabel = "Fechar",
    headingAs = "h3",
  } = props;

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [pending, setPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const busy = loading || pending;

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Mantém o diálogo aberto; o chamador é responsável por exibir o erro.
    } finally {
      setPending(false);
    }
  }

  return (
    <ChakraDialog.Root
      role="alertdialog"
      placement="center"
      open={open}
      onOpenChange={(details) => {
        if (!busy) setOpen(details.open);
      }}
      closeOnEscape={!busy}
      closeOnInteractOutside={!busy}
      initialFocusEl={() => cancelRef.current}
    >
      {trigger && <ChakraDialog.Trigger asChild>{trigger}</ChakraDialog.Trigger>}
      <Portal>
        <ChakraDialog.Backdrop bg="green.900/55" />
        <ChakraDialog.Positioner px="4">
          <ChakraDialog.Content maxW="360px" borderRadius="l3" boxShadow="lg">
            <ChakraDialog.Header
              pt="4.5"
              px="4.5"
              pb="0"
              justifyContent="space-between"
              alignItems="flex-start"
              gap="2"
            >
              <ChakraDialog.Title
                as={headingAs}
                m="0"
                textStyle="heading.md"
                color="fg.heading"
              >
                {title}
              </ChakraDialog.Title>
              <ChakraDialog.CloseTrigger asChild position="static" disabled={busy}>
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
              </ChakraDialog.CloseTrigger>
            </ChakraDialog.Header>
            {description && (
              <ChakraDialog.Body pt="2" px="4.5" pb="4.5">
                <ChakraDialog.Description m="0" textStyle="body.sm" color="fg">
                  {description}
                </ChakraDialog.Description>
              </ChakraDialog.Body>
            )}
            <ChakraDialog.Footer
              mt={description ? "0" : "4.5"}
              px="4.5"
              py="3"
              borderTopWidth="1px"
              borderColor="primary.subtle"
              justifyContent="flex-end"
              gap="2"
            >
              <ChakraDialog.ActionTrigger asChild>
                <Button ref={cancelRef} variant="outline" size="md" disabled={busy}>
                  {cancelLabel}
                </Button>
              </ChakraDialog.ActionTrigger>
              <Button
                variant="solid"
                size="md"
                colorPalette={tone === "danger" ? "red" : "green"}
                loading={busy}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </ChakraDialog.Footer>
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
}
