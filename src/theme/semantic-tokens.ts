import { defineSemanticTokens } from "@chakra-ui/react";

/**
 * Tema claro único (sem dark mode) — decisão do design system.
 * Nomes do DS (color.primary, color.ink, …) + nomes nativos do Chakra
 * (bg, fg, border, colorPalette.*) para que as receitas padrão já sigam o DS.
 */
export const semanticTokens = defineSemanticTokens({
  colors: {
    // ── Nomes do design system ────────────────────────────────
    primary: {
      DEFAULT: { value: "{colors.green.700}" }, // #15803D · 5,0:1 com branco
      hover: { value: "{colors.green.800}" }, // #166534
      subtle: { value: "{colors.green.100}" }, // #DCFCE7
    },
    secondary: { value: "{colors.green.500}" }, // #22C55E · nunca em texto
    accent: {
      DEFAULT: { value: "{colors.harvest.700}" }, // #A16207
      fg: { value: "{colors.harvest.900}" }, // #78350F
      subtle: { value: "{colors.harvest.100}" }, // #FEF3C7
    },
    ink: { value: "{colors.slate.800}" }, // #1E293B · corpo
    danger: {
      DEFAULT: { value: "{colors.red.700}" }, // #B91C1C
      hover: { value: "{colors.red.800}" },
      subtle: { value: "{colors.red.100}" },
    },

    // ── Superfícies ───────────────────────────────────────────
    bg: {
      DEFAULT: { value: "{colors.green.50}" }, // #F0FDF4 · fundo do app
      panel: { value: "{colors.white}" },
      subtle: { value: "{colors.sage.50}" },
      muted: { value: "{colors.sage.300}" }, // #E8F0F1
      emphasized: { value: "{colors.sage.400}" },
      hover: { value: "{colors.sage.200}" }, // #ECF3EF
      inverted: { value: "{colors.green.900}" },
      error: { value: "{colors.red.50}" },
      warning: { value: "{colors.harvest.50}" },
      success: { value: "{colors.green.100}" },
      info: { value: "{colors.sky.100}" },
      glass: { value: "rgba(255,255,255,0.62)" },
    },

    // ── Texto ─────────────────────────────────────────────────
    fg: {
      DEFAULT: { value: "{colors.slate.800}" }, // ink
      heading: { value: "{colors.green.900}" }, // color.fg do DS · #14532D
      muted: { value: "{colors.slate.600}" }, // #475569
      subtle: { value: "{colors.slate.550}" }, // ≥4.5:1 sobre bg, panel e muted
      disabled: { value: "{colors.slate.600}" },
      inverted: { value: "{colors.white}" },
      error: { value: "{colors.red.700}" },
      warning: { value: "{colors.harvest.900}" },
      success: { value: "{colors.green.900}" },
      info: { value: "{colors.sky.800}" },
    },

    // ── Bordas ────────────────────────────────────────────────
    border: {
      DEFAULT: { value: "{colors.green.200}" }, // #BBF7D0 · cards/divisores
      muted: { value: "{colors.sage.400}" },
      subtle: { value: "{colors.sage.200}" },
      emphasized: { value: "{colors.green.300}" },
      control: { value: "{colors.sage.600}" }, // #6B8F7A · campos/outline
      disabled: { value: "{colors.slate.300}" },
      inverted: { value: "{colors.green.900}" },
      error: { value: "{colors.red.700}" },
      warning: { value: "{colors.harvest.300}" },
      success: { value: "{colors.green.300}" },
      info: { value: "{colors.sky.300}" },
      glass: { value: "rgba(255,255,255,0.75)" },
    },

    focusRing: { value: "{colors.green.700}" },

    // ── Paletas para colorPalette ─────────────────────────────
    green: {
      contrast: { value: "{colors.white}" },
      fg: { value: "{colors.green.900}" },
      subtle: { value: "{colors.green.100}" },
      muted: { value: "{colors.green.200}" },
      emphasized: { value: "{colors.green.300}" },
      solid: { value: "{colors.green.700}" },
      focusRing: { value: "{colors.green.700}" },
      border: { value: "{colors.sage.600}" },
    },
    red: {
      contrast: { value: "{colors.white}" },
      fg: { value: "{colors.red.700}" },
      subtle: { value: "{colors.red.100}" },
      muted: { value: "{colors.red.200}" },
      emphasized: { value: "{colors.red.300}" },
      solid: { value: "{colors.red.700}" },
      focusRing: { value: "{colors.red.700}" },
      border: { value: "{colors.red.700}" },
    },
    harvest: {
      contrast: { value: "{colors.white}" },
      fg: { value: "{colors.harvest.900}" },
      subtle: { value: "{colors.harvest.100}" },
      muted: { value: "{colors.harvest.200}" },
      emphasized: { value: "{colors.harvest.300}" },
      solid: { value: "{colors.harvest.700}" },
      focusRing: { value: "{colors.harvest.700}" },
      border: { value: "{colors.harvest.300}" },
    },
    sky: {
      contrast: { value: "{colors.white}" },
      fg: { value: "{colors.sky.800}" },
      subtle: { value: "{colors.sky.100}" },
      muted: { value: "{colors.sky.100}" },
      emphasized: { value: "{colors.sky.300}" },
      solid: { value: "{colors.sky.800}" },
      focusRing: { value: "{colors.sky.800}" },
      border: { value: "{colors.sky.300}" },
    },
    gray: {
      contrast: { value: "{colors.white}" },
      fg: { value: "{colors.slate.700}" },
      subtle: { value: "{colors.sage.300}" },
      muted: { value: "{colors.sage.400}" },
      emphasized: { value: "{colors.sage.500}" },
      solid: { value: "{colors.slate.700}" },
      focusRing: { value: "{colors.green.700}" },
      border: { value: "{colors.sage.600}" },
    },
  },
  radii: {
    l1: { value: "{radii.xs}" }, // 4px · chips, checkbox
    l2: { value: "{radii.md}" }, // 8px · campos, botões
    l3: { value: "{radii.xl}" }, // 12px · cards, diálogos
    l4: { value: "{radii.3xl}" }, // 24px · tiles do Bento, seções
  },
});
