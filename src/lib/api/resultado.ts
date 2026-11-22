import "server-only";

import { ApiError } from "./fruti-api";

/** Resultado comum das escritas nas Server Actions. `fields`: erros por campo da API (já juntados). */
export type ResultadoDeEscrita<T = undefined> =
  | { status: "ok"; data: T }
  | { status: "invalid"; fields: Record<string, string>; message?: string }
  /** Regra de negócio ou conflito (código repetido, lote já usado…). */
  | { status: "rejected"; message: string }
  | { status: "unauthenticated" }
  | { status: "unavailable"; message: string };

export type FalhaDeEscrita = Exclude<ResultadoDeEscrita<never>, { status: "ok" }>;

/**
 * Converte um erro da API no resultado da action. Erros por campo podem vir com
 * caminho (`entradas.0.quantidade`); a chave é mantida como veio.
 */
export function falhaDaApi(err: unknown, contexto: string): FalhaDeEscrita {
  if (err instanceof ApiError) {
    if (err.status === 401) return { status: "unauthenticated" };
    if (err.campos.length > 0) {
      const fields: Record<string, string> = {};
      for (const { campo, mensagem } of err.campos) fields[campo] = fields[campo] ? `${fields[campo]} ${mensagem}` : mensagem;
      return { status: "invalid", fields, message: err.message };
    }
    if ([403, 404, 409, 422].includes(err.status)) return { status: "rejected", message: err.message };
  }
  console.error(`[api] ${contexto}`, err);
  return { status: "unavailable", message: "Não foi possível concluir agora. Tente novamente em instantes." };
}

/** Chave de idempotência gerada no navegador por envio; inválida → uma nova. */
export function chaveDeIdempotencia(chave: unknown): string {
  return typeof chave === "string" && /^[\w-]{8,100}$/.test(chave) ? chave : crypto.randomUUID();
}
