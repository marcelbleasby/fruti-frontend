import type { ReactNode } from "react";
import type { FieldRootProps } from "@chakra-ui/react";

/** Orientação do campo: vertical (padrão, sempre no mobile) ou horizontal (rótulo à esquerda a partir de `md`). */
export type FieldOrientation = "vertical" | "horizontal";

/**
 * Props comuns a todos os campos de formulário do DS.
 * Todos os controles (`TextInput`, `Select`, `DatePicker`, …) aceitam este contrato.
 */
export interface FieldBaseProps {
  /** Rótulo sempre visível (use `hideLabel` só em buscas com ícone). */
  label?: ReactNode;
  /** Texto de apoio abaixo do campo (some quando há erro). */
  helperText?: ReactNode;
  /** Mensagem de erro. Quando presente, o campo fica inválido automaticamente. */
  errorText?: ReactNode;
  /** Mostra o indicador `*` e marca o controle como obrigatório. */
  required?: boolean;
  /** Força o estado inválido (também ativado por `errorText`). */
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Acrescenta "(opcional)" ao rótulo. */
  optional?: boolean;
  /** Esconde o rótulo visualmente (continua acessível a leitores de tela). */
  hideLabel?: boolean;
  orientation?: FieldOrientation;
  /** id do controle — destino das âncoras do `FormErrorSummary`. */
  id?: string;
  /** Props extras para o `Field.Root` (layout: `gridColumn`, `flex`, `mb`…). */
  fieldProps?: Omit<FieldRootProps, "children">;
}

/** Opção genérica usada por Select, NativeSelect, grupos e combobox. */
export interface FieldOption {
  value: string;
  label: string;
  /** Linha secundária (área, nome científico…). */
  description?: string;
  disabled?: boolean;
}
