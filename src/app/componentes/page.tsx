import type { Metadata } from "next";
import { ShowcaseClient } from "./_showcase/showcase-client";

export const metadata: Metadata = {
  title: "Componentes · Fruti",
  description: "Vitrine do design system Fruti: todos os componentes e suas variantes.",
};

/** /componentes — vitrine com todos os componentes do Fruti e suas variantes. */
export default function ComponentesPage() {
  return <ShowcaseClient />;
}
