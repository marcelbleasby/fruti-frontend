"use client";

import { Textarea as ChakraTextarea, chakra, mergeRefs, type TextareaProps as ChakraTextareaProps } from "@chakra-ui/react";
import { useState, type ChangeEvent, type Ref, type RefCallback } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import { messageFontSize } from "./styles";
import type { FieldBaseProps } from "./types";

export interface TextareaProps extends FieldBaseProps, Omit<ChakraTextareaProps, keyof FieldBaseProps> {
  /** Mostra o contador "n / maxLength" à direita da ajuda (requer `maxLength`). */
  showCount?: boolean;
  /** Cresce com o conteúdo (padrão: true). */
  autoresize?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

/**
 * Textarea — Field + Textarea com autoresize e contador (aria-live).
 * Controlado (`value`/`onChange`) ou não controlado (`defaultValue`).
 */
export function Textarea(props: TextareaProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const { showCount, autoresize = true, rows = 4, onChange, value, defaultValue, maxLength, ref, ...textareaProps } = rest;

  const [innerLength, setInnerLength] = useState(() => String(defaultValue ?? "").length);
  const length = value !== undefined ? String(value ?? "").length : innerLength;

  // Não controlado via ref (ex.: react-hook-form `register`): o valor inicial
  // chega pelo ref, não por `defaultValue`; lê o tamanho quando o elemento monta.
  const measure: RefCallback<HTMLTextAreaElement> = (el) => {
    if (el && value === undefined) setInnerLength(el.value.length);
  };
  const refWithCount = mergeRefs(ref, measure);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInnerLength(event.target.value.length);
    onChange?.(event);
  };

  const counter =
    showCount && maxLength ? (
      <chakra.span fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted" flex="none" aria-live="polite">
        {length} / {maxLength}
      </chakra.span>
    ) : undefined;

  return (
    <FormField {...fieldProps} helperEnd={counter}>
      <ChakraTextarea
        ref={refWithCount}
        rows={rows}
        autoresize={autoresize}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        py="2"
        px="3"
        lineHeight="1.5rem"
        resize="vertical"
        {...textareaProps}
      />
    </FormField>
  );
}
