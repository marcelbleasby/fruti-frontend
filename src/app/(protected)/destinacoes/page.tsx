import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Destinações · Fruti" };

export default function DestinacoesPage() {
  return <EmConstrucao titulo="Destinações" descricao="Saídas do estoque de produção: venda, doação, consumo próprio, perda ou compostagem." />;
}
