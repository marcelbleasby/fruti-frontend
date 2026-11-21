import type { ReactNode } from "react";

export type PermissionMatch = "all" | "any";

export interface PermissionState {
  allowed: boolean;
  /** Permissões exigidas que o usuário não tem. */
  missing: string[];
}

export interface PermissionGateProps {
  /** Permissões concedidas ao usuário (recebidas da API). */
  permissions: readonly string[];
  /** Permissão(ões) exigida(s). */
  require: string | readonly string[];
  /** "all" (padrão): todas as exigidas; "any": ao menos uma. */
  match?: PermissionMatch;
  /** Renderizado sem permissão (ex.: <ErrorState variant="forbidden" /> para bloquear a rota). Padrão: nada (esconde). */
  fallback?: ReactNode;
  /**
   * Conteúdo protegido. Como função, é sempre renderizado e recebe o estado —
   * use para "desabilitar com motivo" (ex.: botão disabled + aria-describedby).
   */
  children: ReactNode | ((state: PermissionState) => ReactNode);
}

/** Verifica permissões concedidas contra as exigidas. */
export function checkPermission(
  permissions: readonly string[],
  require: string | readonly string[],
  match: PermissionMatch = "all",
): PermissionState {
  const required = typeof require === "string" ? [require] : [...require];
  const granted = new Set(permissions);
  const missing = required.filter((p) => !granted.has(p));
  const allowed = required.length === 0 || (match === "all" ? missing.length === 0 : missing.length < required.length);
  return { allowed, missing };
}

/**
 * Esconde, desabilita com motivo ou bloqueia conteúdo conforme as permissões recebidas por props.
 * A interface só reflete as permissões da API; a validação de verdade é sempre do backend.
 */
export function PermissionGate({ permissions, require, match = "all", fallback = null, children }: PermissionGateProps) {
  const state = checkPermission(permissions, require, match);
  if (typeof children === "function") return <>{children(state)}</>;
  return <>{state.allowed ? children : fallback}</>;
}
