import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Plantios · Fruti" };

export default function PlantiosPage() {
  return <EmConstrucao titulo="Plantios" descricao="Espécies implantadas nas unidades de cultivo, do planejamento ao encerramento." />;
}
