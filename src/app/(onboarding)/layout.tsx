import type { ReactNode } from "react";
import { ProtectedRoute } from "@/lib/auth/protected-route";
import { PropriedadeProvider } from "@/lib/propriedades/propriedade-context";

/**
 * Primeiro acesso: exige sessão (proxy.ts + ProtectedRoute), mas fica fora da
 * casca do app (sem sidebar) — sem propriedade, não há o que navegar.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <PropriedadeProvider>{children}</PropriedadeProvider>
    </ProtectedRoute>
  );
}
