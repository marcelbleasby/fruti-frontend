"use client";

import { RadioCard, SimpleGrid, chakra, type SimpleGridProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FormFieldset, type FormFieldsetProps } from "./form-fieldset";
import { resolveInvalid } from "./form-field";
import { radioControlStyles } from "./radio-group";
import { messageFontSize } from "./styles";
import type { FieldOption } from "./types";

export interface RadioCardOption extends FieldOption {
  /** Ícone (lucide, 20 px) na mesma linha do rótulo. */
  icon?: ReactNode;
  /** Rodapé do card (preço, contagem…). */
  addon?: ReactNode;
}

export interface RadioCardGroupProps
  extends Omit<FormFieldsetProps, "children" | "defaultValue" | "onChange" | "legend"> {
  label?: FormFieldsetProps["legend"];
  options: RadioCardOption[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  name?: string;
  readOnly?: boolean;
  /** Colunas da grade (padrão: 1 no mobile, até 3 a partir de `md`). Ignorado com `minCardWidth`. */
  columns?: SimpleGridProps["columns"];
  /**
   * Largura mínima de cada card (ex.: "200px"): a grade quebra pela largura do
   * contêiner, não da tela — cards nunca ficam estreitos demais para o texto.
   */
  minCardWidth?: string;
  /** Mostra o rádio à esquerda do conteúdo (padrão: true). */
  showIndicator?: boolean;
}

/**
 * RadioCardGroup — RadioCard.Root: opções grandes em cards (escolhas com descrição,
 * ex.: tipo de material). Layout do board "Sementes, mudas e arquivos":
 * rádio à esquerda, centralizado verticalmente no card; ícone na linha do rótulo; borda
 * de controle (3,6:1) no card livre; selecionado = 2 px verde + fundo verde-claro
 * (a segunda linha vem de sombra interna, sem deslocar o conteúdo).
 */
export function RadioCardGroup(props: RadioCardGroupProps) {
  const {
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    columns,
    minCardWidth,
    showIndicator = true,
    disabled,
    readOnly,
    invalid,
    errorText,
    ...fieldsetProps
  } = props;
  const isInvalid = resolveInvalid(invalid, errorText);

  return (
    <FormFieldset legend={label} disabled={disabled} invalid={isInvalid} errorText={errorText} {...fieldsetProps}>
      <RadioCard.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        invalid={isInvalid || undefined}
        variant="outline"
        size="md"
        gap="0"
      >
        <SimpleGrid
          gap="3"
          {...(minCardWidth
            ? { templateColumns: `repeat(auto-fit, minmax(min(100%, ${minCardWidth}), 1fr))` }
            : { columns: columns ?? { base: 1, md: Math.min(options.length, 3) } })}
        >
          {options.map((option) => (
            <RadioCard.Item
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              bg="bg.panel"
              borderWidth="1px"
              borderColor={isInvalid ? "border.error" : "border.control"}
              borderRadius="l3"
              cursor="pointer"
              transitionProperty="border-color, background-color, box-shadow"
              transitionDuration="fast"
              _hover={{ borderColor: "primary" }}
              _checked={{ bg: "primary.subtle", borderColor: "primary", boxShadow: "inset 0 0 0 1px {colors.primary}" }}
              _focusWithin={{ outline: "2px solid", outlineColor: "focusRing", outlineOffset: "2px" }}
              _disabled={{ layerStyle: "disabled", opacity: 1 }}
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl p="4" gap="3" flexDirection="row" alignItems="center">
                {/* Rádio à esquerda, centralizado na altura do conteúdo (rótulo + descrição). */}
                {showIndicator && <RadioCard.ItemIndicator css={radioControlStyles} flexShrink={0} />}
                <RadioCard.ItemContent gap="1" alignItems="flex-start" textAlign="start" minW="0" overflowWrap="break-word">
                  <chakra.span display="flex" alignItems="center" gap="2">
                    {option.icon && (
                      <chakra.span color="primary" display="flex" flexShrink={0} aria-hidden="true">
                        {option.icon}
                      </chakra.span>
                    )}
                    <RadioCard.ItemText textStyle="body.sm" fontWeight="600" color="fg.heading">
                      {option.label}
                    </RadioCard.ItemText>
                  </chakra.span>
                  {option.description && (
                    <RadioCard.ItemDescription fontSize={messageFontSize} lineHeight="1.5rem" color="fg.muted" opacity={1}>
                      {option.description}
                    </RadioCard.ItemDescription>
                  )}
                </RadioCard.ItemContent>
              </RadioCard.ItemControl>
              {option.addon && (
                <RadioCard.ItemAddon px="4" py="2" borderTopWidth="1px" borderColor="border" textStyle="caption" color="fg.muted">
                  {option.addon}
                </RadioCard.ItemAddon>
              )}
            </RadioCard.Item>
          ))}
        </SimpleGrid>
      </RadioCard.Root>
    </FormFieldset>
  );
}
