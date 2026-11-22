import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Eventos de manejo · Fruti" };

export default function EventosPage() {
  return <EmConstrucao titulo="Eventos de manejo" descricao="Atividades planejadas e realizadas nos plantios." />;
}
