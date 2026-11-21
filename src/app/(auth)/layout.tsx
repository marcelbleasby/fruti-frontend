import type { ReactNode } from "react";
import { AuthLayout } from "@/components/auth";

/**
 * Telas de acesso (login, cadastro): fora da área protegida. Quem já tem
 * sessão é mandado para o início pelo proxy.ts (ver lib/auth/routes.ts).
 */
export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
