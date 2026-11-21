"use client";

import { Box, Float, Icon, IconButton, type IconButtonProps } from "@chakra-ui/react";
import { Bell } from "lucide-react";
import type { Ref } from "react";

export interface NotificationBellProps extends Omit<IconButtonProps, "children" | "aria-label"> {
  /** Quantidade de notificações não lidas. */
  count?: number;
  /** Acima deste valor o selo mostra "N+". */
  max?: number;
  /** Rótulo base do botão; a contagem é acrescentada ao nome acessível. */
  label?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Sino do AppHeader com contador de não lidas.
 * A contagem vai no nome acessível do botão, não só no selo vermelho.
 */
export function NotificationBell({
  count = 0,
  max = 9,
  label = "Notificações",
  ref,
  ...rest
}: NotificationBellProps) {
  const display = count > max ? `${max}+` : String(count);
  const accessibleName = count > 0 ? `${label}, ${display} não lidas` : label;

  return (
    <IconButton
      ref={ref}
      aria-label={accessibleName}
      aria-haspopup="dialog"
      variant="outline"
      position="relative"
      boxSize="11"
      minW="11"
      borderRadius="l3"
      borderColor="border"
      bg="bg.panel"
      color="fg.heading"
      _hover={{ bg: "bg.hover" }}
      focusVisibleRing="outside"
      {...rest}
    >
      <Icon as={Bell} boxSize="5" strokeWidth={1.75} aria-hidden />
      {count > 0 && (
        <Float placement="top-end" offsetX="3" offsetY="3">
          <Box
            as="span"
            aria-hidden
            minW="5"
            h="5"
            px="1"
            borderRadius="full"
            bg="danger"
            color="fg.inverted"
            fontSize="xs"
            fontWeight="600"
            lineHeight="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="bg.panel"
          >
            {display}
          </Box>
        </Float>
      )}
    </IconButton>
  );
}
