import { defineRecipe } from "@chakra-ui/react";

/**
 * Ajustes das receitas nativas do Chakra (mesclados com o defaultConfig).
 * Só o que difere do padrão é declarado aqui.
 */

// Button · IconButton — sm 32 / md 40 / lg 48, raio l2, peso 600.
export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "600",
    borderRadius: "l2",
    transitionProperty: "background-color, border-color, color, box-shadow",
    transitionDuration: "fast",
    _disabled: { layerStyle: "disabled", opacity: 1 },
  },
  variants: {
    size: {
      sm: { h: "8", minW: "8", px: "3", textStyle: "body.sm", _icon: { width: "4", height: "4" } },
      md: { h: "10", minW: "10", px: "4", textStyle: "body.sm", fontWeight: "600", _icon: { width: "4", height: "4" } },
      lg: { h: "12", minW: "12", px: "5", textStyle: "body", fontWeight: "600", _icon: { width: "5", height: "5" } },
    },
    variant: {
      solid: {
        _hover: { bg: "colorPalette.solid/90" },
        _active: { bg: "primary.hover" },
      },
      outline: {
        bg: "bg.panel",
        color: "fg.heading",
        borderColor: "border.control",
        _hover: { bg: "bg.subtle" },
      },
      subtle: {
        color: "colorPalette.fg",
        _hover: { bg: "colorPalette.muted" },
      },
      ghost: {
        color: "fg.heading",
        _hover: { bg: "bg.hover" },
      },
    },
  },
  defaultVariants: { size: "md", variant: "solid" },
});

// Input / Textarea — altura 40, borda de controle, foco com halo verde.
const controlBase = {
  bg: "bg.panel",
  color: "fg",
  borderRadius: "l2",
  borderColor: "border.control",
  textStyle: "body",
  _placeholder: { color: "fg.muted" },
  _disabled: { layerStyle: "disabled", opacity: 1 },
  _invalid: { borderColor: "border.error", boxShadow: "0 0 0 1px {colors.border.error}" },
  focusVisibleRing: "outside",
} as const;

/**
 * A variante `outline` nativa define `borderColor: "border"` (verde decorativo dos
 * cards, 1,2:1) e `bg: "transparent"`, e vence o `base`. Campo precisa de borda
 * de controle (3,6:1, WCAG 1.4.11) e fundo branco do DS — transparente, ele
 * herda o verde da página e some ao lado dos selects —, então a variante é
 * redeclarada com os tokens certos.
 */
const outlineVariant = {
  outline: {
    bg: "bg.panel",
    borderColor: "border.control",
    _invalid: { borderColor: "border.error" },
  },
} as const;

export const inputRecipe = defineRecipe({
  base: controlBase,
  variants: {
    size: {
      md: { h: "10", px: "3", textStyle: "body" },
      lg: { h: "11", px: "3", textStyle: "body" },
    },
    variant: outlineVariant,
  },
  defaultVariants: { size: "md", variant: "outline" },
});

export const textareaRecipe = defineRecipe({
  base: controlBase,
  variants: { variant: outlineVariant },
  defaultVariants: { variant: "outline" },
});
