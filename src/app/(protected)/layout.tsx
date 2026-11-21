import type { ReactNode } from "react";
import { ProtectedRoute } from "@/lib/auth/protected-route";
import { AppFrame } from "./app-frame";

/**
 * Área protegida: tudo em app/(protected) exige sessão.
 * Camadas: proxy.ts (redireciona sem cookie) → ProtectedRoute (confirma na API)
 * → cada Server Action/consulta valida o token na API.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppFrame>{children}</AppFrame>
    </ProtectedRoute>
  );
}
