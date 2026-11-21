import { Highlight, Mark as ChakraMark, type MarkProps as ChakraMarkProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export type MarkProps = Omit<ChakraMarkProps, "variant">;

const markStyles = {
  bg: "accent.subtle",
  color: "accent.fg",
  // Sem padding (que abriria espaço no meio da palavra, ex.: "Acer|ola"):
  // a sombra estende o fundo sem mexer no fluxo do texto.
  px: "0",
  boxShadow: "0 0 0 2px {colors.accent.subtle}",
  boxDecorationBreak: "clone",
  borderRadius: "2xs",
  fontWeight: "600",
} as const;

/** Mark — trecho destacado (ex.: termo buscado), fundo accent.subtle. */
export const Mark = forwardRef<HTMLElement, MarkProps>(function Mark(props, ref) {
  return <ChakraMark ref={ref} {...markStyles} {...props} />;
});

export interface HighlightTextProps {
  /** Texto completo. */
  children: string;
  /** Termo(s) a destacar (sem diferenciar maiúsculas). */
  query: string | string[];
}

/** Destaca automaticamente o termo buscado num texto. Chakra v3: Highlight. */
export function HighlightText({ children, query }: HighlightTextProps) {
  return (
    <Highlight query={query} ignoreCase styles={markStyles}>
      {children}
    </Highlight>
  );
}
