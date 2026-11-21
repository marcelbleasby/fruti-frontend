"use client";

import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form";
import type { FieldBaseProps } from "@/components/forms/types";
import { SpeciesSelector } from "@/modules/species";
import type { Species, SpeciesId } from "../../types";

export interface PlantingSpeciesSelectorProps<T extends FieldValues>
  extends Omit<FieldBaseProps, "errorText" | "invalid"> {
  /** Campo do formulário (padrão no PlantingForm: "speciesId"). */
  name: FieldPath<T>;
  control: Control<T>;
  species: Species[];
  /** Chamado quando a espécie muda (o CultivarSelector já limpa a cultivar). */
  onSpeciesChange?: (value: SpeciesId | null, species: Species | undefined) => void;
  rules?: RegisterOptions<T, FieldPath<T>>;
  allowCreate?: boolean;
  onCreate?: (query: string) => void;
}

/**
 * PlantingSpeciesSelector — liga o SpeciesSelector do catálogo ao estado do formulário de plantio.
 * Chakra v3: SpeciesSelector + Field (react-hook-form).
 */
export function PlantingSpeciesSelector<T extends FieldValues>({
  name,
  control,
  species,
  onSpeciesChange,
  rules,
  label = "Espécie",
  required = true,
  ...rest
}: PlantingSpeciesSelectorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules ?? (required ? ({ required: "Selecione a espécie" } as RegisterOptions<T, FieldPath<T>>) : undefined)}
      render={({ field, fieldState }) => (
        <SpeciesSelector
          {...rest}
          label={label}
          required={required}
          species={species}
          name={field.name}
          value={(field.value as SpeciesId | null | undefined) ?? null}
          onChange={(value, item) => {
            field.onChange(value);
            onSpeciesChange?.(value, item);
          }}
          errorText={fieldState.error?.message}
        />
      )}
    />
  );
}
