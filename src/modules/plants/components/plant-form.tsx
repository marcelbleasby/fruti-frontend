"use client";

import { Button, Flex, Grid, chakra, type HTMLChakraProps } from "@chakra-ui/react";
import { useId } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { FormErrorSummary, type FormErrorItem } from "@/components/forms/form-error-summary";
import { NumberInput } from "@/components/forms/number-input";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { TextInput } from "@/components/forms/text-input";
import { formatNumber } from "../../format";
import { FIELD_GRID_COLUMNS } from "../../layout";

export type PlantFormMode = "grupo" | "individual";

export interface PlantFormValues {
  mode: PlantFormMode;
  /** Grupo: nome (ex.: "Linhas 1 a 4"). */
  name: string;
  /** Grupo: quantidade de plantas (texto do campo numérico). */
  quantity: string;
  /** Individual: identificação (ex.: "M-07"). */
  code: string;
  /** Individual: papel/rótulo (ex.: "Matriz"). */
  label: string;
  /** Individual: linha e posição (texto do campo numérico). */
  row: string;
  position: string;
}

export type PlantFormSubmitValues = PlantFormValues & {
  quantityValue: number;
  rowValue: number | null;
  positionValue: number | null;
};

export interface PlantFormProps extends Omit<HTMLChakraProps<"form">, "onSubmit" | "children" | "defaultValue"> {
  plantingId: string;
  /** Código do plantio exibido no campo somente leitura (ex.: "PL-0042"). */
  plantingCode?: string;
  /** Plantas do plantio ainda sem registro (limite da quantidade do grupo). */
  remaining: number;
  defaultMode?: PlantFormMode;
  defaultValues?: Partial<PlantFormValues>;
  /** Esconde o seletor de modo (ex.: plantio só com controle agrupado). */
  lockMode?: boolean;
  onSubmit: (values: PlantFormSubmitValues, plantingId: string) => void | Promise<void>;
  onCancel?: () => void;
}

const MODE_ITEMS = [
  { value: "grupo", label: "Grupo" },
  { value: "individual", label: "Individual" },
];

