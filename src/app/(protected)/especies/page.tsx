import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Espécies · Fruti" };

export default function EspeciesPage() {
  return <EmConstrucao titulo="Espécies" descricao="Catálogo global de espécies, compartilhado por todas as propriedades." />;
}
