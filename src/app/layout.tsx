import type { Metadata } from "next";
import { ReactNode } from "react";
import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { fontVariables } from "@/theme/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fruti",
  description: "Gestão agrícola do plantio à planta.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <body>
        <Provider>
          <AuthProvider>{children}</AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
