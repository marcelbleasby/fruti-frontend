import type { SystemStyleObject } from "@chakra-ui/react";

/**
 * Fallback do Material Liquid Glass: com transparência reduzida (ou sem
 * suporte a backdrop-filter) o vidro vira branco opaco com borda de card.
 * Usar junto com `layerStyle="glass"`.
 */
export const glassFallbackCss: SystemStyleObject = {
  "@media (prefers-reduced-transparency: reduce)": {
    bg: "bg.panel",
    backdropFilter: "none",
    borderColor: "border",
    boxShadow: "md",
  },
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))": {
    bg: "bg.panel",
    borderColor: "border",
    boxShadow: "md",
  },
};

/** Fallback para `layerStyle="glass.primary"`: tinta verde opaca. */
export const glassPrimaryFallbackCss: SystemStyleObject = {
  "@media (prefers-reduced-transparency: reduce)": {
    bg: "primary",
    backdropFilter: "none",
  },
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))": {
    bg: "primary",
  },
};

/** Anel de foco sobre o vidro: halo branco + anel verde (visível sobre fundo claro e escuro). */
export const glassFocusRing: SystemStyleObject = {
  outline: "none",
  boxShadow: "0 0 0 2px {colors.white}, 0 0 0 4px {colors.primary}",
};

/** Botão redondo de 44 px (alvo de toque) dentro de uma cápsula de vidro. */
export const glassIconButtonCss: SystemStyleObject = {
  boxSize: "44px",
  minW: "44px",
  borderRadius: "full",
  bg: "transparent",
  color: "fg.heading",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 150ms ease, transform 150ms ease",
  _hover: { bg: "green.900/8" },
  _active: { bg: "green.900/10", transform: "scale(0.96)" },
  _focusVisible: glassFocusRing,
};
