"use client";

import { useEffect, useMemo, useState } from "react";
import { debounce, type Debounced } from "@/lib/debounce";
import { DEBOUNCE_BUSCA_MS } from "./useDebouncedValue";

/**
 * Callback estável que só roda depois de `ms` sem novas chamadas; sempre usa a
 * versão mais recente de `fn`. Cancela ao desmontar. Tem `.cancel()`,
 * `.flush()` (ex.: Enter busca na hora) e `.pending()`.
 *
 * ```tsx
 * const buscar = useDebouncedCallback((termo: string) => router.replace(`?q=${encodeURIComponent(termo)}`));
 * <Input onChange={(e) => buscar(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscar.flush()} />
 * ```
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number = DEBOUNCE_BUSCA_MS,
): Debounced<A> {
  // Guarda a `fn` mais recente; ela só é lida quando o timer dispara, nunca no render.
  const [alvo] = useState(() => {
    let atual = fn;
    return { trocar: (f: typeof fn) => void (atual = f), chamar: (...args: A) => atual(...args) };
  });
  useEffect(() => {
    alvo.trocar(fn);
  });

  const debounced = useMemo(() => debounce(alvo.chamar, ms), [alvo, ms]);
  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
