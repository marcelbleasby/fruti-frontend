import { HOME_ROUTE, isAuthRoute } from "./routes";

/**
 * Destino depois do login. Só caminhos internos (evita open redirect via
 * ?next=https://… ou //host) e nunca uma tela de acesso (voltaria ao login).
 */
export function safeNext(next: unknown, fallback = HOME_ROUTE): string {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\") ||
    isAuthRoute(next.split(/[?#]/)[0])
  ) {
    return fallback;
  }
  return next;
}
