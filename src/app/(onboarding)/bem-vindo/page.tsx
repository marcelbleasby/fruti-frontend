import type { Metadata } from "next";
import { OnboardingScreen } from "./onboarding-screen";

export const metadata: Metadata = {
  title: "Cadastrar propriedade · Fruti",
  robots: { index: false },
};

/** /bem-vindo — primeiro acesso: cadastro da primeira propriedade. */
export default function BemVindoPage() {
  return <OnboardingScreen />;
}
