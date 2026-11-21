"use client";

import { IconButton, Input, InputGroup, useControllableState, type InputProps } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import type { Ref } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import type { FieldBaseProps } from "./types";

export interface PasswordInputProps extends FieldBaseProps, Omit<InputProps, keyof FieldBaseProps | "type" | "size"> {
  /** Senha visível (controlado). */
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** aria-label do botão quando a senha está oculta. */
  showPasswordLabel?: string;
  /** aria-label do botão quando a senha está visível. */
  hidePasswordLabel?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * PasswordInput — Field + Input com botão mostrar/ocultar (aria-pressed).
 * Permite colar e gerenciador de senhas (autocomplete padrão `current-password`).
 */
export function PasswordInput(props: PasswordInputProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    visible,
    defaultVisible = false,
    onVisibleChange,
    showPasswordLabel = "Mostrar senha",
    hidePasswordLabel = "Ocultar senha",
    autoComplete = "current-password",
    ...inputProps
  } = rest;

  const [isVisible, setVisible] = useControllableState({
    value: visible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  });

  return (
    <FormField {...fieldProps}>
      <InputGroup
        endElementProps={{ px: "0.5" }}
        endElement={
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            w="11"
            h="9"
            color="fg.muted"
            aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={isVisible}
            disabled={fieldProps.disabled}
            onClick={() => setVisible((v) => !v)}
          >
            {isVisible ? <EyeOff strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
          </IconButton>
        }
      >
        <Input type={isVisible ? "text" : "password"} autoComplete={autoComplete} pe="12" {...inputProps} />
      </InputGroup>
    </FormField>
  );
}
