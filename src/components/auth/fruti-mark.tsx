import { Flex, Text, chakra } from "@chakra-ui/react";

export interface FrutiMarkProps {
  /** Tamanho do símbolo em px. */
  size?: number;
  /** Mostra o nome "Fruti" ao lado. */
  withWordmark?: boolean;
  /** Cor do nome (ex.: "fg.inverted" sobre o painel verde). */
  wordmarkColor?: string;
  /** Token da escala (padrão "2xl" · 24px). */
  wordmarkSize?: string;
  /** `inverted`: cores claras para fundo verde escuro (painel de marca). */
  tone?: "default" | "inverted";
}

const TONE_COLORS = {
  default: { fruit: "green.700", leaf: "green.500", shine: "green.200" },
  inverted: { fruit: "green.400", leaf: "green.200", shine: "white" },
} as const;

/** Símbolo do Fruti (fruta + folha), usado nas telas de acesso. */
export function FrutiMark({
  size = 28,
  withWordmark = true,
  wordmarkColor,
  wordmarkSize = "2xl",
  tone = "default",
}: FrutiMarkProps) {
  const c = TONE_COLORS[tone];
  return (
    <Flex align="center" gap="2.5">
      <chakra.svg width={`${size}px`} height={`${size}px`} viewBox="0 0 28 28" aria-hidden flex="none">
        <chakra.circle cx="14" cy="16.5" r="10" fill={c.fruit} />
        <chakra.path d="M14.5 7.5C14.2 4 16.4 1.6 21 1.5c-.3 4-2.6 6.1-6.5 6z" fill={c.leaf} />
        <chakra.path d="M10 14.5a5 5 0 0 1 4-3" stroke={c.shine} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </chakra.svg>
      {withWordmark && (
        <Text as="span" fontSize={wordmarkSize} fontWeight="700" color={wordmarkColor ?? (tone === "inverted" ? "fg.inverted" : "fg.heading")} lineHeight="1">
          Fruti
        </Text>
      )}
    </Flex>
  );
}
