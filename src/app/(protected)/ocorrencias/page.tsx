import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Ocorrências · Fruti" };

export default function OcorrenciasPage() {
  return <EmConstrucao titulo="Ocorrências" descricao="Pragas, doenças e danos, com seus tratamentos." />;
}
