"use client";

import type { ReactNode } from "react";
import { TextInput } from "@/components/forms/text-input";

/**
 * DecimalInput — número decimal em pt-BR sobre o TextInput do DS (ADR 0002 do frontend).
 *
 * Por que não o NumberInput do DS: em pt-BR ele arredonda no blur para a
 * precisão do `step` (1,5 → 1; 10,5 some) e mantém "1.5" como texto cru. Aqui a
 * pessoa vê exatamente o que digitou, a validação explica o erro, e no blur o
 * valor válido é normalizado ("380" → "380,00" em dinheiro; "1234,5" → "1.234,5").
 */
export function DecimalInput({
  label,
  value,
  onChange,
  onBlur,
  unit,
  casas,
  inteiro = false,
  required,
  optional,
  helperText,
  errorText,
  invalid,
  name,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  unit?: ReactNode;
  /** Casas decimais fixas na normalização (ex.: 2 para dinheiro). Padrão: até 3. */
  casas?: number;
  inteiro?: boolean;
  required?: boolean;
  optional?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  invalid?: boolean;
  name?: string;
  /** id do input (para o resumo de erros do formulário apontar para ele). */
  id?: string;
}) {
  const formato = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas ?? 0,
    maximumFractionDigits: casas ?? 3,
  });

  return (
    <TextInput
      label={label}
      name={name}
      id={id}
      required={required}
      optional={optional}
      helperText={helperText}
      errorText={errorText}
      invalid={invalid}
      unit={unit}
      inputMode={inteiro ? "numeric" : "decimal"}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        const n = parseDecimalPtBR(value);
        // Normaliza só o que é válido; inválido fica como está para a mensagem de erro fazer sentido.
        if (Number.isFinite(n) && !(inteiro && !Number.isInteger(n))) onChange(formato.format(n));
        onBlur?.();
      }}
      fontVariantNumeric="tabular-nums"
    />
  );
}

/**
 * Lê um número digitado em pt-BR. Aceita "1,5", "1.234,5", "1234.5" e "1.500"
 * (milhar). Vazio ou inválido → NaN.
 *  - com vírgula: ponto é milhar, vírgula é decimal;
 *  - só com ponto: "1.500"/"12.345.678" é milhar; "1.5"/"12.25" é decimal.
 */
export function parseDecimalPtBR(valor: string | null | undefined): number {
  const v = (valor ?? "").trim().replace(/\s/g, "");
  if (!v) return Number.NaN;
  if (!/^-?[\d.,]+$/.test(v)) return Number.NaN;
  if (v.includes(",")) {
    if ((v.match(/,/g) ?? []).length > 1) return Number.NaN;
    return Number(v.replace(/\./g, "").replace(",", "."));
  }
  if (/^-?\d{1,3}(\.\d{3})+$/.test(v)) return Number(v.replace(/\./g, ""));
  if ((v.match(/\./g) ?? []).length > 1) return Number.NaN;
  return Number(v);
}
