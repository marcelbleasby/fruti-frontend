import { chakra, type HTMLChakraProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

/**
 * Peças tipográficas compartilhadas pelos componentes de domínio.
 * Todas usam os papéis do tema (`textStyle`), nunca px soltos:
 *
 *   título de página ......... heading.xl (h1) · heading.lg (h2)
 *   título de seção/painel ... heading.md
 *   título de card ........... heading.sm
 *   corpo / meta ............. body.sm (16) · caption (12)
 *   códigos (A-03, PL-0042) .. code (16) · code.sm (12, em linhas de metadado)
 *   números de destaque ...... MetricValue (heading.lg / heading.md)
 */

/** Nível semântico dos títulos — mesmo contrato do design system. */
export { type HeadingLevel, nextHeadingLevel } from "@/components/data-display/heading-level";

export interface RecordCodeProps extends Omit<HTMLChakraProps<"span">, "children"> {
  children: string;
  /** md (padrão): 16px, ao lado de texto 16px · sm: 12px, em linhas de metadado. */
  size?: "md" | "sm";
}

/** Código de registro (A-03, PL-0042, LM-2026-014) em Fira Code, sem ligaduras. */
export function RecordCode({ children, size = "md", color = "fg.muted", ...rest }: RecordCodeProps) {
  return (
    <chakra.span textStyle={size === "sm" ? "code.sm" : "code"} color={color} {...rest}>
      {children}
    </chakra.span>
  );
}

export interface MetricValueProps extends Omit<HTMLChakraProps<"span">, "children"> {
  value: ReactNode;
  unit?: ReactNode;
  /** lg: 24px (destaque do card) · md: 20px (estatísticas em grade). */
  size?: "lg" | "md";
}

/** Número de destaque com unidade menor e esmaecida (2,4 ha · 480 plantas). */
export function MetricValue({ value, unit, size = "lg", color = "fg.heading", ...rest }: MetricValueProps) {
  return (
    <chakra.span
      textStyle={size === "lg" ? "heading.lg" : "heading.md"}
      fontWeight="700"
      color={color}
      whiteSpace="nowrap"
      css={{ fontVariantNumeric: "tabular-nums" }}
      {...rest}
    >
      {value}
      {unit != null && (
        <>
          {" "}
          <chakra.span textStyle="label" color="fg.muted">
            {unit}
          </chakra.span>
        </>
      )}
    </chakra.span>
  );
}
