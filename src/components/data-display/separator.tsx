import { Flex, Separator as ChakraSeparator, type SeparatorProps as ChakraSeparatorProps, Text } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";

export interface SeparatorProps extends Omit<ChakraSeparatorProps, "size"> {
  /** Rótulo central (só horizontal), ex.: "ou". */
  label?: ReactNode;
}

/**
 * Separator — linha de 1px na cor `border`. Vertical: 16px de altura entre itens em linha.
 * Chakra v3: Separator orientation.
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { label, orientation = "horizontal", ...rest },
  ref,
) {
  if (label && orientation === "horizontal") {
    return (
      <Flex ref={ref} align="center" gap="3" role="separator" aria-orientation="horizontal">
        <ChakraSeparator flex="1" borderColor="border" {...rest} />
        <Text as="span" fontSize="sm" color="fg.muted" flexShrink={0}>
          {label}
        </Text>
        <ChakraSeparator flex="1" borderColor="border" {...rest} />
      </Flex>
    );
  }
  return (
    <ChakraSeparator
      ref={ref}
      orientation={orientation}
      borderColor="border"
      {...(orientation === "vertical" ? { h: "16px", alignSelf: "center" } : {})}
      {...rest}
    />
  );
});
