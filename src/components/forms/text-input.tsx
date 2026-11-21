"use client";

import { Input, InputGroup, type InputElementProps, type InputProps } from "@chakra-ui/react";
import { cloneElement, type ReactElement, type ReactNode, type Ref } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import type { FieldBaseProps } from "./types";

/** Estilo do addon (prefixo/sufixo encostado): fundo do app, borda de controle. */
export const inputAddonProps = {
  bg: "bg",
  color: "fg.muted",
  borderColor: "border.control",
  textStyle: "body.sm",
  px: "3",
} as const;

export interface InputAdornmentProps {
  /** Elemento dentro do campo, à esquerda (ícone de busca…). */
  startElement?: ReactNode;
  /** Elemento dentro do campo, à direita (atalho, botão…). */
  endElement?: ReactNode;
  /** Addon encostado à esquerda (ex.: "LM-"). */
  startAddon?: ReactNode;
  /** Addon encostado à direita (ex.: "m", "ha"). */
  endAddon?: ReactNode;
  /** Unidade dentro do campo, à direita, em texto suave (ex.: "m"). Atalho para `endElement`. */
  unit?: ReactNode;
}

export interface TextInputProps
  extends FieldBaseProps,
    InputAdornmentProps,
    Omit<InputProps, keyof FieldBaseProps | "size"> {
  size?: "md" | "lg";
  ref?: Ref<HTMLInputElement>;
}

/** Envolve um input com os elementos/addons do InputGroup, quando houver. */
export function withAdornments(input: ReactElement<InputElementProps>, adornments: InputAdornmentProps) {
  const { startElement, endElement, startAddon, endAddon, unit } = adornments;
  const end = endElement ?? unit;
  if (!startElement && !end && !startAddon && !endAddon) return input;

  const elementProps = {
    startElement,
    endElement: end,
    startElementProps: { color: "fg.muted" },
    endElementProps: unit && !endElement ? { color: "fg.muted", textStyle: "body.sm" } : undefined,
  } as const;

  // Addon + elemento no mesmo lado: o InputGroup do Chakra posiciona o elemento
  // sobre o addon. Dois grupos aninhados: addons por fora, elementos por dentro.
  if ((startElement || end) && (startAddon || endAddon)) {
    const inner = cloneElement(input, {
      borderStartRadius: startAddon ? "0" : undefined,
      borderEndRadius: endAddon ? "0" : undefined,
    } as Partial<InputElementProps>);
    return (
      <InputGroup
        startAddon={startAddon}
        endAddon={endAddon}
        startAddonProps={inputAddonProps}
        endAddonProps={inputAddonProps}
      >
        <InputGroup flex="1" minW="0" {...elementProps}>
          {inner}
        </InputGroup>
      </InputGroup>
    );
  }

  return (
    <InputGroup
      startElement={startElement}
      endElement={end}
      startAddon={startAddon}
      endAddon={endAddon}
      startElementProps={{ color: "fg.muted" }}
      endElementProps={unit && !endElement ? { color: "fg.muted", textStyle: "body.sm" } : undefined}
      startAddonProps={inputAddonProps}
      endAddonProps={inputAddonProps}
    >
      {input}
    </InputGroup>
  );
}

/**
 * TextInput — Field + Input (receita do tema: 40 px, borda de controle, halo no foco).
 * Aceita elementos/addons do InputGroup e unidade. Controlado (`value`/`onChange`)
 * ou não controlado (`defaultValue`, `ref` para react-hook-form).
 */
export function TextInput(props: TextInputProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const { startElement, endElement, startAddon, endAddon, unit, size = "md", ...inputProps } = rest;

  return (
    <FormField {...fieldProps}>
      {withAdornments(<Input size={size} {...inputProps} />, {
        startElement,
        endElement,
        startAddon,
        endAddon,
        unit,
      })}
    </FormField>
  );
}
