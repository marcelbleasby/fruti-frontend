import { Icon, type IconProps } from "@chakra-ui/react";
import { createElement, isValidElement, type ElementType } from "react";
import type { NavIcon } from "./nav-types";

export interface NavIconGlyphProps extends Omit<IconProps, "children" | "asChild" | "size"> {
  icon: NavIcon;
  /** Tamanho em px (DS: 16, 20 ou 24). */
  size?: 16 | 20 | 24;
}

/**
 * Renderiza o ícone de um item de navegação no tamanho e traço do DS (1,75).
 * Tamanho e traço vão por CSS, então valem também para elementos já
 * renderizados no servidor (`icon={<Sprout />}` vindo de um Server Component).
 */
export function NavIconGlyph({ icon, size = 20, ...rest }: NavIconGlyphProps) {
  const node = isValidElement(icon) ? icon : createElement(icon as ElementType);
  return (
    <Icon asChild boxSize={`${size}px`} strokeWidth="1.75" aria-hidden="true" {...rest}>
      {node}
    </Icon>
  );
}
