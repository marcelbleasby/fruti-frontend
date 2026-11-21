"use client";

import { Box, Button, Flex, Grid, chakra, type HTMLChakraProps } from "@chakra-ui/react";
import { useId, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { DatePicker } from "@/components/forms/date-picker";
import { FormErrorSummary, type FormErrorItem } from "@/components/forms/form-error-summary";
import { FormFieldset } from "@/components/forms/form-fieldset";
import { NumberInput } from "@/components/forms/number-input";
import { RadioGroup } from "@/components/forms/radio-group";
import { Textarea } from "@/components/forms/textarea";
import { SeedlingBatchSelector, SeedlingOriginSelector, batchAvailable, batchUnit } from "@/modules/seedlings";
import { formatNumber } from "../../format";
import type {
  Area,
  AreaId,
  BatchId,
  Cultivar,
  CultivarId,
  PlantControlMode,
  SeedlingBatch,
  SeedlingOriginType,
  Species,
  SpeciesId,
} from "../../types";
import { PLANT_CONTROL_DESCRIPTION, PLANT_CONTROL_LABEL, createIdempotencyKey } from "../utils";
import { PlantingAreaSelector } from "./planting-area-selector";
import { PlantingCultivarSelector } from "./planting-cultivar-selector";
import { PlantingSpeciesSelector } from "./planting-species-selector";
import { FIELD_GRID_COLUMNS } from "../../layout";

export interface PlantingFormValues {
  speciesId: SpeciesId | null;
  cultivarId: CultivarId | null;
  areaId: AreaId | null;
  originType: SeedlingOriginType | null;
  batchId: BatchId | null;
  /** Quantidade de plantas como texto do campo numérico (pt-BR). */
  plants: string;
  /** Data de plantio ISO `YYYY-MM-DD`. */
  plantedAt: string | null;
  control: PlantControlMode;
  notes: string;
}

export type PlantingFormSubmitValues = PlantingFormValues & { plantsValue: number };

export interface PlantingFormSubmitMeta {
  /** Mesma chave em todas as tentativas do mesmo envio; renovada após sucesso. */
  idempotencyKey: string;
}

export interface PlantingFormProps extends Omit<HTMLChakraProps<"form">, "onSubmit" | "children" | "defaultValue"> {
  mode?: "create" | "edit";
  /** Na edição, chega preenchido. `areaId` aqui = área vinda da página da área. */
  defaultValues?: Partial<PlantingFormValues>;
  species: Species[];
  cultivars: Cultivar[];
  areas: Area[];
  batches: SeedlingBatch[];
  /** Server action / chamada à API. Lance um erro para manter o formulário e a chave. */
  onSubmit: (values: PlantingFormSubmitValues, meta: PlantingFormSubmitMeta) => void | Promise<void>;
  onCancel?: () => void;
  /** Rótulo do botão principal (padrão "Salvar plantio" / "Salvar alterações"). */
  submitLabel?: string;
}

type SectionKey = "species" | "area" | "origin" | "date" | "notes";

interface SectionDef {
  key: SectionKey;
  title: string;
  fields: (keyof PlantingFormValues)[];
  required: (keyof PlantingFormValues)[];
}

const SECTIONS: SectionDef[] = [
  { key: "species", title: "Espécie e cultivar", fields: ["speciesId", "cultivarId"], required: ["speciesId"] },
  { key: "area", title: "Área", fields: ["areaId"], required: ["areaId"] },
  { key: "origin", title: "Origem do material", fields: ["originType", "batchId", "plants"], required: ["originType", "plants"] },
  { key: "date", title: "Data e controle", fields: ["plantedAt", "control"], required: ["plantedAt", "control"] },
  { key: "notes", title: "Observações", fields: ["notes"], required: [] },
];

const FIELD_ORDER: (keyof PlantingFormValues)[] = SECTIONS.flatMap((s) => s.fields);

const CONTROL_OPTIONS = (Object.keys(PLANT_CONTROL_LABEL) as PlantControlMode[]).map((value) => ({
  value,
  label: PLANT_CONTROL_LABEL[value],
  description: PLANT_CONTROL_DESCRIPTION[value],
}));

function parseQuantity(value: string): number {
  const n = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}


function isFilled(value: unknown): boolean {
  return value != null && value !== "";
}

type SectionState = "complete" | "error" | "pending";

function SectionIndicator({ index, state }: { index: number; state: SectionState }) {
  const styles: Record<SectionState, { bg: string; color: string }> = {
    complete: { bg: "primary", color: "fg.inverted" },
    error: { bg: "danger.subtle", color: "red.800" },
    pending: { bg: "bg.muted", color: "fg.muted" },
  };
  return (
    <chakra.span
      boxSize="6"
      flex="none"
      borderRadius="full"
      textStyle="caption"
      fontWeight="700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-hidden="true"
      {...styles[state]}
    >
      {state === "error" ? "!" : index + 1}
    </chakra.span>
  );
}

function Section({
  id,
  index,
  title,
  state,
  onFocus,
  children,
}: {
  id: string;
  index: number;
  title: string;
  state: SectionState;
  onFocus: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      id={id}
      bg="bg.panel"
      borderWidth="1px"
      borderColor={state === "error" ? "border.error" : "border"}
      borderRadius="l3"
      boxShadow="xs"
      p={{ base: "4", md: "5" }}
      scrollMarginTop="6"
      onFocusCapture={onFocus}
    >
      <FormFieldset
        legend={
          <Flex as="span" align="center" gap="2.5">
            <SectionIndicator index={index} state={state} />
            {title}
            {state === "error" && <chakra.span srOnly> (contém erro)</chakra.span>}
          </Flex>
        }
        contentGap="4"
      >
        {children}
      </FormFieldset>
    </Box>
  );
}

/**
 * PlantingForm — cadastro/edição de plantio em 5 seções, com navegação lateral que indica
 * seções concluídas e com erro, FormErrorSummary e envio com chave de idempotência.
 * A estrutura não restringe a área a um plantio ativo (comporta plantios simultâneos no futuro).
 * Chakra v3: form · Fieldset · Field · FormErrorSummary · Button (submit) — react-hook-form.
 */
export function PlantingForm({
  mode = "create",
  defaultValues,
  species,
  cultivars,
  areas,
  batches,
  onSubmit,
  onCancel,
  submitLabel,
  ...rest
}: PlantingFormProps) {
  const uid = useId();
  const sectionId = (key: SectionKey) => `${uid}-section-${key}`;
  const idFor: Record<keyof PlantingFormValues, string> = {
    speciesId: `${uid}-species`,
    cultivarId: `${uid}-cultivar`,
    areaId: `${uid}-area`,
    originType: `${uid}-origin`,
    batchId: `${uid}-batch`,
    plants: `${uid}-plants`,
    plantedAt: `${uid}-planted-at`,
    control: `${uid}-control`,
    notes: `${uid}-notes`,
  };

  const idempotencyKey = useRef<string | null>(null);
  const [current, setCurrent] = useState<SectionKey>("species");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<PlantingFormValues>({
    defaultValues: {
      speciesId: null,
      cultivarId: null,
      areaId: null,
      originType: null,
      batchId: null,
      plants: "",
      plantedAt: null,
      control: "agrupado",
      notes: "",
      ...defaultValues,
    },
  });

  const values = useWatch({ control }) as Partial<PlantingFormValues>;
  const speciesId = values.speciesId ?? null;
  const originType = values.originType ?? null;
  const batchId = values.batchId ?? null;
  const speciesName = speciesId ? species.find((s) => s.id === speciesId)?.name : undefined;
  const batch = batchId ? batches.find((b) => b.id === batchId) : undefined;
  const unit = batch ? batchUnit(batch) : originType === "sementes" ? "sementes" : "plantas";

  const fieldErrors = errors as FieldErrors<PlantingFormValues>;
  const sectionState = (s: SectionDef): SectionState => {
    if (isSubmitted && s.fields.some((f) => fieldErrors[f])) return "error";
    const required = s.required.length ? s.required : s.fields;
    return required.every((f) => isFilled(values[f])) ? "complete" : "pending";
  };

  const summary: FormErrorItem[] = isSubmitted
    ? FIELD_ORDER.filter((k) => fieldErrors[k]?.message).map((k) => ({
        fieldId: idFor[k],
        message: String(fieldErrors[k]?.message),
      }))
    : [];

  const onValid = async (formValues: PlantingFormValues) => {
    idempotencyKey.current ??= createIdempotencyKey();
    setSubmitError(null);
    try {
      await onSubmit(
        { ...formValues, plantsValue: parseQuantity(formValues.plants) },
        { idempotencyKey: idempotencyKey.current },
      );
      idempotencyKey.current = null;
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : "Tente de novo em instantes.");
    }
  };

  const sectionProps = (s: SectionDef, index: number) => ({
    id: sectionId(s.key),
    index,
    title: s.title,
    state: sectionState(s),
    onFocus: () => setCurrent(s.key),
  });

  return (
    <chakra.form
      noValidate
      onSubmit={(event) => void handleSubmit(onValid)(event)}
      aria-label={mode === "create" ? "Novo plantio" : "Editar plantio"}
      aria-busy={isSubmitting || undefined}
      {...rest}
    >
      <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "192px minmax(0, 1fr)" }} gap={{ base: "4", md: "5" }} alignItems="start">
        <chakra.nav aria-label="Seções do formulário" display={{ base: "none", md: "block" }} position="sticky" top="4">
          <chakra.ol m="0" p="0" listStyleType="none" display="flex" flexDirection="column" gap="0.5">
            {SECTIONS.map((s, i) => {
              const state = sectionState(s);
              const isCurrent = current === s.key;
              return (
                <li key={s.key}>
                  <chakra.a
                    href={`#${sectionId(s.key)}`}
                    onClick={() => setCurrent(s.key)}
                    aria-current={isCurrent ? "step" : undefined}
                    display="flex"
                    alignItems="center"
                    gap="2.5"
                    minH="10"
                    px="2.5"
                    borderRadius="l2"
                    textDecoration="none"
                    textStyle="body.sm"
                    color={isCurrent ? "fg.heading" : "fg"}
                    fontWeight={isCurrent ? "600" : "400"}
                    bg={isCurrent ? "primary.subtle" : "transparent"}
                    _hover={{ bg: isCurrent ? "primary.subtle" : "bg.hover" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "primary", outlineOffset: "2px" }}
                  >
                    <SectionIndicator index={i} state={state} />
                    {s.title}
                    {state === "error" && <chakra.span srOnly> (contém erro)</chakra.span>}
                  </chakra.a>
                </li>
              );
            })}
          </chakra.ol>
        </chakra.nav>

        <Flex direction="column" gap="4" minW="0">
          <FormErrorSummary errors={summary} />
          {submitError && (
            <Alert status="error" title="Não foi possível salvar o plantio" description={submitError} />
          )}

          <Section {...sectionProps(SECTIONS[0], 0)}>
            <Grid templateColumns={FIELD_GRID_COLUMNS} gap="4" alignItems="start">
              <PlantingSpeciesSelector<PlantingFormValues>
                id={idFor.speciesId}
                name="speciesId"
                control={control}
                species={species}
              />
              <PlantingCultivarSelector<PlantingFormValues>
                id={idFor.cultivarId}
                name="cultivarId"
                control={control}
                speciesId={speciesId}
                speciesName={speciesName}
                cultivars={cultivars}
              />
            </Grid>
          </Section>

          <Section {...sectionProps(SECTIONS[1], 1)}>
            <PlantingAreaSelector<PlantingFormValues> id={idFor.areaId} name="areaId" control={control} areas={areas} />
          </Section>

          <Section {...sectionProps(SECTIONS[2], 2)}>
            <Controller
              control={control}
              name="originType"
              rules={{ required: "Selecione o tipo de material" }}
              render={({ field, fieldState }) => (
                <SeedlingOriginSelector
                  id={idFor.originType}
                  required
                  name={field.name}
                  value={field.value}
                  onChange={(v) => {
                    if (v !== field.value) setValue("batchId", null);
                    field.onChange(v);
                  }}
                  errorText={fieldState.error?.message}
                />
              )}
            />
            <Grid templateColumns={FIELD_GRID_COLUMNS} gap="4" alignItems="start">
              <Controller
                control={control}
                name="batchId"
                render={({ field }) => (
                  <SeedlingBatchSelector
                    id={idFor.batchId}
                    label="Lote"
                    optional
                    batches={batches}
                    type={originType ?? undefined}
                    speciesId={speciesId}
                    disabled={!originType}
                    helperText={originType ? undefined : "Escolha o tipo de material primeiro"}
                    name={field.name}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                  />
                )}
              />
              <Controller
                control={control}
                name="plants"
                rules={{
                  required: "Informe a quantidade de plantas",
                  validate: (v) => {
                    const n = parseQuantity(v);
                    if (!(n > 0)) return "Informe uma quantidade maior que zero";
                    if (mode === "create" && batch && n > batchAvailable(batch)) {
                      return `Quantidade excede as ${formatNumber(batchAvailable(batch))} ${batchUnit(batch)} do lote`;
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <NumberInput
                    id={idFor.plants}
                    label="Quantidade"
                    required
                    min={1}
                    value={field.value}
                    onValueChange={(d) => field.onChange(d.value)}
                    unit={unit}
                    inputMode="numeric"
                    name={field.name}
                    helperText={batch ? `${formatNumber(batchAvailable(batch))} ${batchUnit(batch)} livres no lote` : undefined}
                    errorText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Section>

          <Section {...sectionProps(SECTIONS[3], 3)}>
            <Controller
              control={control}
              name="plantedAt"
              rules={{ required: "Informe a data de plantio" }}
              render={({ field, fieldState }) => (
                <DatePicker
                  id={idFor.plantedAt}
                  label="Data de plantio"
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                  name={field.name}
                  errorText={fieldState.error?.message}
                  fieldProps={{ maxW: { md: "280px" } }}
                />
              )}
            />
            <Controller
              control={control}
              name="control"
              rules={{ required: "Escolha como as plantas serão controladas" }}
              render={({ field, fieldState }) => (
                <RadioGroup
                  id={idFor.control}
                  label="Controle das plantas"
                  required
                  options={CONTROL_OPTIONS}
                  name={field.name}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                  errorText={fieldState.error?.message}
                />
              )}
            />
          </Section>

          <Section {...sectionProps(SECTIONS[4], 4)}>
            <Textarea
              id={idFor.notes}
              label="Observações"
              optional
              rows={3}
              maxLength={1000}
              showCount
              placeholder="Espaçamento, irrigação, condições do plantio…"
              {...register("notes")}
            />
          </Section>

          <Flex justify="flex-end" gap="2" wrap="wrap">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
            )}
            <Button type="submit" loading={isSubmitting} loadingText="Salvando…">
              {submitLabel ?? (mode === "create" ? "Salvar plantio" : "Salvar alterações")}
            </Button>
          </Flex>
        </Flex>
      </Grid>
    </chakra.form>
  );
}
