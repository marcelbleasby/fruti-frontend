import { Code as ChakraCode, type CodeProps as ChakraCodeProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export type CodeProps = Omit<ChakraCodeProps, "variant" | "size">;

/** Code inline — códigos de domínio (lote, plantio): Fira Code 16/24 (textStyle code), fundo bg.muted, texto fg.heading. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(props, ref) {
  return (
    <ChakraCode
      ref={ref}
      textStyle="code"
      px="1.5"
      py="0"
      borderRadius="sm"
      bg="bg.muted"
      color="fg.heading"
      boxShadow="none"
      {...props}
    />
  );
});
