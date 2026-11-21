import { Fira_Code, Fira_Sans } from "next/font/google";

/**
 * Fontes do DS. Aplique `fontVariables` no <html> do layout raiz para que
 * os tokens `fonts.body/heading/mono` resolvam para as fontes otimizadas.
 */
export const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-sans",
  display: "swap",
});

export const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira-code",
  display: "swap",
});

export const fontVariables = `${firaSans.variable} ${firaCode.variable}`;
