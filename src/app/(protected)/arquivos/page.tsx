import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Arquivos · Fruti" };

export default function ArquivosPage() {
  return <EmConstrucao titulo="Arquivos" descricao="Fotos e documentos ligados aos registros da propriedade." />;
}
