/** Função "debounced": só roda depois de `ms` sem novas chamadas, com os últimos argumentos. */
export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** Descarta a chamada pendente. */
  cancel(): void;
  /** Roda agora a chamada pendente (se houver). */
  flush(): void;
  /** Há chamada esperando o prazo? */
  pending(): boolean;
}

/**
 * Atrasa `fn` até `ms` sem novas chamadas — para busca enquanto digita,
 * redimensionamento, salvar rascunho. Fora de componentes React; dentro deles,
 * prefira `useDebouncedCallback`/`useDebouncedValue` (@/hooks), que
 * cancelam ao desmontar.
 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ultimos: A | undefined;

  const run = () => {
    timer = undefined;
    const args = ultimos!;
    ultimos = undefined;
    fn(...args);
  };

  const debounced = ((...args: A) => {
    ultimos = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(run, ms);
  }) as Debounced<A>;

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    ultimos = undefined;
  };
  debounced.flush = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    run();
  };
  debounced.pending = () => timer !== undefined;

  return debounced;
}
