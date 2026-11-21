"use client";

import { NativeSelect, type NativeSelectFieldProps as ChakraNativeSelectFieldProps } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import { errorRing } from "./styles";
import type { FieldBaseProps, FieldOption } from "./types";

export interface NativeSelectFieldProps
  extends FieldBaseProps,
    Omit<ChakraNativeSelectFieldProps, keyof FieldBaseProps | "children"> {
  options?: FieldOption[];
  /** Primeira opção vazia (ex.: "Selecione…"). */
  placeholder?: string;
  /** Alternativa a `options` (ex.: `<optgroup>`). */
  children?: ReactNode;
  ref?: Ref<HTMLSelectElement>;
}

/**
 * NativeSelectField — Field + NativeSelect (select do sistema, ideal no mobile
 * e para listas curtas). Mesmo visual do Input.
 */
export function NativeSelectField(props: NativeSelectFieldProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const { options, placeholder, children, ...selectProps } = rest;

  return (
    <FormField {...fieldProps}>
      <NativeSelect.Root size="md" disabled={fieldProps.disabled}>
        <NativeSelect.Field
          placeholder={placeholder}
          h="10"
          ps="3"
          pe="9"
          bg="bg.panel"
          color="fg"
          textStyle="body"
          borderColor="border.control"
          borderRadius="l2"
          focusVisibleRing="outside"
          _invalid={{ borderColor: "border.error", boxShadow: errorRing }}
          _disabled={{ layerStyle: "disabled", opacity: 1 }}
          {...selectProps}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </NativeSelect.Field>
        <NativeSelect.Indicator color="fg.muted">
          <ChevronDown strokeWidth={1.75} />
        </NativeSelect.Indicator>
      </NativeSelect.Root>
    </FormField>
  );
}
