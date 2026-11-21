"use client";

import { Alert, Link, List } from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { messageFontSize } from "./styles";

export interface FormErrorItem {
  /** id do controle (o mesmo passado em `id` do campo). */
  fieldId: string;
  message: ReactNode;
}

export interface FormErrorSummaryProps {
  errors: FormErrorItem[];
  /** Título; padrão "Corrija n campo(s) para salvar". */
  title?: ReactNode;
  /** Recebe o foco ao montar / quando a lista de erros muda (padrão: true). */
  focusOnMount?: boolean;
}

function focusField(fieldId: string) {
  const el = document.getElementById(fieldId);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus({ preventScroll: true });
  return true;
}

/**
 * FormErrorSummary — Alert.Root · List · Link. Recebe o foco após um envio com erro;
 * cada item leva ao campo. Os erros abaixo de cada campo continuam visíveis.
 */
export function FormErrorSummary({ errors, title, focusOnMount = true }: FormErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = errors.length;
  const signature = errors.map((e) => e.fieldId).join("|");

  useEffect(() => {
    if (focusOnMount && signature) ref.current?.focus();
  }, [focusOnMount, signature]);

  if (count === 0) return null;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, fieldId: string) => {
    if (focusField(fieldId)) event.preventDefault();
  };

  return (
    <Alert.Root
      ref={ref}
      status="error"
      tabIndex={-1}
      gap="3"
      px="4"
      py="3.5"
      borderRadius="l3"
      bg="danger.subtle"
      borderWidth="1px"
      borderColor="red.300"
      color="danger.hover"
      outline="none"
      _focus={{ boxShadow: "0 0 0 2px {colors.bg.panel}, 0 0 0 4px {colors.primary}" }}
    >
      <Alert.Indicator color="danger.hover" h="6" display="flex" alignItems="center">
        <CircleAlert size={20} strokeWidth={1.75} aria-hidden="true" />
      </Alert.Indicator>
      <Alert.Content gap="1.5">
        <Alert.Title textStyle="body.sm" fontWeight="600" color="inherit">
          {title ?? `Corrija ${count} ${count === 1 ? "campo" : "campos"} para salvar`}
        </Alert.Title>
        <Alert.Description asChild>
          <List.Root as="ul" listStyleType="disc" ps="4.5" fontSize={messageFontSize} lineHeight="1.5rem" color="inherit">
            {errors.map((error) => (
              <List.Item key={error.fieldId}>
                <Link
                  href={`#${error.fieldId}`}
                  color="inherit"
                  textDecoration="underline"
                  textUnderlineOffset="2px"
                  onClick={(e) => handleClick(e, error.fieldId)}
                  focusVisibleRing="outside"
                >
                  {error.message}
                </Link>
              </List.Item>
            ))}
          </List.Root>
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
