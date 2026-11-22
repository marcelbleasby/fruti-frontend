"use client";

import { Icon, Text } from "@chakra-ui/react";
import { CalendarClock, CircleAlert } from "lucide-react";
import { Badge } from "@/components/data-display/badge";
import { formatData, situacaoDeValidade } from "@/lib/estoque/format";

const dias = (n: number) => `${n} dia${n === 1 ? "" : "s"}`;

/**
 * Validade do lote. Status nunca só por cor: ícone + texto.
 * Vencido (vermelho) · vence em até 30 dias (safra/âmbar) · ok (data neutra).
 */
export function ValidadeBadge({ validade, hoje }: { validade: string | null; hoje?: string }) {
  const s = situacaoDeValidade(validade, hoje);

  if (s.tipo === "sem-validade") {
    return (
      <Text as="span" color="fg.muted" aria-label="Sem validade">
        —
      </Text>
    );
  }
  if (s.tipo === "ok") {
    return (
      <Text as="span" fontVariantNumeric="tabular-nums" color="fg">
        {formatData(validade)}
      </Text>
    );
  }

  const vencido = s.tipo === "vencido";
  const texto = vencido
    ? s.dias === 0
      ? "Vence hoje"
      : `Vencido há ${dias(s.dias)}`
    : s.dias === 0
      ? "Vence hoje"
      : `Vence em ${dias(s.dias)}`;

  return (
    <Badge tone={vencido ? "red" : "harvest"} title={`Validade: ${formatData(validade)}`} gap="1" whiteSpace="nowrap">
      <Icon as={vencido ? CircleAlert : CalendarClock} boxSize="3.5" strokeWidth={2} aria-hidden />
      {texto}
    </Badge>
  );
}
