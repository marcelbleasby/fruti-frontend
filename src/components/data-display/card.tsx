import { Card as ChakraCard, Flex } from "@chakra-ui/react";
import type { HeadingLevel } from "./heading-level";
import NextLink from "next/link";
import { forwardRef, type ReactNode } from "react";

export type CardVariant = "outline" | "elevated" | "subtle";

export interface CardProps extends Omit<ChakraCard.RootProps, "title" | "variant" | "size" | "asChild"> {
  /** outline (padrão): listas e grids · elevated: menus e cards soltos · subtle: resumos sem ação principal */
  variant?: CardVariant;
  title?: ReactNode;
  /** Nível do título (o tamanho vem do papel, não do nível). Padrão h3. */
  headingAs?: HeadingLevel;
  description?: ReactNode;
  /** Conteúdo à direita do título (ex.: StatusBadge). */
  headerEnd?: ReactNode;
  /** Rodapé separado por divisor, alinhado à direita (ações). */
  footer?: ReactNode;
  /** Torna o card inteiro um único link (foco no card todo). Não use ações internas junto. */
  href?: string;
  children?: ReactNode;
}

const variantStyles: Record<CardVariant, ChakraCard.RootProps> = {
  outline: { bg: "bg.panel", borderWidth: "1px", borderColor: "border" },
  elevated: { bg: "bg.panel", borderWidth: "1px", borderColor: "transparent", boxShadow: "lg" },
  subtle: { bg: "primary.subtle", borderWidth: "1px", borderColor: "primary.subtle" },
};

const interactiveStyles: ChakraCard.RootProps = {
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
  transitionProperty: "border-color, box-shadow",
  transitionDuration: "fast",
  _hover: { borderColor: "primary" },
  _focusVisible: {
    borderColor: "primary",
    outline: "2px solid",
    outlineColor: "primary",
    outlineOffset: "2px",
  },
};

/**
 * Card — superfície de conteúdo. Raio 16px (dentro de tiles de 24px), padding 16px.
 * Chakra v3: Card.Root variant · Card.Body · Card.Footer.
 * Foco/hover do card clicável: borda primária e anel de foco; nada se move de lugar.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "outline", title, headingAs = "h3", description, headerEnd, footer, href, children, ...rest },
  ref,
) {
  const content = (
    <>
      <ChakraCard.Body p="3.5" gap="1">
        {(title || headerEnd) && (
          <Flex align="flex-start" justify="space-between" gap="2">
            {title && (
              <ChakraCard.Title as={headingAs} textStyle="heading.sm" color="fg.heading">
                {title}
              </ChakraCard.Title>
            )}
            {headerEnd}
          </Flex>
        )}
        {description && (
          <ChakraCard.Description textStyle="body.sm" color="fg">
            {description}
          </ChakraCard.Description>
        )}
        {children}
      </ChakraCard.Body>
      {footer && (
        <ChakraCard.Footer
          px="3.5"
          py="2.5"
          borderTopWidth="1px"
          borderColor="green.100"
          justifyContent="flex-end"
          gap="1.5"
        >
          {footer}
        </ChakraCard.Footer>
      )}
    </>
  );

  const common = {
    borderRadius: "2xl",
    overflow: "hidden",
    ...variantStyles[variant],
  } satisfies ChakraCard.RootProps;

  if (href) {
    return (
      <ChakraCard.Root ref={ref} asChild {...common} {...interactiveStyles} {...rest}>
        <NextLink href={href}>{content}</NextLink>
      </ChakraCard.Root>
    );
  }

  return (
    <ChakraCard.Root ref={ref} {...common} {...rest}>
      {content}
    </ChakraCard.Root>
  );
});
