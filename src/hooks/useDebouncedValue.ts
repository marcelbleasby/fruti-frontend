"use client";

import { useEffect, useState } from "react";

/** Atraso padrão para busca enquanto digita. */
export const DEBOUNCE_BUSCA_MS = 300;

/**
 * Valor que só muda depois de `ms` sem alterações — o jeito mais simples de
 * buscar enquanto digita:
 *
 * ```tsx
 * const [termo, setTermo] = useState("");
 * const termoBusca = useDebouncedValue(termo.trim());
 * useEffect(() => { void buscar(termoBusca); }, [termoBusca]);
 * ```
 *
 * Valor vazio passa na hora (limpar a busca não deve esperar).
 */
export function useDebouncedValue<T>(value: T, ms: number = DEBOUNCE_BUSCA_MS, { imediatoQuandoVazio = true } = {}): T {
  const [debounced, setDebounced] = useState(value);
  const vazio = imediatoQuandoVazio && (value === "" || value === null || value === undefined);

  useEffect(() => {
    if (vazio) return;
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms, vazio]);

  return vazio ? value : debounced;
}
