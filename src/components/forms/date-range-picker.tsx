"use client";

import {
  Box,
  Button,
  DatePicker as ChakraDatePicker,
  Flex,
  Input,
  Popover,
  Portal,
  Stack,
  Text,
  chakra,
  type DateValue,
  type PopoverRootProps,
} from "@chakra-ui/react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Suspense, useId, useState, type ReactNode } from "react";
import { calendarStyles, CalendarViews } from "./calendar-views";
import { datePickerTranslations, formatISODate, toDateValue, todayISO, toISODate, type ISODate } from "./date-utils";
import { FormField } from "./form-field";
import { messageFontSize, triggerStyles } from "./styles";
import type { FieldBaseProps } from "./types";

export interface DateRangeValue {
  start: ISODate | null;
  end: ISODate | null;
  /** Preset escolhido (`value` do preset) — "custom" quando editado à mão. */
  preset?: string;
}

export interface DateRangePreset {
  value: string;
  label: string;
  /** Calcula o intervalo a partir de hoje (ISO). Ausente = "Personalizado". */
  getRange?: (today: ISODate) => { start: ISODate; end: ISODate };
}

export const CUSTOM_RANGE_PRESET = "custom";

const shift = (iso: ISODate, fn: (d: DateValue) => DateValue) => {
  const d = toDateValue(iso);
  return d ? (toISODate(fn(d)) ?? iso) : iso;
};

/** Presets padrão (pt-BR). Acrescente os do domínio (ex.: "Safra 2026"). */
export const defaultDateRangePresets: DateRangePreset[] = [
  { value: "last-30-days", label: "Últimos 30 dias", getRange: (t) => ({ start: shift(t, (d) => d.subtract({ days: 29 })), end: t }) },
  {
    value: "last-12-months",
    label: "Últimos 12 meses",
    getRange: (t) => ({ start: shift(t, (d) => d.subtract({ years: 1 }).add({ days: 1 })), end: t }),
  },
  { value: "this-year", label: "Este ano", getRange: (t) => ({ start: `${t.slice(0, 4)}-01-01`, end: t }) },
  { value: CUSTOM_RANGE_PRESET, label: "Personalizado" },
];

/** Número de dias (inclusivo) entre duas datas ISO. */
export function countRangeDays(start: ISODate, end: ISODate): number {
  const s = toDateValue(start);
  const e = toDateValue(end);
  return s && e ? e.compare(s) + 1 : 0;
}

/** Período anterior de mesmo tamanho (para comparação). */
export function previousRange(start: ISODate, end: ISODate): { start: ISODate; end: ISODate } {
  const days = countRangeDays(start, end);
  return { start: shift(start, (d) => d.subtract({ days })), end: shift(end, (d) => d.subtract({ days })) };
}

export interface DateRangePickerProps
  extends Pick<FieldBaseProps, "label" | "helperText" | "errorText" | "invalid" | "disabled" | "required" | "id" | "fieldProps" | "hideLabel"> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  /** Disparado ao clicar em "Aplicar". */
  onValueChange?: (value: DateRangeValue) => void;
  presets?: DateRangePreset[];
  /** Texto do gatilho quando vazio. */
  placeholder?: string;
  /** Linha de resumo; padrão "n dias", ou com comparação se `showComparison`. */
  summary?: (range: { start: ISODate; end: ISODate }) => ReactNode;
  /** Mostra "· compara com <período anterior>" no resumo. */
  showComparison?: boolean;
  min?: ISODate;
  max?: ISODate;
  applyLabel?: string;
  cancelLabel?: string;
  positioning?: PopoverRootProps["positioning"];
}

const EMPTY: DateRangeValue = { start: null, end: null };

/**
 * DateRangePicker — Popover com presets, início/fim (DatePicker em modo range,
 * calendário no "Personalizado"), resumo e Cancelar/Aplicar. Usado em ReportFilters.
 */
