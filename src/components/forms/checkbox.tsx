"use client";

import { Checkbox as ChakraCheckbox, Field, chakra, type SystemStyleObject } from "@chakra-ui/react";
import type { ComponentProps, ReactNode, Ref } from "react";
import { FieldErrorMessage, resolveInvalid } from "./form-field";
import { messageFontSize } from "./styles";

/** Caixa 20 px, borda 2 px de controle, raio 6 px; marcada/parcial em verde primário. */
export const checkboxControlStyles: SystemStyleObject = {
  boxSize: "5",
  p: "0",
  "& svg": { width: "12px", height: "12px" },
  borderWidth: "2px",
  borderColor: "border.control",
  borderRadius: "sm",
  bg: "bg.panel",
  color: "fg.inverted",
  focusVisibleRing: "outside",
  "&:is([data-state=checked], [data-state=indeterminate])": {
    bg: "primary",
    borderColor: "primary",
  },
  _invalid: { borderColor: "border.error" },
  _disabled: {
    opacity: 1,
    bg: "bg.muted",
    borderColor: "border.disabled",
    cursor: "not-allowed",
    "&:is([data-state=checked], [data-state=indeterminate])": {
      bg: "border.disabled",
      borderColor: "border.disabled",
    },
  },
};

export interface CheckboxProps
  extends Omit<ChakraCheckbox.RootProps, "children" | "checked" | "defaultChecked" | "onCheckedChange"> {
  label?: ReactNode;
  /** Linha de apoio abaixo do rótulo (13 px). */
  description?: ReactNode;
  errorText?: ReactNode;
  /** `"indeterminate"` desenha o estado parcial (item pai de grupo). */
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Ref do input oculto (react-hook-form `register`). */
  ref?: Ref<HTMLInputElement>;
  /** Props do input oculto (`onBlur`, `name`…). */
  inputProps?: ComponentProps<typeof ChakraCheckbox.HiddenInput>;
}

/**
 * Checkbox — Checkbox.Root · Control · Label. Toda a linha (caixa + texto) é área
 * de clique (≥ 24 px). Estados: desmarcado, marcado, parcial, foco, inválido, desabilitado.
 */
export function Checkbox(props: CheckboxProps) {
  const { label, description, errorText, checked, defaultChecked, onCheckedChange, ref, inputProps, invalid, ...rootProps } =
    props;
  const isInvalid = resolveInvalid(invalid, errorText);

  const control = (
    <ChakraCheckbox.Root
      alignItems="flex-start"
      gap="3"
      minH="6"
      cursor="pointer"
      _disabled={{ cursor: "not-allowed" }}
      checked={checked}
      defaultChecked={defaultChecked}
      invalid={isInvalid || undefined}
      onCheckedChange={onCheckedChange ? (details) => onCheckedChange(details.checked === true) : undefined}
      {...rootProps}
    >
      <ChakraCheckbox.HiddenInput ref={ref} {...inputProps} />
      {/* Caixa de 20 px centrada numa faixa de 24 px = altura da 1ª linha do rótulo (grade de 4). */}
      <chakra.span display="flex" alignItems="center" h="6" flex="none">
        <ChakraCheckbox.Control css={checkboxControlStyles}>
          <ChakraCheckbox.Indicator />
        </ChakraCheckbox.Control>
      </chakra.span>
      {(label != null || description != null) && (
        <chakra.span display="flex" flexDirection="column">
          {label != null && (
            <ChakraCheckbox.Label textStyle="body.sm" color="fg" _disabled={{ opacity: 1, color: "fg.muted" }}>
              {label}
            </ChakraCheckbox.Label>
          )}
          {description != null && (
            <chakra.span fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted">
              {description}
            </chakra.span>
          )}
        </chakra.span>
      )}
    </ChakraCheckbox.Root>
  );

  if (!isInvalid || errorText == null) return control;

  return (
    <Field.Root invalid gap="1" alignItems="flex-start">
      {control}
      <chakra.div ps="8">
        <FieldErrorMessage>{errorText}</FieldErrorMessage>
      </chakra.div>
    </Field.Root>
  );
}
