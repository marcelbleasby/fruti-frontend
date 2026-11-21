"use client";

import { Icon, Tag as ChakraTag } from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { forwardRef, type ReactElement, type ReactNode } from "react";

export interface TagProps extends Omit<ChakraTag.RootProps, "children" | "variant" | "size" | "colorPalette"> {
  children: ReactNode;
  /** Quando presente, mostra o botão de remover (Tag.CloseTrigger). */
  onRemove?: () => void;
  /** aria-label do botão remover. Padrão: "Remover {children}" quando children é texto. */
  removeLabel?: string;
}

/**
 * Tag removível — chip de filtro aplicado / valor escolhido.
 * Pílula 28px, fundo primary.subtle, 16px/500. Chakra v3: Tag.Root · Tag.CloseTrigger.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, onRemove, removeLabel, ...rest },
  ref,
) {
  const label = removeLabel ?? (typeof children === "string" ? `Remover ${children}` : "Remover");
  return (
    <ChakraTag.Root
      ref={ref}
      h="28px"
      minH="28px"
      ps="2.5"
      pe={onRemove ? "0.5" : "2.5"}
      gap="0.5"
      borderRadius="full"
      bg="primary.subtle"
      color="fg.heading"
      fontSize="sm"
      fontWeight="500"
      boxShadow="none"
      {...rest}
    >
      <ChakraTag.Label>{children}</ChakraTag.Label>
      {onRemove && (
        <ChakraTag.EndElement m="0" w="auto" h="auto" minW="0">
          <ChakraTag.CloseTrigger
            aria-label={label}
            onClick={onRemove}
            boxSize="6"
            css={{ "& svg": { width: "16px", height: "16px" } }}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            color="fg.heading"
            cursor="pointer"
            _hover={{ bg: "green.200" }}
            focusVisibleRing="inside"
          >
            <Icon boxSize="3.5">
              <X strokeWidth={1.75} />
            </Icon>
          </ChakraTag.CloseTrigger>
        </ChakraTag.EndElement>
      )}
    </ChakraTag.Root>
  );
});

export interface SelectableTagProps
  extends Omit<ChakraTag.RootProps, "children" | "onChange" | "variant" | "size" | "colorPalette" | "asChild"> {
  children: ReactNode;
  pressed: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Ícone (lucide) exibido quando não selecionado; selecionado mostra um check. */
  icon?: ReactElement;
  disabled?: boolean;
}

/**
 * Tag selecionável (filtro rápido) — botão com aria-pressed.
 * 34px, pílula; selecionado: fundo fg.heading e texto branco.
 */
export const SelectableTag = forwardRef<HTMLSpanElement, SelectableTagProps>(function SelectableTag(
  { children, pressed, onPressedChange, icon, disabled, ...rest },
  ref,
) {
  return (
    <ChakraTag.Root
      ref={ref}
      asChild
      h="36px"
      minH="36px"
      px="3"
      gap="1.5"
      borderRadius="full"
      borderWidth="1px"
      fontSize="sm"
      fontWeight="600"
      cursor="pointer"
      boxShadow="none"
      transitionProperty="background-color, border-color, color"
      transitionDuration="fast"
      focusVisibleRing="outside"
      bg={pressed ? "fg.heading" : "bg.panel"}
      color={pressed ? "fg.inverted" : "fg"}
      borderColor={pressed ? "fg.heading" : "border.control"}
      _hover={pressed ? undefined : { bg: "bg.subtle" }}
      _disabled={{ layerStyle: "disabled" }}
      {...rest}
    >
      <button
        type="button"
        aria-pressed={pressed}
        disabled={disabled}
        onClick={() => onPressedChange?.(!pressed)}
      >
        {pressed ? (
          <Icon boxSize="3.5">
            <Check strokeWidth={1.75} />
          </Icon>
        ) : icon ? (
          <Icon boxSize="3.5">{icon}</Icon>
        ) : null}
        {children}
      </button>
    </ChakraTag.Root>
  );
});
