import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Insumos · Fruti" };

export default function InsumosPage() {
  return <EmConstrucao titulo="Insumos" descricao="Fertilizantes, corretivos, defensivos e outros consumíveis usados na produção." />;
}
