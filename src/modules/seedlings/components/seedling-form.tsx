"use client";

import { Button, Flex, Grid, chakra, type HTMLChakraProps } from "@chakra-ui/react";
import { useId, useMemo } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { DatePicker } from "@/components/forms/date-picker";
import { FormErrorSummary, type FormErrorItem } from "@/components/forms/form-error-summary";
import { NativeSelectField } from "@/components/forms/native-select-field";
import { NumberInput } from "@/components/forms/number-input";
import { Select } from "@/components/forms/select";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import type { FieldOption } from "@/components/forms/types";
import { useTodayISO } from "@/hooks/useTodayISO";
import { formatNumber } from "@/modules/format";
import type { SeedlingOriginType } from "@/modules/types";
import { SeedlingOriginSelector } from "./seedling-origin-selector";
import { FIELD_GRID_COLUMNS } from "../../layout";

export interface SeedlingFormValues {
  type: SeedlingOriginType;
  /** Código do lote (ex.: "LM-2026-014"). Vazio = gerado pelo backend. */
  code: string;
  speciesId: string | null;
  cultivarId: string | null;
  /** Quantidade como texto do campo numérico (pt-BR). */
  quantity: string;
  /** Unidade da quantidade: "mudas" para mudas; "sementes", "g" ou "kg" para sementes. */
  unit: string;
  receivedAt: string | null;
  supplier: string;
}

export interface SeedlingFormProps extends Omit<HTMLChakraProps<"form">, "onSubmit" | "children" | "defaultValue"> {
  mode?: "create" | "edit";
  defaultValues?: Partial<SeedlingFormValues>;
  /** Espécies do catálogo (value = SpeciesId, description = nome científico). */
  speciesOptions: FieldOption[];
  /** Cultivares da espécie escolhida. */
  getCultivarOptions?: (speciesId: string) => FieldOption[];
  onSubmit: (values: SeedlingFormValues & { quantityValue: number }) => void | Promise<void>;
  onCancel?: () => void;
  /** Rótulo do botão principal (padrão "Salvar lote"). */
  submitLabel?: string;
  /**
   * Quantidade já utilizada em plantios (edição). A quantidade recebida não pode
   * ficar abaixo dela, e o tipo de material deixa de poder mudar.
   */
  usedQuantity?: number;
}

