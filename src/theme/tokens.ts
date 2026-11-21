import { defineTokens } from "@chakra-ui/react";

/** Meios-passos do Chakra arredondados para cima na grade de 4 px. */
const gridHalfSteps = {
  0.5: { value: "0.25rem" }, // 4 (era 2)
  1.5: { value: "0.5rem" }, // 8 (era 6)
  2.5: { value: "0.75rem" }, // 12 (era 10)
  3.5: { value: "1rem" }, // 16 (era 14)
  4.5: { value: "1.25rem" }, // 20 (era 18)
};

/**
 * Tokens base do Fruti (Organic Biophilic + Flat).
 * Fonte: canvas "Fruti — Frontend" › Fundamentos visuais.
 */
export const tokens = defineTokens({
  colors: {
    // Verde terra — substitui a escala `green` padrão do Chakra para que
    // `colorPalette="green"` (padrão do app) siga o design system.
    green: {
      50: { value: "#F0FDF4" },
      100: { value: "#DCFCE7" },
      200: { value: "#BBF7D0" },
      300: { value: "#86EFAC" },
      400: { value: "#4ADE80" },
      500: { value: "#22C55E" },
      600: { value: "#16A34A" },
      700: { value: "#15803D" },
      800: { value: "#166534" },
      900: { value: "#14532D" },
      950: { value: "#0F2A1A" },
    },
    // Neutros esverdeados (superfícies, hovers, divisores suaves)
    sage: {
      50: { value: "#F7FBF8" },
      100: { value: "#F4F7F6" },
      200: { value: "#ECF3EF" },
      300: { value: "#E8F0F1" },
      400: { value: "#DCE7E2" },
      500: { value: "#D5E2DE" },
      600: { value: "#6B8F7A" },
      700: { value: "#1F3B2B" },
    },
    slate: {
      100: { value: "#F1F5F9" },
      300: { value: "#CBD5E1" },
      400: { value: "#94A3B8" },
      500: { value: "#64748B" },
      // Texto terciário: ≥4.5:1 sobre todas as superfícies claras (inclui sage.400).
      550: { value: "#566375" },
      600: { value: "#475569" },
      700: { value: "#334155" },
      800: { value: "#1E293B" },
    },
    // Ouro de colheita (accent)
    harvest: {
      50: { value: "#FFFBEB" },
      100: { value: "#FEF3C7" },
      200: { value: "#FDE68A" },
      300: { value: "#FCD34D" },
      400: { value: "#FED7AA" },
      700: { value: "#A16207" },
      900: { value: "#78350F" },
    },
    red: {
      50: { value: "#FEF2F2" },
      100: { value: "#FEE2E2" },
      200: { value: "#FECACA" },
      300: { value: "#FCA5A5" },
      700: { value: "#B91C1C" },
      800: { value: "#991B1B" },
    },
    sky: {
      50: { value: "#F0F9FF" },
      100: { value: "#E0F2FE" },
      300: { value: "#7DD3FC" },
      800: { value: "#075985" },
    },
  },
  /**
   * Escala tipográfica — só múltiplos de 4 (rem: acompanha a fonte do usuário).
   * 12 · 16 · 20 · 24 · 28 · 32 · 40. Os nomes `sm` e `lg` continuam existindo
   * (receitas nativas do Chakra os usam), mas apontam para 16 e 20:
   * nenhum texto sai da grade, nem dentro dos componentes do Chakra.
   */
  fontSizes: {
    "2xs": { value: "0.75rem" }, // 12
    xs: { value: "0.75rem" }, // 12
    sm: { value: "1rem" }, // 16 (era 14)
    md: { value: "1rem" }, // 16
    lg: { value: "1.25rem" }, // 20 (era 18)
    xl: { value: "1.25rem" }, // 20
    "2xl": { value: "1.5rem" }, // 24
    "3xl": { value: "1.75rem" }, // 28
    "4xl": { value: "2rem" }, // 32
    "5xl": { value: "2.5rem" }, // 40
  },
  /**
   * Grade de 4 px: os meios-passos do Chakra (0.5 · 1.5 · 2.5 · 3.5 · 4.5 =
   * 2 · 6 · 10 · 14 · 18 px) sobem para o múltiplo de 4 seguinte. O Chakra copia
   * `spacing` em `sizes` na criação, então os dois são sobrescritos.
   */
  spacing: gridHalfSteps,
  sizes: gridHalfSteps,
  fonts: {
    heading: { value: "var(--font-fira-sans), 'Fira Sans', system-ui, sans-serif" },
    body: { value: "var(--font-fira-sans), 'Fira Sans', system-ui, sans-serif" },
    mono: { value: "var(--font-fira-code), 'Fira Code', ui-monospace, monospace" },
  },
  radii: {
    // grade de 4: 4 · 8 · 12 · 16 · 24 · full (2xs/xs e sm/md, lg/xl são aliases)
    "2xs": { value: "4px" },
    xs: { value: "4px" },
    sm: { value: "8px" },
    md: { value: "8px" },
    lg: { value: "12px" },
    xl: { value: "12px" },
    "2xl": { value: "16px" },
    "3xl": { value: "24px" },
    full: { value: "9999px" },
  },
  shadows: {
    xs: { value: "0 1px 2px rgba(20,83,45,0.06), 0 1px 3px rgba(20,83,45,0.08)" },
    sm: { value: "0 4px 6px rgba(20,83,45,0.05)" },
    md: { value: "0 6px 20px rgba(20,83,45,0.14)" },
    lg: { value: "0 12px 32px rgba(20,83,45,0.16)" },
    glass: {
      value:
        "0 10px 30px rgba(20,83,45,0.18), 0 2px 6px rgba(20,83,45,0.08), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(20,83,45,0.08)",
    },
    glassPrimary: {
      value:
        "0 10px 30px rgba(20,83,45,0.30), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.12)",
    },
  },
  durations: {
    fast: { value: "150ms" },
  },
});
