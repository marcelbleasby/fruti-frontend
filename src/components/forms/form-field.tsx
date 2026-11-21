"use client";

import { Box, Field, Flex, chakra } from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { messageFontSize } from "./styles";
import type { FieldBaseProps } from "./types";

export interface FormFieldProps extends FieldBaseProps {
  children: ReactNode;
  /** Conteúdo à direita da linha de ajuda (ex.: contador de caracteres). */
  helperEnd?: ReactNode;
}

/** `invalid` explícito ou presença de `errorText`. */
export function resolveInvalid(invalid?: boolean, errorText?: ReactNode): boolean {
  return Boolean(invalid) || (errorText != null && errorText !== false && errorText !== "");
}

/** Conteúdo do rótulo: texto + `*` obrigatório ou "(opcional)". */
export function FieldLabelContent({
  label,
  required,
  optional,
}: Pick<FieldBaseProps, "label" | "required" | "optional">) {
  return (
    <>
      {label}
      {required ? (
        <Field.RequiredIndicator color="danger" />
      ) : optional ? (
        <chakra.span fontWeight="normal" color="fg.muted">
          (opcional)
        </chakra.span>
      ) : null}
    </>
  );
}

/** Mensagem de erro com ícone (além da cor), ligada ao controle pelo Field. */
export function FieldErrorMessage({ children }: { children: ReactNode }) {
  return (
    <Field.ErrorText
      alignItems="flex-start"
      gap="2"
      fontSize={messageFontSize}
      lineHeight="1.5rem"
      fontWeight="normal"
      color="fg.error"
    >
      <chakra.span display="flex" mt="1" flex="none" aria-hidden="true">
        <CircleAlert size={16} strokeWidth={1.75} />
      </chakra.span>
      <span>{children}</span>
    </Field.ErrorText>
  );
}

/**
 * FormField — Field.Root + Label + HelperText + ErrorText (com ícone).
 * Envolve qualquer controle; o Field liga rótulo, ajuda e erro por aria.
 * Vertical é o padrão (sempre no mobile); horizontal vira grade 140px | 1fr a partir de `md`.
 */
export function FormField(props: FormFieldProps) {
  const {
    label,
    helperText,
    errorText,
    required,
    invalid,
    disabled,
    readOnly,
    optional,
    hideLabel,
    orientation = "vertical",
    id,
    fieldProps,
    children,
    helperEnd,
  } = props;

  const isInvalid = resolveInvalid(invalid, errorText);
  const horizontal = orientation === "horizontal";
  const showError = isInvalid && errorText != null && errorText !== false && errorText !== "";
  const hasMessages = showError || helperText != null || helperEnd != null;
  const col2 = horizontal ? { md: "2" } : undefined;

  return (
    <Field.Root
      ids={id ? { control: id } : undefined}
      required={required}
      disabled={disabled}
      invalid={isInvalid}
      readOnly={readOnly}
      gap="1.5"
      alignItems="stretch"
      {...(horizontal && {
        display: { base: "flex", md: "grid" },
        gridTemplateColumns: "var(--field-label-width, 140px) minmax(0, 1fr)",
        columnGap: "3.5",
        rowGap: "1.5",
        alignItems: { base: "stretch", md: "center" },
      })}
      {...fieldProps}
    >
      {label != null && (
        <Field.Label
          srOnly={hideLabel}
          textStyle="label"
          color="fg"
          _disabled={{ opacity: 1 }}
          {...(horizontal && {
            justifyContent: { md: "flex-end" },
            textAlign: { md: "end" },
          })}
        >
          <FieldLabelContent label={label} required={required} optional={optional} />
        </Field.Label>
      )}

      {horizontal ? (
        <Box gridColumn={col2} minW="0">
          {children}
        </Box>
      ) : (
        children
      )}

      {hasMessages && (
        <Flex gridColumn={col2} justify="space-between" align="flex-start" gap="3">
          {showError ? (
            <FieldErrorMessage>{errorText}</FieldErrorMessage>
          ) : helperText != null ? (
            <Field.HelperText fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted">
              {helperText}
            </Field.HelperText>
          ) : (
            <span />
          )}
          {helperEnd}
        </Flex>
      )}
    </Field.Root>
  );
}
