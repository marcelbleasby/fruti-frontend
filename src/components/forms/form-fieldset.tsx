"use client";

import { Fieldset, chakra, type FieldsetRootProps } from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { resolveInvalid } from "./form-field";
import { messageFontSize } from "./styles";

export interface FormFieldsetProps extends Omit<FieldsetRootProps, "children"> {
  /** Legenda do grupo (14 px, semibold, verde-escuro). */
  legend?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  required?: boolean;
  /** Esconde a legenda visualmente (continua acessível). */
  hideLegend?: boolean;
  children: ReactNode;
  /** Espaço entre os filhos do conteúdo (padrão "2.5"). */
  contentGap?: FieldsetRootProps["gap"];
}

/**
 * FormFieldset — fieldset + legend para grupos de opções ou seções de formulário.
 * Propaga `disabled`/`invalid` aos controles de grupo (CheckboxGroup lê o contexto).
 */
export function FormFieldset(props: FormFieldsetProps) {
  const { legend, helperText, errorText, required, hideLegend, children, invalid, contentGap = "2.5", ...rootProps } =
    props;
  const isInvalid = resolveInvalid(invalid, errorText);

  return (
    <Fieldset.Root invalid={isInvalid} gap="2.5" minW="0" {...rootProps}>
      {legend != null && (
        <Fieldset.Legend srOnly={hideLegend} textStyle="body.sm" fontWeight="600" color="fg.heading" mb="0">
          {legend}
          {required && (
            <chakra.span color="danger" aria-hidden="true">
              {" *"}
            </chakra.span>
          )}
        </Fieldset.Legend>
      )}
      {helperText != null && (
        <Fieldset.HelperText fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted" mt="-1">
          {helperText}
        </Fieldset.HelperText>
      )}
      <Fieldset.Content gap={contentGap} mt="0">
        {children}
      </Fieldset.Content>
      {isInvalid && errorText != null && (
        <Fieldset.ErrorText display="flex" alignItems="flex-start" gap="1.5" fontSize={messageFontSize} lineHeight="1.5rem" fontWeight="normal" color="fg.error">
          <chakra.span display="flex" mt="1" flex="none" aria-hidden="true">
            <CircleAlert size={16} strokeWidth={1.75} />
          </chakra.span>
          <span>{errorText}</span>
        </Fieldset.ErrorText>
      )}
    </Fieldset.Root>
  );
}