export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    presets = defaultDateRangePresets,
    placeholder = "Selecione o período",
    summary,
    showComparison,
    min,
    max,
    applyLabel = "Aplicar",
    cancelLabel = "Cancelar",
    positioning,
    ...fieldProps
  } = props;

  const autoId = useId();
  const triggerId = fieldProps.id ?? `range-${autoId}`;
  const [inner, setInner] = useState<DateRangeValue>(defaultValue ?? EMPTY);
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(current);

  const openChange = (next: boolean) => {
    if (next) setDraft(current);
    setOpen(next);
  };

  const pickPreset = (preset: DateRangePreset) => {
    if (preset.getRange) {
      const range = preset.getRange(todayISO());
      setDraft({ ...range, preset: preset.value });
    } else {
      setDraft((d) => ({ ...d, preset: preset.value }));
    }
  };

  const apply = () => {
    if (value === undefined) setInner(draft);
    onValueChange?.(draft);
    setOpen(false);
  };

  const presetLabel = presets.find((p) => p.value === current.preset && p.getRange)?.label;
  const triggerText =
    presetLabel ??
    (current.start && current.end ? `${formatISODate(current.start)} – ${formatISODate(current.end)}` : placeholder);

  const isCustom = draft.preset === CUSTOM_RANGE_PRESET || !presets.some((p) => p.value === draft.preset);
  const draftValues = [toDateValue(draft.start), toDateValue(draft.end)].filter((d): d is DateValue => Boolean(d));
  const complete = Boolean(draft.start && draft.end);

  let summaryNode: ReactNode = null;
  if (draft.start && draft.end) {
    const range = { start: draft.start, end: draft.end };
    if (summary) summaryNode = summary(range);
    else {
      const days = countRangeDays(range.start, range.end);
      const prev = previousRange(range.start, range.end);
      summaryNode = `${days} ${days === 1 ? "dia" : "dias"}${
        showComparison ? ` · compara com ${formatISODate(prev.start)} – ${formatISODate(prev.end)}` : ""
      }`;
    }
  }

  const dateField = (index: 0 | 1, label: string) => (
    <Stack gap="1.5" flex="1 1 120px" minW="0">
      <Text as="span" textStyle="label" color="fg" aria-hidden="true">
        {label}
      </Text>
      <Box position="relative">
        <chakra.span position="absolute" insetStart="3" top="50%" transform="translateY(-50%)" color="fg.muted" display="flex" pointerEvents="none" zIndex="1" aria-hidden="true">
          <CalendarDays size={20} strokeWidth={1.75} />
        </chakra.span>
        <ChakraDatePicker.Input index={index} asChild unstyled>
          <Input inputMode="numeric" placeholder="dd/mm/aaaa" ps="10" aria-label={label} />
        </ChakraDatePicker.Input>
      </Box>
    </Stack>
  );

  return (
    <FormField {...fieldProps} id={triggerId}>
      <Popover.Root
        open={open}
        onOpenChange={(d) => openChange(d.open)}
        ids={{ trigger: triggerId }}
        positioning={{ placement: "bottom-start", gutter: 4, ...positioning }}
        lazyMount
        unmountOnExit
      >
        <Popover.Trigger asChild>
          <chakra.button type="button" css={triggerStyles} disabled={fieldProps.disabled} data-placeholder-shown={!presetLabel && !current.start ? "" : undefined}>
            <chakra.span display="flex" alignItems="center" gap="2" minW="0">
              <chakra.span color="fg.muted" display="flex" aria-hidden="true">
                <CalendarDays size={20} strokeWidth={1.75} />
              </chakra.span>
              <chakra.span overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {triggerText}
              </chakra.span>
            </chakra.span>
            <chakra.span color="fg.muted" display="flex" aria-hidden="true">
              <ChevronDown size={20} strokeWidth={1.75} />
            </chakra.span>
          </chakra.button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content w="auto" maxW="calc(100vw - 32px)" borderRadius="l3" borderWidth="1px" borderColor="border" boxShadow="lg" bg="bg.panel">
              <Popover.Body p="4">
                <Flex direction={{ base: "column", md: "row" }} gap="3.5" align="flex-start">
                  <Stack
                    role="listbox"
                    aria-label="Períodos prontos"
                    as="ul"
                    gap="0.5"
                    flex={{ base: "none", md: "0 0 160px" }}
                    w={{ base: "full", md: "auto" }}
                    m="0"
                    p="0"
                  >
                    {presets.map((preset) => {
                      const selected = draft.preset === preset.value || (preset.value === CUSTOM_RANGE_PRESET && isCustom);
                      return (
                        <chakra.li key={preset.value} listStyleType="none">
                          <chakra.button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => pickPreset(preset)}
                            w="full"
                            minH="9"
                            px="2.5"
                            borderRadius="l2"
                            textAlign="start"
                            textStyle="body.sm"
                            cursor="pointer"
                            color={selected ? "fg.heading" : "fg"}
                            fontWeight={selected ? "600" : "normal"}
                            bg={selected ? "primary.subtle" : "transparent"}
                            _hover={{ bg: selected ? "primary.subtle" : "bg.hover" }}
                            focusVisibleRing="inside"
                          >
                            {preset.label}
                          </chakra.button>
                        </chakra.li>
                      );
                    })}
                  </Stack>

                  <Stack flex="1" gap="2.5" minW={{ md: "300px" }} w={{ base: "full", md: "auto" }}>
                    <Suspense fallback={null}>
                    <ChakraDatePicker.Root
                      selectionMode="range"
                      inline
                      locale="pt-BR"
                      startOfWeek={0}
                      translations={datePickerTranslations}
                      value={draftValues}
                      onValueChange={(d) =>
                        setDraft({
                          start: toISODate(d.value[0]),
                          end: toISODate(d.value[1]),
                          preset: CUSTOM_RANGE_PRESET,
                        })
                      }
                      min={toDateValue(min)}
                      max={toDateValue(max)}
                      gap="2.5"
                    >
                      <ChakraDatePicker.Control display="flex" flexWrap="wrap" gap="2.5" alignItems="flex-end">
                        {dateField(0, "Início")}
                        {dateField(1, "Fim")}
                      </ChakraDatePicker.Control>
                      {isCustom && (
                        <ChakraDatePicker.Content unstyled css={calendarStyles} display="flex" flexDirection="column" gap="2">
                          <CalendarViews />
                        </ChakraDatePicker.Content>
                      )}
                    </ChakraDatePicker.Root>
                    </Suspense>

                    {summaryNode != null && (
                      <Text fontSize={messageFontSize} color="fg.muted" aria-live="polite">
                        {summaryNode}
                      </Text>
                    )}

                    <Flex justify="flex-end" gap="2">
                      <Button variant="ghost" size="sm" h="9" onClick={() => openChange(false)}>
                        {cancelLabel}
                      </Button>
                      <Button size="sm" h="9" onClick={apply} disabled={!complete}>
                        {applyLabel}
                      </Button>
                    </Flex>
                  </Stack>
                </Flex>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </FormField>
  );
}
