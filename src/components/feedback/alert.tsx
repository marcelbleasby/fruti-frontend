"use client";

import { Alert as ChakraAlert, Button, CloseButton, Icon, type AlertRootProps } from "@chakra-ui/react";
import type { ElementType, ReactNode } from "react";
import { feedbackStatusStyles, type FeedbackStatus } from "./status-config";

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface AlertProps extends Omit<AlertRootProps, "status" | "title" | "variant"> {
  status?: FeedbackStatus;
  title: ReactNode;
  description?: ReactNode;
  action?: AlertAction;
  /** Conteúdo extra abaixo da descrição (ex.: lista de links para campos). */
  children?: ReactNode;
  /** Ícone alternativo ao do status. */
  icon?: ElementType;
  /** Quando informado, mostra o botão fechar. */
  onClose?: () => void;
  closeLabel?: string;
}

/**
 * Alert do DS — contexto que precisa ficar visível na página.
 * Toast é para resultado de ação; SystemBanner para o sistema inteiro.
 */
export function Alert({
  status = "info",
  title,
  description,
  action,
  children,
  icon,
  onClose,
  closeLabel = "Fechar aviso",
  ...rest
}: AlertProps) {
  const style = feedbackStatusStyles[status];

  return (
    <ChakraAlert.Root
      status={status}
      variant="surface"
      role={style.role}
      colorPalette={style.colorPalette}
      bg={style.surfaceBg}
      color={style.surfaceFg}
      borderWidth="1px"
      borderColor={style.surfaceBorder}
      shadow="none"
      borderRadius="l3"
      gap="3"
      px="4"
      py="3.5"
      alignItems="flex-start"
      {...rest}
    >
      <ChakraAlert.Indicator color="currentColor" boxSize="5" mt="0.5">
        <Icon as={icon ?? style.icon} strokeWidth={1.75} aria-hidden />
      </ChakraAlert.Indicator>
      <ChakraAlert.Content gap="0.5" minW="0">
        <ChakraAlert.Title fontSize="sm" fontWeight="600">
          {title}
        </ChakraAlert.Title>
        {description && (
          <ChakraAlert.Description textStyle="body.sm">
            {description}
          </ChakraAlert.Description>
        )}
        {children}
      </ChakraAlert.Content>
      {action && (
        <Button
          size="sm"
          variant="outline"
          flex="none"
          alignSelf="center"
          minH="9"
          borderColor="currentColor"
          color="currentColor"
          bg="transparent"
          _hover={{ bg: "blackAlpha.50" }}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {onClose && (
        <CloseButton size="sm" flex="none" color="currentColor" aria-label={closeLabel} onClick={onClose} />
      )}
    </ChakraAlert.Root>
  );
}
