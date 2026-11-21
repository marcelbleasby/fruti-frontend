"use client";

import { NumberInput as ChakraNumberInput, chakra } from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { FormField, resolveInvalid } from "./form-field";
import { splitFieldProps } from "./field-utils";
import { controlFrameStyles } from "./styles";
import type { FieldBaseProps } from "./types";

export interface NumberInputValueDetails {
  value: string;
  valueAsNumber: number;
}

export interface NumberInputProps
  extends FieldBaseProps,
    Omit<
      ChakraNumberInput.RootProps,
      keyof FieldBaseProps | "children" | "onValueChange" | "value" | "defaultValue"
    > {
  /** Valor como string (permite estados intermediários ao digitar decimais). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (details: NumberInputValueDetails) => void;
  /** Unidade junto ao valor (ex.: "plantas", "mudas", "ha"). */
  unit?: ReactNode;
  /** Esconde os botões de incremento/decremento. */
  hideStepper?: boolean;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
}

const triggerStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "8",
  flex: "1",
  color: "fg",
  cursor: "pointer",
  _hover: { bg: "bg.hover" },
  _active: { bg: "bg.emphasized" },
  _disabled: { opacity: 0.5, cursor: "not-allowed" },
  focusVisibleRing: "inside",
} as const;

/**
 * NumberInput — NumberInput.Root (min / max / step) com unidade e stepper.
 * Locale pt-BR (vírgula decimal), `inputMode` decimal no celular.
 */
export function NumberInput(props: NumberInputProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const { unit, hideStepper, placeholder, ref, onValueChange, locale = "pt-BR", ...rootProps } = rest;
  const invalid = resolveInvalid(fieldProps.invalid, fieldProps.errorText);

  return (
    <FormField {...fieldProps}>
      <ChakraNumberInput.Root
        unstyled
        locale={locale}
        onValueChange={onValueChange ? (d) => onValueChange({ value: d.value, valueAsNumber: d.valueAsNumber }) : undefined}
        invalid={invalid || undefined}
        css={controlFrameStyles}
        {...rootProps}
      >
        <ChakraNumberInput.Input
          ref={ref}
          unstyled
          placeholder={placeholder}
          flex="1"
          minW="0"
          alignSelf="stretch"
          px="3"
          bg="transparent"
          color="fg"
          textStyle="body"
          outline="none"
          _placeholder={{ color: "fg.muted" }}
          _disabled={{ cursor: "not-allowed", color: "fg.muted" }}
        />
        {unit != null && (
          <chakra.span display="flex" alignItems="center" px="3" textStyle="body.sm" color="fg.muted" borderStartWidth="1px" borderColor="border">
            {unit}
          </chakra.span>
        )}
        {!hideStepper && (
          <ChakraNumberInput.Control unstyled display="flex" flexDirection="column" borderStartWidth="1px" borderColor="border">
            <ChakraNumberInput.IncrementTrigger unstyled aria-label="Aumentar" css={triggerStyles} borderBottomWidth="1px" borderColor="border">
              <ChevronUp size={12} strokeWidth={1.75} />
            </ChakraNumberInput.IncrementTrigger>
            <ChakraNumberInput.DecrementTrigger unstyled aria-label="Diminuir" css={triggerStyles}>
              <ChevronDown size={12} strokeWidth={1.75} />
            </ChakraNumberInput.DecrementTrigger>
          </ChakraNumberInput.Control>
        )}
      </ChakraNumberInput.Root>
    </FormField>
  );
}
