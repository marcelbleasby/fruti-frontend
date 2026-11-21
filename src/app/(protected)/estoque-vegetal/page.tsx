import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Material vegetal · Fruti" };

export default function EstoqueVegetalPage() {
  return <EmConstrucao titulo="Material vegetal" descricao="Lotes de sementes e mudas da propriedade, com seus saldos." />;
}
