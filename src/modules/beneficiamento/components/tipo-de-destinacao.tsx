"use client";

import { Icon } from "@chakra-ui/react";
import { HandCoins, HandHeart, Recycle, TrendingDown, Utensils, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/data-display/badge";
import type { Tone } from "@/components/data-display/tones";
import { TIPO_DE_DESTINACAO_LABEL, type TipoDeDestinacao } from "@/lib/beneficiamento/types";

export const TIPO_DE_DESTINACAO_VISUAL: Record<TipoDeDestinacao, { icon: LucideIcon; tone: Tone }> = {
  VENDA: { icon: HandCoins, tone: "green" },
  DOACAO: { icon: HandHeart, tone: "sky" },
  CONSUMO_PROPRIO: { icon: Utensils, tone: "gray" },
  PERDA: { icon: TrendingDown, tone: "red" },
  COMPOSTAGEM: { icon: Recycle, tone: "harvest" },
};

/** Tipo da destinação: ícone + texto + cor (nunca só cor). */
export function TipoDeDestinacaoBadge({ tipo }: { tipo: TipoDeDestinacao }) {
  const v = TIPO_DE_DESTINACAO_VISUAL[tipo];
  return (
    <Badge tone={v.tone} gap="1" whiteSpace="nowrap">
      <Icon as={v.icon} boxSize="3.5" strokeWidth={2} aria-hidden />
      {TIPO_DE_DESTINACAO_LABEL[tipo]}
    </Badge>
  );
}
