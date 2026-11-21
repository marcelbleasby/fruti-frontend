"use client";

import {
  DatePicker as ChakraDatePicker,
  Input,
  Portal,
  chakra,
  useFieldContext,
  type DatePickerRootProps,
} from "@chakra-ui/react";
import { CalendarDays } from "lucide-react";
import { Suspense, useId } from "react";
import { calendarContentStyles, CalendarViews } from "./calendar-views";
import { datePickerTranslations, toDateValue, toISODate, type ISODate } from "./date-utils";
import { FormField, resolveInvalid } from "./form-field";
import { splitFieldProps } from "./field-utils";
import type { FieldBaseProps } from "./types";

export interface DatePickerProps extends FieldBaseProps {
  /** Data ISO `YYYY-MM-DD` (null = vazio). */
  value?: ISODate | null;
  defaultValue?: ISODate;
  onValueChange?: (value: ISODate | null) => void;
  min?: ISODate;
  max?: ISODate;
  /** Padrão "dd/mm/aaaa". */
  placeholder?: string;
  name?: string;
  /** Datas indisponíveis (recebe ISO). */
  isDateUnavailable?: (date: ISODate) => boolean;
  /** Renderiza o calendário em Portal (padrão: true). */
  portalled?: boolean;
  positioning?: DatePickerRootProps["positioning"];
  onOpenChange?: (open: boolean) => void;
}

/** Input do DatePicker com aria-describedby do Field (ajuda/erro). */
function DateInput({ placeholder }: { placeholder: string }) {
  const field = useFieldContext();
  return (
    <ChakraDatePicker.Input asChild unstyled>
      <Input placeholder={placeholder} inputMode="numeric" pe="12" aria-describedby={field?.ariaDescribedby} />
    </ChakraDatePicker.Input>
  );
}

/** Reserva a altura do campo enquanto o calendário não monta no cliente. */
function DatePickerFallback() {
  return <chakra.div h="10" borderWidth="1px" borderColor="border.control" borderRadius="l2" bg="bg.panel" aria-hidden="true" />;
}

/**
 * DatePicker — DatePicker.Root (Chakra v3.38) com locale pt-BR: digite `dd/mm/aaaa`
 * ou escolha no calendário. Hoje tem contorno; a data escolhida, fundo verde.
 * Setas navegam entre dias, Page Up/Down entre meses.
 */
export function DatePicker(props: DatePickerProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    placeholder = "dd/mm/aaaa",
    name,
    isDateUnavailable,
    portalled = true,
    positioning,
    onOpenChange,
  } = rest;

  const autoId = useId();
  const controlId = fieldProps.id ?? `date-${autoId}`;
  const invalid = resolveInvalid(fieldProps.invalid, fieldProps.errorText);
  const controlled = value !== undefined ? toDateValue(value) : undefined;
  const initial = toDateValue(defaultValue);

  return (
    <FormField {...fieldProps} id={controlId}>
      {/* O Zag lê a data atual ao montar: o Suspense isola essa leitura no prerender (Cache Components). */}
      <Suspense fallback={<DatePickerFallback />}>
      <ChakraDatePicker.Root
        locale="pt-BR"
        startOfWeek={0}
        translations={datePickerTranslations}
        ids={{ input: () => controlId }}
        value={value !== undefined ? (controlled ? [controlled] : []) : undefined}
        defaultValue={initial ? [initial] : undefined}
        onValueChange={onValueChange ? (d) => onValueChange(toISODate(d.value[0])) : undefined}
        onOpenChange={onOpenChange ? (d) => onOpenChange(d.open) : undefined}
        min={toDateValue(min)}
        max={toDateValue(max)}
        isDateUnavailable={isDateUnavailable ? (date) => isDateUnavailable(toISODate(date) ?? "") : undefined}
        name={name}
        disabled={fieldProps.disabled}
        readOnly={fieldProps.readOnly}
        required={fieldProps.required}
        invalid={invalid}
        positioning={{ placement: "bottom-start", gutter: 4, ...positioning }}
        gap="0"
      >
        <ChakraDatePicker.Control>
          <DateInput placeholder={placeholder} />
          <ChakraDatePicker.IndicatorGroup insetEnd="0.5">
            <ChakraDatePicker.Trigger asChild unstyled>
              <chakra.button
                type="button"
                w="11"
                h="9"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="l2"
                color="fg.heading"
                cursor="pointer"
                _hover={{ bg: "bg.hover" }}
                _disabled={{ color: "fg.muted", cursor: "not-allowed", _hover: { bg: "transparent" } }}
                focusVisibleRing="inside"
              >
                <CalendarDays size={20} strokeWidth={1.75} aria-hidden="true" />
              </chakra.button>
            </ChakraDatePicker.Trigger>
          </ChakraDatePicker.IndicatorGroup>
        </ChakraDatePicker.Control>
        <Portal disabled={!portalled}>
          <ChakraDatePicker.Positioner>
            <ChakraDatePicker.Content css={calendarContentStyles}>
              <CalendarViews />
            </ChakraDatePicker.Content>
          </ChakraDatePicker.Positioner>
        </Portal>
      </ChakraDatePicker.Root>
      </Suspense>
    </FormField>
  );
}
