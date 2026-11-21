import { chakra, HStack, Text, type HTMLChakraProps } from "@chakra-ui/react";

export interface FrutiLogoMarkProps extends HTMLChakraProps<"svg"> {
  /** Tamanho em px. */
  size?: number;
}

/** Símbolo do Fruti (fruto + folha), com as cores do tema. */
export function FrutiLogoMark({ size = 28, ...rest }: FrutiLogoMarkProps) {
  return (
    <chakra.svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 28 28"
      flexShrink={0}
      aria-hidden="true"
      {...rest}
    >
      <chakra.circle cx="14" cy="16.5" r="10" fill="primary" />
      <chakra.path d="M14.5 7.5C14.2 4 16.4 1.6 21 1.5c-.3 4-2.6 6.1-6.5 6z" fill="secondary" />
      <chakra.path
        d="M10 14.5a5 5 0 0 1 4-3"
        stroke="green.200"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </chakra.svg>
  );
}

export interface FrutiLogoProps {
  /** Esconde o nome e mostra só o símbolo. */
  markOnly?: boolean;
  size?: number;
}

/** Símbolo + nome "Fruti". */
export function FrutiLogo({ markOnly = false, size = 28 }: FrutiLogoProps) {
  if (markOnly) return <FrutiLogoMark size={size} />;
  return (
    <HStack gap="8px" color="fg.heading">
      <FrutiLogoMark size={size} />
      <Text as="span" textStyle="heading.md" fontWeight="700">
        Fruti
      </Text>
    </HStack>
  );
}
