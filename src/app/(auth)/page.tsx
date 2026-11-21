import type { Metadata } from "next";
import { LoginScreen } from "./login-screen";

export const metadata: Metadata = {
  title: "Entrar · Fruti",
  robots: { index: false },
};

/** / — login (raiz do projeto). Aceita ?next=/caminho para voltar à página de origem. */
export default function EntrarPage() {
  return <LoginScreen />;
}
