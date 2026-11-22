import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Painel · Fruti" };

export default function PainelPage() {
  return <EmConstrucao titulo="Painel" descricao="Resumo da propriedade atual." />;
}
