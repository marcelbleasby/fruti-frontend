import { Flex, Kbd as ChakraKbd, type KbdProps as ChakraKbdProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export type KbdProps = Omit<ChakraKbdProps, "variant" | "size">;

/** Kbd — tecla: Fira Code 12/16, borda border.control com base de 2px. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(props, ref) {
  return (
    <ChakraKbd
      ref={ref}
      textStyle="code.sm"
      fontWeight="400"
      lineHeight="1rem"
      h="auto"
      minH="0"
      px="1.5"
      py="0"
      borderRadius="xs"
      borderWidth="1px"
      borderBottomWidth="2px"
      borderColor="border.control"
      bg="bg.panel"
      color="fg"
      boxShadow="none"
      {...props}
    />
  );
});

export interface KbdShortcutProps {
  /** Teclas da combinação, ex.: ["Ctrl", "K"]. */
  keys: string[];
}

/** Atalho com várias teclas lado a lado (gap 4px). */
export function KbdShortcut({ keys }: KbdShortcutProps) {
  return (
    <Flex as="span" gap="1" display="inline-flex">
      {keys.map((k, i) => (
        <Kbd key={`${k}-${i}`}>{k}</Kbd>
      ))}
    </Flex>
  );
}
