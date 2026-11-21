import { Link as ChakraLink, VisuallyHidden, type LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import NextLink from "next/link";
import type { ReactNode } from "react";

export type TextLinkVariant = "inline" | "standalone";

export interface TextLinkProps extends Omit<ChakraLinkProps, "variant" | "href"> {
  /** Destino. Interno usa next/link; com `external` vira <a target="_blank">. */
  href?: string;
  /** `inline` (padrão, sublinhado, dentro de texto) · `standalone` (sozinho, com seta). */
  variant?: TextLinkVariant;
  /** Abre em nova aba, com ícone e aviso para leitores de tela. */
  external?: boolean;
  /** Aviso lido por leitores de tela em links externos. */
  externalLabel?: string;
  children: ReactNode;
}

const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;

/**
 * Link de texto do Fruti.
 * - interno: `<TextLink href="/areas">` (next/link via `asChild`);
 * - externo: `<TextLink href="…" external>` (ícone + "(abre em nova aba)");
 * - próprio: `<TextLink asChild><MeuLink /></TextLink>`.
 */
export function TextLink(props: TextLinkProps) {
  const {
    href,
    variant = "inline",
    external = false,
    externalLabel = "(abre em nova aba)",
    asChild,
    children,
    ...rest
  } = props;

  const styles: ChakraLinkProps = {
    variant: "plain",
    color: "primary",
    fontWeight: "600",
    gap: "1",
    textUnderlineOffset: "4px",
    textDecorationColor: "currentColor",
    focusVisibleRing: "outside",
    _hover: { color: "primary.hover", textDecoration: "underline", textDecorationColor: "currentColor" },
    textDecoration: variant === "standalone" && !external ? "none" : "underline",
    ...(variant === "standalone" || external
      ? { display: "inline-flex", alignItems: "center", minH: { base: "11", md: "8" } }
      : { display: "inline" }),
  };

  if (asChild) {
    return (
      <ChakraLink asChild {...styles} {...rest}>
        {children}
      </ChakraLink>
    );
  }

  if (external) {
    return (
      <ChakraLink href={href} target="_blank" rel="noopener noreferrer" {...styles} {...rest}>
        {children}
        <ExternalLink {...ICON} size={16} />
        <VisuallyHidden> {externalLabel}</VisuallyHidden>
      </ChakraLink>
    );
  }

  const content = (
    <>
      {children}
      {variant === "standalone" && <ArrowRight {...ICON} />}
    </>
  );

  if (!href) {
    return (
      <ChakraLink {...styles} {...rest}>
        {content}
      </ChakraLink>
    );
  }

  return (
    <ChakraLink asChild {...styles} {...rest}>
      <NextLink href={href}>{content}</NextLink>
    </ChakraLink>
  );
}
