import { defineTextStyles } from "@chakra-ui/react";

/**
 * Papéis tipográficos do DS — Fira Sans (títulos/corpo) e Fira Code (códigos).
 * Grade de 4: tamanhos 12 · 16 · 20 · 24 · 28 · 32 · 40 e alturas de linha
 * fixas, também múltiplas de 4 (rem, para acompanhar a fonte do usuário).
 *
 * Hierarquia por tamanho E peso (não só cor):
 *   700 — display, heading.xl/lg, números de destaque
 *   600 — heading.md/sm, botões, rótulos de destaque
 *   500 — label, caption, overline
 *   400 — body, body.sm
 * `body.sm` e `label` têm 16px como `body`: diferenciam-se pelo papel (cor, peso),
 * não pelo tamanho — o menor texto de leitura do app é 16px.
 */
export const textStyles = defineTextStyles({
  "display.lg": {
    value: { fontFamily: "heading", fontWeight: "700", fontSize: "5xl", lineHeight: "3rem", fontVariantNumeric: "tabular-nums" }, // 40/48
  },
  display: {
    value: { fontFamily: "heading", fontWeight: "700", fontSize: "4xl", lineHeight: "2.5rem" }, // 32/40
  },
  "heading.xl": {
    value: { fontFamily: "heading", fontWeight: "700", fontSize: "3xl", lineHeight: "2.25rem" }, // 28/36
  },
  "heading.lg": {
    value: { fontFamily: "heading", fontWeight: "700", fontSize: "2xl", lineHeight: "2rem" }, // 24/32
  },
  "heading.md": {
    value: { fontFamily: "heading", fontWeight: "600", fontSize: "xl", lineHeight: "1.75rem" }, // 20/28
  },
  "heading.sm": {
    value: { fontFamily: "heading", fontWeight: "600", fontSize: "md", lineHeight: "1.5rem" }, // 16/24
  },
  body: {
    value: { fontFamily: "body", fontWeight: "400", fontSize: "md", lineHeight: "1.5rem" }, // 16/24
  },
  "body.sm": {
    value: { fontFamily: "body", fontWeight: "400", fontSize: "md", lineHeight: "1.5rem" }, // 16/24 (era 14/20)
  },
  /** Rótulos de campo, itens de menu, valores em listas. */
  label: {
    value: { fontFamily: "body", fontWeight: "500", fontSize: "md", lineHeight: "1.5rem" }, // 16/24
  },
  /** Metadados, legendas, badges e contadores — nunca corpo de texto. */
  caption: {
    value: { fontFamily: "body", fontWeight: "500", fontSize: "xs", lineHeight: "1rem" }, // 12/16
  },
  /** Rótulo de grupo/seção em caixa alta (ex.: "DOMÍNIO AGRÍCOLA"). */
  overline: {
    value: {
      fontFamily: "body",
      fontWeight: "600",
      fontSize: "xs",
      lineHeight: "1rem",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }, // 12/16
  },
  code: {
    value: { fontFamily: "mono", fontWeight: "500", fontSize: "md", lineHeight: "1.5rem", fontVariantLigatures: "none" }, // 16/24
  },
  "code.sm": {
    value: { fontFamily: "mono", fontWeight: "500", fontSize: "xs", lineHeight: "1rem", fontVariantLigatures: "none" }, // 12/16
  },
});
