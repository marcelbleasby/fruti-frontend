"use client";

import type { InputElementProps } from "@chakra-ui/react";
import type { ReactElement } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import { withAdornments, type InputAdornmentProps } from "./text-input";
import type { FieldBaseProps } from "./types";

export interface InputGroupProps extends FieldBaseProps, InputAdornmentProps {
  /** Um único controle do Chakra (`<Input />`, `<Input asChild>…`) que recebe os addons. */
  children: ReactElement<InputElementProps>;
}

/**
 * InputGroup — Field + InputGroup (InputAddon · InputElement) em volta de um
 * controle próprio. Para o caso comum, prefira `TextInput` com `startAddon`/`endAddon`.
 */
export function InputGroup(props: InputGroupProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const { children, ...adornments } = rest;
  return <FormField {...fieldProps}>{withAdornments(children, adornments)}</FormField>;
}
