"use client";

import { Box, Fieldset, Flex, chakra } from "@chakra-ui/react";
import { DecimalInput, parseDecimalPtBR } from "@/components/forms/decimal-input";
import { areaSquareMeters, formatHectares, formatSquareMeters } from "../../format";

/** Valores como string (pt-BR) para permitir decimais intermediários ao digitar. */
export interface AreaMeasurementValue {
  length: string;
  width: string;
}

export interface AreaMeasurementNumbers {
  length: number;
  width: number;
}

export interface AreaMeasurementFieldsProps {
  value: AreaMeasurementValue;
  onChange: (value: AreaMeasurementValue, numbers: AreaMeasurementNumbers) => void;
  errors?: { length?: string; width?: string };
  /** Unidade das medidas (modelo inicial: só metros). */
  unit?: "m";
  /** Título do grupo (legend). */
  legend?: string;
  disabled?: boolean;
  /** Prefixo dos ids dos campos — destino das âncoras do FormErrorSummary. */
  idPrefix?: string;
  /** Nomes para envio nativo do formulário. */
  names?: { length?: string; width?: string };
}

/** Lê "12,5", "12.5" ou "1.250" (o NumberInput arredondava no blur; ver ADR 0002). */
function toNumber(raw: string): number {
  return parseDecimalPtBR(raw);
}

/**
 * AreaMeasurementFields — comprimento × largura com a área recalculada
 * enquanto digita e anunciada a leitores de tela (`<output aria-live>`).
 * Chakra v3: Fieldset · DecimalInput (TextInput do DS).
 */
export function AreaMeasurementFields({
  value,
  onChange,
  errors,
  unit = "m",
  legend = "Dimensões da área retangular",
  disabled,
  idPrefix = "area",
  names,
}: AreaMeasurementFieldsProps) {
  const lengthId = `${idPrefix}-comprimento`;
  const widthId = `${idPrefix}-largura`;
  const numbers = { length: toNumber(value.length), width: toNumber(value.width) };
  const m2 = areaSquareMeters(numbers.length || 0, numbers.width || 0);

  const update = (patch: Partial<AreaMeasurementValue>, numPatch: Partial<AreaMeasurementNumbers>) =>
    onChange({ ...value, ...patch }, { ...numbers, ...numPatch });

  const times = (
    <chakra.span aria-hidden="true" alignSelf="flex-start" mt="10" fontSize="lg" lineHeight="1.5rem" color="fg.muted" flexShrink={0}>
      ×
    </chakra.span>
  );

  return (
    <Fieldset.Root disabled={disabled} gap="2.5" minW="0">
      <Fieldset.Legend mb="2" textStyle="heading.sm" color="fg.heading">
        {legend}
      </Fieldset.Legend>
      <Flex gap="2.5" align="flex-start" minW="0">
        <Box flex="1 1 110px" minW="0">
          <DecimalInput
            id={lengthId}
            name={names?.length}
            label="Comprimento"
            required
            unit={unit}
            casas={2}
            value={value.length}
            onChange={(v) => update({ length: v }, { length: toNumber(v) })}
            errorText={errors?.length}
            invalid={Boolean(errors?.length)}
          />
        </Box>
        {times}
        <Box flex="1 1 110px" minW="0">
          <DecimalInput
            id={widthId}
            name={names?.width}
            label="Largura"
            required
            unit={unit}
            casas={2}
            value={value.width}
            onChange={(v) => update({ width: v }, { width: toNumber(v) })}
            errorText={errors?.width}
            invalid={Boolean(errors?.width)}
          />
        </Box>
      </Flex>
      <chakra.output
        htmlFor={`${lengthId} ${widthId}`}
        aria-live="polite"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="3"
        flexWrap="wrap"
        px="3.5"
        py="3"
        borderRadius="lg"
        bg={m2 > 0 && !disabled ? "primary.subtle" : "bg.muted"}
        color={m2 > 0 && !disabled ? "fg.heading" : "fg.muted"}
        textStyle="body.sm"
      >
        <span>Área calculada</span>
        <chakra.strong textStyle="heading.sm" css={{ fontVariantNumeric: "tabular-nums" }}>
          {m2 > 0 ? `${formatSquareMeters(m2)} · ${formatHectares(m2)}` : "Informe as duas medidas"}
        </chakra.strong>
      </chakra.output>
    </Fieldset.Root>
  );
}
