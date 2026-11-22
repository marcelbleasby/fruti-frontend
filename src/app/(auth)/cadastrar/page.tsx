import type { Metadata } from "next";
import { SignUpScreen } from "./sign-up-screen";

export const metadata: Metadata = {
  title: "Cadastro · Fruti",
  robots: { index: false },
};

/** /cadastrar — cadastro público de conta; entra automaticamente ao concluir. */
export default function CadastrarPage() {
  return <SignUpScreen />;
}