function parseInteger(value: string): number {
  const n = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function optionalInteger(value: string): number | null {
  if (!value.trim()) return null;
  const n = parseInteger(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * PlantForm — controle misto: o mesmo formulário registra um grupo ou uma planta individual.
 * No modo Individual aparecem identificação, linha e posição.
 * Chakra v3: SegmentGroup · Field · NumberInput · Input (react-hook-form).
 */
export function PlantForm({
  plantingId,
  plantingCode,
  remaining,
  defaultMode = "grupo",
  defaultValues,
  lockMode,
  onSubmit,
  onCancel,
  ...rest
}: PlantFormProps) {
  const uid = useId();
  const idFor: Record<keyof PlantFormValues, string> = {
    mode: `${uid}-mode`,
    name: `${uid}-name`,
    quantity: `${uid}-quantity`,
    code: `${uid}-code`,
    label: `${uid}-label`,
    row: `${uid}-row`,
    position: `${uid}-position`,
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<PlantFormValues>({
    shouldUnregister: true,
    defaultValues: {
      mode: defaultMode,
      name: "",
      quantity: "",
      code: "",
      label: "",
      row: "",
      position: "",
      ...defaultValues,
    },
  });

  const mode = useWatch({ control, name: "mode" }) ?? defaultMode;
  const individual = mode === "individual";
  const remainingText = `Restam ${formatNumber(remaining)} ${remaining === 1 ? "planta" : "plantas"} sem registro neste plantio.`;

  const order: (keyof PlantFormValues)[] = ["name", "quantity", "code", "label", "row", "position"];
  const fieldErrors = errors as FieldErrors<PlantFormValues>;
  const summary: FormErrorItem[] = isSubmitted
    ? order.filter((k) => fieldErrors[k]?.message).map((k) => ({ fieldId: idFor[k], message: String(fieldErrors[k]?.message) }))
    : [];

  const onValid = (submitted: PlantFormValues) => {
    // Com `lockMode` o seletor não é montado e `shouldUnregister` descarta `mode`.
    const values = { ...submitted, mode: submitted.mode ?? defaultMode };
    return onSubmit(
      {
        ...values,
        quantityValue: values.mode === "individual" ? 1 : parseInteger(values.quantity),
        rowValue: optionalInteger(values.row ?? ""),
        positionValue: optionalInteger(values.position ?? ""),
      },
      plantingId,
    );
  };

  const positionRule = {
    validate: (v: string) => !v || parseInteger(v) > 0 || "Use um número maior que zero",
  };

  return (
    <chakra.form
      display="flex"
      flexDirection="column"
      gap="4"
      noValidate
      aria-label={individual ? "Registrar planta individual" : "Registrar grupo de plantas"}
      onSubmit={(event) => void handleSubmit(onValid)(event)}
      {...rest}
    >
      <FormErrorSummary errors={summary} />

      {!lockMode && (
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <SegmentedControl
              label="Tipo de registro"
              items={MODE_ITEMS}
              value={field.value}
              onValueChange={(v) => field.onChange((v ?? "grupo") as PlantFormMode)}
            />
          )}
        />
      )}

      {individual ? (
        <>
          <Grid templateColumns={FIELD_GRID_COLUMNS} gap="4" alignItems="start">
            <TextInput
              id={idFor.code}
              label="Identificação"
              required
              placeholder="M-07"
              autoComplete="off"
              errorText={fieldErrors.code?.message}
              {...register("code", { required: "Informe a identificação da planta" })}
            />
            <TextInput id={idFor.label} label="Papel" optional placeholder="Matriz" {...register("label")} />
          </Grid>
          <Grid templateColumns="repeat(auto-fit, minmax(min(100%, 140px), 1fr))" gap="4" alignItems="start">
            <Controller
              control={control}
              name="row"
              rules={positionRule}
              render={({ field, fieldState }) => (
                <NumberInput
                  id={idFor.row}
                  label="Linha"
                  optional
                  min={1}
                  inputMode="numeric"
                  value={field.value}
                  onValueChange={(d) => field.onChange(d.value)}
                  name={field.name}
                  errorText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="position"
              rules={positionRule}
              render={({ field, fieldState }) => (
                <NumberInput
                  id={idFor.position}
                  label="Posição"
                  optional
                  min={1}
                  inputMode="numeric"
                  value={field.value}
                  onValueChange={(d) => field.onChange(d.value)}
                  name={field.name}
                  errorText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <chakra.p m="0" textStyle="body.sm" color="fg.muted">
            {remainingText}
          </chakra.p>
        </>
      ) : (
        <Grid templateColumns={FIELD_GRID_COLUMNS} gap="4" alignItems="start">
          <TextInput
            id={idFor.name}
            label="Nome do grupo"
            required
            placeholder="Linhas 1 a 4"
            errorText={fieldErrors.name?.message}
            {...register("name", { required: "Informe o nome do grupo" })}
          />
          <Controller
            control={control}
            name="quantity"
            rules={{
              required: "Informe a quantidade de plantas",
              validate: (v) => {
                const n = parseInteger(v);
                if (!(n > 0)) return "Informe uma quantidade maior que zero";
                if (n > remaining) return `Quantidade excede as ${formatNumber(remaining)} plantas sem registro`;
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <NumberInput
                id={idFor.quantity}
                label="Quantidade de plantas"
                required
                min={1}
                max={remaining}
                inputMode="numeric"
                unit="plantas"
                value={field.value}
                onValueChange={(d) => field.onChange(d.value)}
                name={field.name}
                helperText={remainingText}
                errorText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
      )}

      {plantingCode && (
        <TextInput label="Plantio" value={plantingCode} readOnly fieldProps={{ maxW: { md: "50%" } }} />
      )}

      <Flex justify="flex-end" gap="2" wrap="wrap">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} loadingText="Registrando…" disabled={remaining <= 0}>
          {individual ? "Registrar planta" : "Registrar grupo"}
        </Button>
      </Flex>
    </chakra.form>
  );
}
