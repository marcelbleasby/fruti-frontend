import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Cultivares · Fruti" };

export default function CultivaresPage() {
  return <EmConstrucao titulo="Cultivares" descricao="Variedades de cada espécie no catálogo global." />;
}
