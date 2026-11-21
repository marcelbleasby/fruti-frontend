"use client";

import { Field, Switch as ChakraSwitch, chakra } from "@chakra-ui/react";
import { Check } from "lucide-react";
import type { ComponentProps, ReactNode, Ref } from "react";
import { FieldErrorMessage, resolveInvalid } from "./form-field";
import { messageFontSize } from "./styles";

export interface SwitchProps
  extends Omit<ChakraSwitch.RootProps, "children" | "checked" | "defaultChecked" | "onCheckedChange" | "label"> {
  label?: ReactNode;
  /** Linha de apoio abaixo do rótulo. */
  description?: ReactNode;
  errorText?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** `start` (padrão): rótulo à esquerda e chave à direita, linha inteira (≥ 44 px). `end`: chave antes do rótulo. */
  labelPosition?: "start" | "end";
  ref?: Ref<HTMLInputElement>;
  inputProps?: ComponentProps<typeof ChakraSwitch.HiddenInput>;
}

/**
 * Switch — Switch.Root (role=switch), 44 × 26. Aplica na hora (preferências);
 * para escolhas enviadas com um formulário, use Checkbox.
 */
export function Switch(props: SwitchProps) {
  const {
    label,
    description,
    errorText,
    checked,
    defaultChecked,
    onCheckedChange,
    labelPosition = "start",
    ref,
    inputProps,
    invalid,
    ...rootProps
  } = props;
  const isInvalid = resolveInvalid(invalid, errorText);
  const atStart = labelPosition === "start";

  const text =
    label != null || description != null ? (
      <chakra.span display="flex" flexDirection="column" flex={atStart ? "1" : undefined} minW="0">
        {label != null && (
          <ChakraSwitch.Label textStyle="label" color="fg" _disabled={{ opacity: 1, color: "fg.muted" }}>
            {label}
          </ChakraSwitch.Label>
        )}
        {description != null && (
          <chakra.span fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted">
            {description}
          </chakra.span>
        )}
      </chakra.span>
    ) : null;

  const control = (
    <ChakraSwitch.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (details) => onCheckedChange(details.checked) : undefined}
      invalid={isInvalid || undefined}
      display="flex"
      justifyContent={atStart ? "space-between" : "flex-start"}
      alignItems="center"
      gap={atStart ? "4" : "3"}
      minH="11"
      w={atStart ? "full" : undefined}
      cursor="pointer"
      _disabled={{ cursor: "not-allowed" }}
      css={{ "--switch-width": "48px", "--switch-height": "28px" }}
      {...rootProps}
    >
      <ChakraSwitch.HiddenInput ref={ref} {...inputProps} />
      {atStart && text}
      <ChakraSwitch.Control
        p="1"
        bg="slate.500"
        _checked={{ bg: "primary" }}
        _disabled={{ bg: "border.disabled", opacity: 1 }}
        _invalid={{ outlineColor: "border.error" }}
        focusVisibleRing="outside"
      >
        <ChakraSwitch.Thumb
          boxSize="5"
          scale="1"
          bg="bg.panel"
          boxShadow="xs"
          color="primary"
          _checked={{ bg: "bg.panel", translate: "18px 0" }}
          _disabled={{ color: "fg.muted" }}
        >
          <ChakraSwitch.ThumbIndicator display="flex" aria-hidden="true">
            <Check size={12} strokeWidth={2.5} />
          </ChakraSwitch.ThumbIndicator>
        </ChakraSwitch.Thumb>
      </ChakraSwitch.Control>
      {!atStart && text}
    </ChakraSwitch.Root>
  );

  if (!isInvalid || errorText == null) return control;

  return (
    <Field.Root invalid gap="1" alignItems="stretch">
      {control}
      <FieldErrorMessage>{errorText}</FieldErrorMessage>
    </Field.Root>
  );
}
