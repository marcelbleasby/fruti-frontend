import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Processamentos · Fruti" };

export default function ProcessamentosPage() {
  return <EmConstrucao titulo="Processamentos" descricao="Transformação de fruta e insumos em produtos, com perda e rendimento." />;
}
