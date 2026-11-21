import type { SystemStyleObject } from "@chakra-ui/react";

/**
 * Estilos compartilhados pelos controles do DS que não usam a receita de Input
 * (Select, Combobox, NumberInput, DatePicker…). Mantêm o mesmo visual do campo:
 * altura 40, borda de controle, halo verde no foco, borda vermelha no erro.
 */

/** Halo de foco do DS (borda primária + anel suave). */
export const focusHalo = "0 0 0 1px {colors.primary}, 0 0 0 4px color-mix(in srgb, {colors.primary} 18%, transparent)";

/** Anel de erro (borda + 1px). */
export const errorRing = "0 0 0 1px {colors.border.error}";

/** Caixa que imita um campo — para contêineres que envolvem um input sem borda. */
export const controlFrameStyles: SystemStyleObject = {
  display: "flex",
  alignItems: "stretch",
  width: "full",
  minH: "10",
  bg: "bg.panel",
  color: "fg",
  borderWidth: "1px",
  borderColor: "border.control",
  borderRadius: "l2",
  overflow: "hidden",
  transitionProperty: "border-color, box-shadow",
  transitionDuration: "fast",
  _focusWithin: { borderColor: "primary", boxShadow: focusHalo },
  _invalid: {
    borderColor: "border.error",
    boxShadow: errorRing,
    _focusWithin: { borderColor: "border.error", boxShadow: errorRing },
  },
  _disabled: { layerStyle: "disabled" },
};

/** Gatilho com aparência de campo (Select, DateRangePicker). */
export const triggerStyles: SystemStyleObject = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
  width: "full",
  h: "10",
  px: "3",
  bg: "bg.panel",
  color: "fg",
  textStyle: "body",
  textAlign: "start",
  borderWidth: "1px",
  borderColor: "border.control",
  borderRadius: "l2",
  cursor: "pointer",
  focusVisibleRing: "outside",
  _open: { borderColor: "primary", boxShadow: "0 0 0 1px {colors.primary}" },
  _invalid: { borderColor: "border.error", boxShadow: errorRing },
  _disabled: { layerStyle: "disabled" },
  _placeholderShown: { color: "fg.muted" },
};

/** Painel flutuante de listas (Select, Combobox, SearchField). */
export const listContentStyles: SystemStyleObject = {
  bg: "bg.panel",
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "l3",
  boxShadow: "lg",
  p: "1",
  maxH: "80",
  overflowY: "auto",
};

/** Item de lista selecionável (≥ 40 px). */
export const listItemStyles: SystemStyleObject = {
  display: "flex",
  alignItems: "center",
  gap: "2",
  minH: "10",
  px: "3",
  py: "1",
  borderRadius: "l2",
  color: "fg",
  textStyle: "body.sm",
  cursor: "pointer",
  _highlighted: { bg: "bg.hover" },
  "&[data-state=checked]": { bg: "primary.subtle" },
  _disabled: { opacity: 0.55, cursor: "not-allowed" },
};

/** Rótulo de grupo em listas (caixa alta, 12 px). */
export const listGroupLabelStyles: SystemStyleObject = {
  px: "3",
  pt: "2",
  pb: "1",
  textStyle: "overline",
  color: "fg.muted",
};

/** Caixa visual de checkbox 20 px (usada dentro de itens de lista). */
export const checkboxBoxStyles: SystemStyleObject = {
  boxSize: "5",
  flex: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "sm",
  borderWidth: "2px",
  borderColor: "border.control",
  bg: "bg.panel",
  color: "fg.inverted",
};

/** Texto de apoio/erro: 16 px (token `sm` = 16 na grade de 4) com linha de 24 px. */
export const messageFontSize = "sm";
