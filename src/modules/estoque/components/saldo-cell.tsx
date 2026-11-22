"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { formatQuantidade, fracaoDoSaldo, quantidadePorExtenso, toNumber } from "@/lib/estoque/format";
import type { Unidade } from "@/lib/estoque/types";

/**
 * Saldo do lote: "320 / 500 un" + barra do que resta. A barra é decorativa;
 * o texto (e o rótulo por extenso) carrega a informação.
 */
export function SaldoCell({
  saldo,
  inicial,
  unidade,
  size = "sm",
}: {
  saldo: string;
  inicial: string;
  unidade: Unidade;
  size?: "sm" | "lg";
}) {
  const fracao = fracaoDoSaldo(saldo, inicial);
  const esgotado = toNumber(saldo) <= 0;
  const baixo = !esgotado && fracao <= 0.2;
  const rotulo = esgotado
    ? `Esgotado (de ${quantidadePorExtenso(inicial, unidade)})`
    : `${quantidadePorExtenso(saldo, unidade)} de ${quantidadePorExtenso(inicial, unidade)}`;

  return (
    <Flex direction="column" gap="1" minW={size === "sm" ? "120px" : undefined} aria-label={rotulo} role="group">
      <Flex align="baseline" gap="1" fontVariantNumeric="tabular-nums" aria-hidden>
        {esgotado ? (
          <Text as="span" fontWeight="600" color="fg.muted" fontSize={size === "lg" ? "xl" : undefined}>
            Esgotado
          </Text>
        ) : (
          <Text as="span" fontWeight="600" color="fg.heading" fontSize={size === "lg" ? "2xl" : undefined}>
            {formatQuantidade(saldo, unidade)}
          </Text>
        )}
        <Text as="span" fontSize={size === "lg" ? "sm" : "xs"} color="fg.muted" whiteSpace="nowrap">
          / {formatQuantidade(inicial, unidade)}
        </Text>
      </Flex>
      <Box h={size === "lg" ? "2" : "1"} borderRadius="full" bg="bg.muted" overflow="hidden" aria-hidden>
        <Box
          h="full"
          w={`${Math.round(fracao * 100)}%`}
          borderRadius="full"
          bg={baixo ? "harvest.400" : "primary"}
          transition="width 200ms ease"
        />
      </Box>
    </Flex>
  );
}
