"use client";

import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { system } from "@/theme";
import { EmotionRegistry } from "./emotion-registry";
import { Toaster } from "./toaster";

/**
 * Provider do design system Fruti (tema claro único, sem color mode). Monta o
 * Toaster global: um toast disparado antes de navegar (ex.: depois de salvar)
 * aparece na página seguinte.
 */
export function Provider({ children }: { children: ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        {children}
        <Toaster />
      </ChakraProvider>
    </EmotionRegistry>
  );
}
