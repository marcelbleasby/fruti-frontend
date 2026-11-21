"use client";

import { Flex, Slider as ChakraSlider, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FormField } from "./form-field";
import { splitFieldProps } from "./field-utils";
import type { FieldBaseProps } from "./types";

export type SliderMark = number | { value: number; label: ReactNode };

export interface SliderProps
  extends Omit<FieldBaseProps, "hideLabel" | "orientation" | "optional">,
    Omit<
      ChakraSlider.RootProps,
      keyof FieldBaseProps | "children" | "value" | "defaultValue" | "onValueChange" | "onValueChangeEnd" | "label"
    > {
  /** Um valor = slider único; dois valores = intervalo. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueChangeEnd?: (value: number[]) => void;
  /** Formata cada valor para o texto ao lado e para `aria-valuetext` (ex.: v => `${v} pl/ha`). */
  formatValue?: (value: number) => string;
  /** Marcas abaixo do trilho (número usa `formatValue`/número como rótulo). */
  marks?: SliderMark[];
  /** Nome acessível de cada alça no intervalo (padrão: "<rótulo> mínimo/máximo"). */
  thumbLabels?: string[];
  /** Esconde o valor em texto à direita do rótulo. */
  hideValue?: boolean;
}

const defaultFormat = (v: number) => v.toLocaleString("pt-BR");

/**
 * Slider — Slider.Root único ou intervalo. Valor sempre em texto ao lado do rótulo;
 * setas ajustam de 1 em 1 passo, Page Up/Down de 10 em 10.
 */
export function Slider(props: SliderProps) {
  const [fieldProps, rest] = splitFieldProps(props);
  const {
    value,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    formatValue = defaultFormat,
    marks,
    thumbLabels,
    hideValue,
    min = 0,
    max = 100,
    step = 1,
    ...rootProps
  } = rest;
  const { label, disabled } = fieldProps;
  const labelText = typeof label === "string" ? label : undefined;

  const initial = value ?? defaultValue ?? [min];
  const ariaLabels =
    thumbLabels ??
    (labelText ? (initial.length > 1 ? [`${labelText} mínimo`, `${labelText} máximo`] : [labelText]) : undefined);

  const resolvedMarks = marks?.map((m) =>
    typeof m === "number" ? { value: m, label: defaultFormat(m) } : m,
  );

  return (
    <FormField {...fieldProps} label={undefined}>
      <ChakraSlider.Root
        value={value}
        defaultValue={defaultValue ?? (value ? undefined : [min])}
        onValueChange={onValueChange ? (d) => onValueChange(d.value) : undefined}
        onValueChangeEnd={onValueChangeEnd ? (d) => onValueChangeEnd(d.value) : undefined}
        min={min}
        max={max}
        step={step}
        largeStep={step * 10}
        disabled={disabled}
        aria-label={ariaLabels}
        getAriaValueText={(d) => formatValue(d.value)}
        thumbAlignment="center"
        size="lg"
        gap="2.5"
        width="full"
        css={{ "--slider-track-size": "8px", "--slider-thumb-size": "24px" }}
        {...rootProps}
      >
        {(label != null || !hideValue) && (
          <Flex justify="space-between" align="baseline" gap="3" textStyle="body.sm">
            {label != null ? (
              <ChakraSlider.Label fontWeight="medium" color="fg">
                {label}
                {fieldProps.required && (
                  <chakra.span color="danger" aria-hidden="true">
                    {" *"}
                  </chakra.span>
                )}
              </ChakraSlider.Label>
            ) : (
              <span />
            )}
            {!hideValue && (
              <ChakraSlider.Context>
                {(api) => (
                  <chakra.output fontWeight="700" color="fg.heading" aria-hidden="true">
                    {api.value.map(formatValue).join(" – ")}
                  </chakra.output>
                )}
              </ChakraSlider.Context>
            )}
          </Flex>
        )}
        <ChakraSlider.Control>
          <ChakraSlider.Track bg="bg.muted" boxShadow="none">
            <ChakraSlider.Range bg="primary" />
          </ChakraSlider.Track>
          <ChakraSlider.Thumbs
            bg="bg.panel"
            borderWidth="2px"
            borderColor="primary"
            boxShadow="xs"
            cursor="grab"
            _focusVisible={{ boxShadow: "0 0 0 2px {colors.bg.panel}, 0 0 0 4px {colors.primary}" }}
            _disabled={{ bg: "bg.muted", borderColor: "border.disabled", cursor: "not-allowed" }}
          />
          {resolvedMarks && resolvedMarks.length > 0 && (
            <ChakraSlider.Marks
              marks={resolvedMarks}
              css={{
                "& .chakra-slider__markerIndicator": { bg: "transparent" },
                "& .chakra-slider__markerLabel": { textStyle: "caption", fontWeight: "normal", color: "fg.muted" },
              }}
            />
          )}
        </ChakraSlider.Control>
      </ChakraSlider.Root>
    </FormField>
  );
}
