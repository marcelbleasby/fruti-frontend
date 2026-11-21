"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthGuard, SessionCheck } from "@/components/auth";
import { useAuth } from "./auth-context";
import { loginUrl } from "./routes";

/**
 * Guarda das rotas protegidas no cliente — segunda camada depois do proxy.ts.
 *
 * O proxy só confere se há cookie de sessão; aqui a sessão é confirmada na API
 * (/eu). Enquanto confirma, a página aparece normalmente (o proxy já barrou
 * quem não tinha cookie), sem tela de carregamento. Se a sessão for inválida,
 * vai para o login (/) guardando a origem. Sessão que expira com a página aberta
 * não cai aqui: o AuthProvider abre o diálogo de reautenticação.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  return (
    <AuthGuard
      isAuthenticated={status !== "unauthenticated"}
      onUnauthenticated={() => router.replace(loginUrl(`${pathname}${window.location.search}`))}
      fallback={<SessionCheck label="Redirecionando para o login…" />}
    >
      {children}
    </AuthGuard>
  );
}
