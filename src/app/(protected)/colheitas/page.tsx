import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Colheitas · Fruti" };

export default function ColheitasPage() {
  return <EmConstrucao titulo="Colheitas" descricao="Peso colhido de cada plantio por safra." />;
}
