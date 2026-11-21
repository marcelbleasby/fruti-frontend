"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SessionCheck } from "./session-check";

export interface AuthGuardProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
  /** Renderizado sem sessão válida (ex.: um componente que redireciona para o login). */
  fallback?: ReactNode;
  /** Renderizado enquanto a sessão é verificada; padrão: <SessionCheck />. */
  loadingFallback?: ReactNode;
  /**
   * Chamado uma vez quando a verificação termina sem sessão — use para
   * redirecionar ao login guardando a origem (?next=).
   */
  onUnauthenticated?: () => void;
  children: ReactNode;
}

/**
 * Protege conteúdo autenticado. Não conhece a fonte da sessão: receba
 * `isAuthenticated`/`isLoading` do seu provedor. A validação real é sempre do backend.
 */
export function AuthGuard({
  isAuthenticated,
  isLoading = false,
  fallback = null,
  loadingFallback,
  onUnauthenticated,
  children,
}: AuthGuardProps) {
  const notified = useRef(false);
  const denied = !isLoading && !isAuthenticated;

  useEffect(() => {
    if (denied && !notified.current) {
      notified.current = true;
      onUnauthenticated?.();
    }
    if (!denied) notified.current = false;
  }, [denied, onUnauthenticated]);

  if (isLoading) return <>{loadingFallback ?? <SessionCheck />}</>;
  if (!isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
}