export const SEED_UNIT_OPTIONS: FieldOption[] = [
  { value: "sementes", label: "sementes" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
];

function parseQuantity(value: string): number {
  const n = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}


/**
 * SeedlingForm — cadastro/edição de lote de sementes ou mudas. Começa pelo tipo de
 * material; para sementes, a unidade da quantidade muda conforme o lote.
 * Chakra v3: form · RadioCard · Field · NumberInput · Textarea (react-hook-form).
 */
export function SeedlingForm({
  mode = "create",
  defaultValues,
  speciesOptions,
  getCultivarOptions,
  onSubmit,
  onCancel,
  submitLabel = "Salvar lote",
  usedQuantity = 0,
  ...rest
}: SeedlingFormProps) {
  const typeLocked = mode === "edit" && usedQuantity > 0;
  const today = useTodayISO();
  const uid = useId();
  const ids = {
    type: `${uid}-type`,
    code: `${uid}-code`,
    species: `${uid}-species`,
    cultivar: `${uid}-cultivar`,
    quantity: `${uid}-quantity`,
    unit: `${uid}-unit`,
    receivedAt: `${uid}-received`,
    supplier: `${uid}-supplier`,
  };

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SeedlingFormValues>({
    defaultValues: {
      type: "mudas",
      code: "",
      speciesId: null,
      cultivarId: null,
      quantity: "",
      unit: "mudas",
      receivedAt: null,
      supplier: "",
      ...defaultValues,
    },
  });

  const type = useWatch({ control, name: "type" });
  const unit = useWatch({ control, name: "unit" });
  const massUnit = unit === "g" || unit === "kg";
  const speciesId = useWatch({ control, name: "speciesId" });
  const cultivarOptions = useMemo(
    () => (speciesId && getCultivarOptions ? getCultivarOptions(speciesId) : []),
    [speciesId, getCultivarOptions],
  );

  const fieldOrder: (keyof SeedlingFormValues)[] = ["type", "code", "speciesId", "cultivarId", "quantity", "unit", "receivedAt", "supplier"];
  const idFor: Record<keyof SeedlingFormValues, string> = {
    type: ids.type,
    code: ids.code,
    speciesId: ids.species,
    cultivarId: ids.cultivar,
    quantity: ids.quantity,
    unit: ids.unit,
    receivedAt: ids.receivedAt,
    supplier: ids.supplier,
  };
  const summary: FormErrorItem[] = isSubmitted
    ? fieldOrder
        .filter((k) => (errors as FieldErrors<SeedlingFormValues>)[k]?.message)
        .map((k) => ({ fieldId: idFor[k], message: String(errors[k]?.message) }))
    : [];

  const submit = handleSubmit((values) => onSubmit({ ...values, quantityValue: parseQuantity(values.quantity) }));

  return (
    <chakra.form display="flex" flexDirection="column" gap="5" noValidate onSubmit={submit} aria-label={mode === "create" ? "Novo lote" : "Editar lote"} {...rest}>
      <FormErrorSummary errors={summary} />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <SeedlingOriginSelector
            id={ids.type}
            required
            disabled={typeLocked}
            helperText={typeLocked ? "O lote já foi usado em plantios: o tipo não pode mudar." : undefined}
            name={field.name}
            value={field.value}
            onChange={(v) => {
              field.onChange(v);
              setValue("unit", v === "mudas" ? "mudas" : "sementes");
            }}
          />
        )}
      />

      <TextInput
        id={ids.code}
        label="Código do lote"
        placeholder={type === "mudas" ? "LM-2026-000" : "SM-2026-000"}
        helperText={mode === "create" ? "Deixe em branco para gerar automaticamente." : undefined}
        {...register("code")}
      />

      <Grid templateColumns={FIELD_GRID_COLUMNS} gap="4" alignItems="start">
        <Controller
          control={control}
          name="speciesId"
          rules={{ required: "Selecione a espécie" }}
          render={({ field, fieldState }) => (
            <Select
              id={ids.species}
              label="Espécie"
              required
              options={speciesOptions}
              value={field.value}
              onValueChange={(v) => {
                if (v !== field.value) setValue("cultivarId", null);
                field.onChange(v);
              }}
              errorText={fieldState.error?.message}
              name={field.name}
            />
          )}
        />
        <Controller
          control={control}
          name="cultivarId"
          render={({ field }) => (
            <Select
              id={ids.cultivar}
              label="Cultivo"
              optional
              options={cultivarOptions}
              value={field.value}
              onValueChange={field.onChange}
              disabled={!speciesId}
              helperText={speciesId ? undefined : "Selecione uma espécie primeiro"}
              placeholder={speciesId ? "Selecione" : "—"}
              clearable
              name={field.name}
            />
          )}
        />
      </Grid>

      <Grid templateColumns={FIELD_GRID_COLUMNS} gap="4" alignItems="start">
        <Flex gap="2" align="flex-start">
          <Controller
            control={control}
            name="quantity"
            rules={{
              required: "Informe a quantidade recebida",
              validate: (v) => {
                const n = parseQuantity(v);
                if (!(n > 0)) return "Informe uma quantidade maior que zero";
                if (n < usedQuantity) return `A quantidade não pode ficar abaixo das ${formatNumber(usedQuantity)} já utilizadas em plantios`;
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <NumberInput
                id={ids.quantity}
                label="Quantidade recebida"
                required
                min={0}
                value={field.value}
                onValueChange={(d) => field.onChange(d.value)}
                unit={type === "mudas" ? "mudas" : undefined}
                errorText={fieldState.error?.message}
                name={field.name}
                inputMode={massUnit ? "decimal" : "numeric"}
                fieldProps={{ flex: "1" }}
              />
            )}
          />
          {type === "sementes" && (
            <NativeSelectField
              id={ids.unit}
              label="Unidade"
              options={SEED_UNIT_OPTIONS}
              fieldProps={{ w: "32", flex: "none" }}
              {...register("unit")}
            />
          )}
        </Flex>
        <Controller
          control={control}
          name="receivedAt"
          rules={{ required: "Informe a data de recebimento" }}
          render={({ field, fieldState }) => (
            <DatePicker
              id={ids.receivedAt}
              label="Data de recebimento"
              required
              max={today}
              value={field.value}
              onValueChange={field.onChange}
              errorText={fieldState.error?.message}
              name={field.name}
            />
          )}
        />
      </Grid>

      <Textarea id={ids.supplier} label="Procedência" optional rows={2} placeholder="Viveiro, fornecedor ou safra de origem" {...register("supplier")} />

      <Flex justify="flex-end" gap="2" pt="1" wrap="wrap">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} loadingText="Salvando…">
          {submitLabel}
        </Button>
      </Flex>
    </chakra.form>
  );
}
