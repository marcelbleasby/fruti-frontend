"use client";

import { Flex, chakra } from "@chakra-ui/react";
import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form";
import type { FieldBaseProps } from "@/components/forms/types";
import { AreaMeasurementDisplay, AreaSelector } from "@/modules/areas";
import { areaSquareMeters, formatNumber, formatSquareMeters } from "../../format";
import type { Area, AreaId } from "../../types";

export interface PlantingAreaSelectorProps<T extends FieldValues>
  extends Omit<FieldBaseProps, "errorText" | "invalid"> {
  /** Campo do formulário (padrão no PlantingForm: "areaId"). */
  name: FieldPath<T>;
  control: Control<T>;
  areas: Area[];
  rules?: RegisterOptions<T, FieldPath<T>>;
  filter?: (area: Area) => boolean;
  isAreaDisabled?: (area: Area) => boolean;
  /** Esconde o resumo de medidas da área escolhida. */
  hideSummary?: boolean;
}

/** Resumo da área escolhida: desenho proporcional, dimensões, m² e situação. */
export function PlantingAreaSummary({ area }: { area: Area }) {
  const m2 = areaSquareMeters(area.length, area.width);
  const active = area.activePlantings ?? 0;
  return (
    <Flex
      align="center"
      gap="3"
      p="2.5"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="l2"
      aria-live="polite"
    >
      <AreaMeasurementDisplay length={area.length} width={area.width} size="sm" maxWidth={72} maxHeight={40} flex="none" />
      <Flex direction="column" gap="0.5" textStyle="body.sm" minW="0">
        <chakra.span color="fg" textStyle="label">
          {formatNumber(area.length)} m × {formatNumber(area.width)} m
        </chakra.span>
        <chakra.span color="fg.muted">
          {formatSquareMeters(m2)} · {active > 0 ? `${active} ${active === 1 ? "plantio em campo" : "plantios em campo"}` : "sem plantio em campo"}
        </chakra.span>
      </Flex>
    </Flex>
  );
}

/**
 * PlantingAreaSelector — AreaSelector ligado ao formulário, com o resumo da área escolhida.
 * `defaultAreaId` vem do `defaultValues` do formulário (ex.: "Novo plantio nesta área").
 * Chakra v3: AreaSelector + Field · AreaMeasurementDisplay (resumo).
 */
export function PlantingAreaSelector<T extends FieldValues>({
  name,
  control,
  areas,
  rules,
  hideSummary,
  label = "Área",
  required = true,
  ...rest
}: PlantingAreaSelectorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules ?? (required ? ({ required: "Selecione a área" } as RegisterOptions<T, FieldPath<T>>) : undefined)}
      render={({ field, fieldState }) => {
        const value = (field.value as AreaId | null | undefined) ?? null;
        const selected = value ? areas.find((a) => a.id === value) : undefined;
        return (
          <Flex direction="column" gap="2">
            <AreaSelector
              {...rest}
              label={label}
              required={required}
              areas={areas}
              name={field.name}
              value={value}
              onChange={(v) => field.onChange(v)}
              errorText={fieldState.error?.message}
            />
            {!hideSummary && selected && <PlantingAreaSummary area={selected} />}
          </Flex>
        );
      }}
    />
  );
}
