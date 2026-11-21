import { Badge as ChakraBadge, type BadgeProps as ChakraBadgeProps } from "@chakra-ui/react";
import { forwardRef } from "react";
import { TONES, type Tone } from "./tones";

export type BadgeVariant = "solid" | "subtle" | "outline";

export interface BadgeProps extends Omit<ChakraBadgeProps, "variant" | "colorPalette" | "size"> {
  /** solid: destaque · subtle (padrão): rótulo informativo · outline: discreto */
  variant?: BadgeVariant;
  /** green (Novo) · harvest (Safra) · gray (Rascunho) · red (Atrasado) · sky (Planejado) */
  tone?: Tone;
}

/**
 * Badge — rótulo curto, não interativo. Altura 24px, raio 8px, 12px/600.
 * Chakra v3: Badge variant · colorPalette.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "subtle", tone = "green", children, ...rest },
  ref,
) {
  const t = TONES[tone];
  const look =
    variant === "solid"
      ? { bg: t.solid, color: "fg.inverted", borderColor: t.solid }
      : variant === "outline"
        ? { bg: "bg.panel", color: t.fg, borderColor: t.solid }
        : { bg: t.subtle, color: t.fg, borderColor: t.subtle };

  return (
    <ChakraBadge
      ref={ref}
      h="24px"
      px="2"
      gap="1"
      borderRadius="sm"
      borderWidth="1px"
      fontSize="xs"
      lineHeight="1"
      fontWeight="600"
      boxShadow="none"
      {...look}
      {...rest}
    >
      {children}
    </ChakraBadge>
  );
});

export interface CountBadgeProps extends Omit<ChakraBadgeProps, "children"> {
  count: number;
  /** Acima disso mostra "max+". Padrão 99. */
  max?: number;
  /** Texto para leitores de tela, ex.: "3 não lidas". */
  "aria-label"?: string;
}

/** Contador numérico (ex.: "Não lidas 3"). Pílula 20px, verde primário. */
export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(function CountBadge(
  { count, max = 99, ...rest },
  ref,
) {
  return (
    <ChakraBadge
      ref={ref}
      minW="20px"
      h="20px"
      px="1"
      justifyContent="center"
      borderRadius="full"
      bg="primary"
      color="fg.inverted"
      fontSize="xs"
      lineHeight="1"
      fontWeight="700"
      {...rest}
    >
      {count > max ? `${max}+` : count}
    </ChakraBadge>
  );
});
