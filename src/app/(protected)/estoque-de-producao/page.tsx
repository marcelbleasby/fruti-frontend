import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Estoque de produção · Fruti" };

export default function EstoqueDeProducaoPage() {
  return <EmConstrucao titulo="Estoque de produção" descricao="Lotes de fruta colhida e de produtos processados." />;
}
