import { Box, Flex, type FlexProps } from "@chakra-ui/react";
import { StatusBadge } from "@/components/data-display/status-badge";
import { MetricValue } from "@/modules/typography";
import { availabilityStatus, DEFAULT_LOW_THRESHOLD, quantityWords } from "../utils";

export interface SeedlingAvailabilityProps extends Omit<FlexProps, "children"> {
  /** Quantidade recebida. */
  total: number;
  /** Quantidade já utilizada em plantios. */
  used: number;
  /** Fração do recebido abaixo da qual o estoque é baixo (padrão 0,1 = 10%). */
  lowThreshold?: number;
  /** Unidade nos textos (padrão "mudas"; "sementes", "g" ou "kg"). Massa aparece junto do número. */
  unit?: string;
  /** Rótulo acessível da barra (padrão "Disponibilidade do lote"). */
  meterLabel?: string;
}

/**
 * SeedlingAvailability — disponível × recebido, barra de uso e status de estoque.
 * Números escritos acompanham a barra (a leitura não depende da cor).
 * Chakra v3: Meter · Stat · StatusBadge.
 */
export function SeedlingAvailability({
  total,
  used,
  lowThreshold = DEFAULT_LOW_THRESHOLD,
  unit = "mudas",
  meterLabel,
  ...rest
}: SeedlingAvailabilityProps) {
  const safeUsed = Math.min(Math.max(0, used), total);
  const available = Math.max(0, total - safeUsed);
  const status = availabilityStatus(total, safeUsed, lowThreshold);
  const avail = quantityWords(available, unit);
  const tot = quantityWords(total, unit);
  const usedW = quantityWords(safeUsed, unit);
  const summary = `${avail.value} de ${tot.value} ${avail.available}`;

  return (
    <Flex direction="column" gap="2" {...rest}>
      <Flex justify="space-between" align="baseline" gap="2" wrap="wrap">
        <MetricValue value={avail.value} unit={`de ${tot.value} ${avail.available}`} />
        <StatusBadge status={status} size="sm" />
      </Flex>
      <Flex
        role="meter"
        aria-label={meterLabel ?? "Disponibilidade do lote"}
        aria-valuenow={available}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={summary}
        gap="2px"
        h="3"
        borderRadius="full"
        overflow="hidden"
        bg="bg.muted"
      >
        {safeUsed > 0 && <Box as="span" flex={`${safeUsed} 1 0`} bg="slate.500" />}
        {available > 0 && <Box as="span" flex={`${available} 1 0`} bg={status === "estoque_baixo" ? "harvest.700" : "primary"} />}
      </Flex>
      <Flex justify="space-between" gap="2" textStyle="caption" fontWeight="400" color="fg.muted">
        <span>
          {usedW.value} {usedW.used} em plantios
        </span>
        <span>
          {avail.value} {avail.free}
        </span>
      </Flex>
    </Flex>
  );
}
