"use client";

import { Icon, IconButton, Input, InputGroup, type InputProps } from "@chakra-ui/react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type KeyboardEvent, type Ref } from "react";

export interface AuthPasswordInputProps extends Omit<InputProps, "type"> {
  ref?: Ref<HTMLInputElement>;
  /** Avisado quando o estado do Caps Lock muda enquanto o campo tem foco. */
  onCapsLockChange?: (active: boolean) => void;
}

/** Campo de senha das telas de acesso: cadeado, alternar visibilidade (aria-pressed) e detecção de Caps Lock. */
export function AuthPasswordInput({ ref, onCapsLockChange, onKeyDown, onKeyUp, onBlur, ...rest }: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const checkCaps = (event: KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === "function") onCapsLockChange?.(event.getModifierState("CapsLock"));
  };

  return (
    <InputGroup
      startElement={<Icon as={Lock} boxSize="4" strokeWidth={1.75} color="fg.muted" aria-hidden />}
      endElementProps={{ pe: "0.5" }}
      endElement={
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          w="11"
          h="9"
          color="fg.muted"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon as={visible ? EyeOff : Eye} boxSize="4" strokeWidth={1.75} aria-hidden />
        </IconButton>
      }
    >
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        pe="12"
        onKeyDown={(e) => {
          checkCaps(e);
          onKeyDown?.(e);
        }}
        onKeyUp={(e) => {
          checkCaps(e);
          onKeyUp?.(e);
        }}
        onBlur={(e) => {
          onCapsLockChange?.(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    </InputGroup>
  );
}
