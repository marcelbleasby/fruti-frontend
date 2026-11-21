"use client";

import { RadioGroup as ChakraRadioGroup, chakra, type SystemStyleObject } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FormFieldset, type FormFieldsetProps } from "./form-fieldset";
import { resolveInvalid } from "./form-field";
import { messageFontSize } from "./styles";
import type { FieldOption } from "./types";

/** Círculo 20 px, borda 2 px; marcado = borda verde + ponto. Centrado numa faixa de 24 px (1ª linha do rótulo). */
export const radioControlStyles: SystemStyleObject = {
  boxSize: "5",
  borderWidth: "2px",
  borderColor: "border.control",
  bg: "bg.panel",
  color: "primary",
  _checked: { bg: "bg.panel", borderColor: "primary", color: "primary" },
  "& .dot": { scale: "0.5" },
  _focusVisible: { outline: "2px solid", outlineColor: "focusRing", outlineOffset: "2px" },
  _invalid: { borderColor: "border.error" },
  _disabled: {
    opacity: 1,
    bg: "bg.muted",
    borderColor: "border.disabled",
    color: "border.disabled",
    cursor: "not-allowed",
  },
};

export interface RadioOption extends FieldOption {
  /** Conteúdo extra à direita do texto (badge, valor…). */
  extra?: ReactNode;
}

export interface RadioGroupProps
  extends Omit<FormFieldsetProps, "children" | "defaultValue" | "onChange" | "legend"> {
  label?: FormFieldsetProps["legend"];
  options: RadioOption[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  name?: string;
  readOnly?: boolean;
  orientation?: "vertical" | "horizontal";
}

/**
 * RadioGroup — fieldset + legend + RadioGroup.Root (vertical por padrão).
 * Cada opção pode ter descrição; toda a linha é área de clique.
 */
export function RadioGroup(props: RadioGroupProps) {
  const {
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    orientation = "vertical",
    disabled,
    readOnly,
    invalid,
    errorText,
    ...fieldsetProps
  } = props;
  const isInvalid = resolveInvalid(invalid, errorText);

  return (
    <FormFieldset legend={label} disabled={disabled} invalid={isInvalid} errorText={errorText} {...fieldsetProps}>
      <ChakraRadioGroup.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        invalid={isInvalid || undefined}
        orientation={orientation}
        display="flex"
        flexDirection={orientation === "horizontal" ? "row" : "column"}
        flexWrap="wrap"
        gap={orientation === "horizontal" ? "5" : "3"}
      >
        {options.map((option) => (
          <ChakraRadioGroup.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            alignItems="flex-start"
            gap="3"
            minH="6"
            cursor="pointer"
            _disabled={{ cursor: "not-allowed" }}
          >
            <ChakraRadioGroup.ItemHiddenInput />
            <chakra.span display="flex" alignItems="center" h="6" flex="none">
              <ChakraRadioGroup.ItemIndicator css={radioControlStyles} />
            </chakra.span>
            <chakra.span display="flex" flexDirection="column" flex="1" minW="0">
              <ChakraRadioGroup.ItemText textStyle="body.sm" color="fg" _disabled={{ color: "fg.muted" }}>
                {option.label}
              </ChakraRadioGroup.ItemText>
              {option.description && (
                <chakra.span fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted">
                  {option.description}
                </chakra.span>
              )}
            </chakra.span>
            {option.extra}
          </ChakraRadioGroup.Item>
        ))}
      </ChakraRadioGroup.Root>
    </FormFieldset>
  );
}
