import type { Metadata } from "next";
import { EmConstrucao } from "../em-construcao";

export const metadata: Metadata = { title: "Áreas de cultivo · Fruti" };

export default function AreasDeCultivoPage() {
  return <EmConstrucao titulo="Áreas de cultivo" descricao="Estufas e setores de produção da propriedade, divididos em canteiros e talhões." />;
}
