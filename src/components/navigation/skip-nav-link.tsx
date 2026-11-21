import {
  SkipNavContent as ChakraSkipNavContent,
  SkipNavLink as ChakraSkipNavLink,
  type SkipNavContentProps as ChakraSkipNavContentProps,
  type SkipNavLinkProps as ChakraSkipNavLinkProps,
} from "@chakra-ui/react";

/** Id padrão do alvo do SkipNavLink. */
export const SKIP_NAV_ID = "conteudo";

export interface SkipNavLinkProps extends Omit<ChakraSkipNavLinkProps, "href"> {
  /** Id do elemento alvo (sem "#"). */
  contentId?: string;
}

/**
 * "Pular para o conteúdo": invisível até receber foco pelo teclado.
 * Coloque como primeiro elemento focável da página.
 */
export function SkipNavLink(props: SkipNavLinkProps) {
  const { contentId = SKIP_NAV_ID, children = "Pular para o conteúdo", ...rest } = props;
  return (
    <ChakraSkipNavLink
      href={`#${contentId}`}
      bg="bg.inverted"
      color="fg.inverted"
      textStyle="body.sm"
      fontWeight="600"
      textDecoration="none"
      alignItems="center"
      minH="10"
      px="3.5"
      py="0"
      borderRadius="l2"
      zIndex="skipNav"
      focusVisibleRing="outside"
      {...rest}
    >
      {children}
    </ChakraSkipNavLink>
  );
}

export type SkipNavContentProps = ChakraSkipNavContentProps;

/** Alvo do SkipNavLink (envolve o conteúdo principal). */
export function SkipNavContent(props: SkipNavContentProps) {
  const { id = SKIP_NAV_ID, ...rest } = props;
  return <ChakraSkipNavContent id={id} tabIndex={-1} outline="none" {...rest} />;
}
