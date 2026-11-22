import type { Metadata } from "next";
import { Suspense } from "react";
import { EstoqueCarregando } from "@/modules/estoque/components/estoque-estados";
import { AreasConteudo } from "@/modules/areas-de-cultivo/areas-conteudo";
import { AreasCabecalho, AreasCabecalhoEstatico } from "@/modules/areas-de-cultivo/components/areas-cabecalho";

export const metadata: Metadata = { title: "Áreas de cultivo · Fruti" };

/**
 * /areas-de-cultivo — áreas da propriedade atual. Cabeçalho e drawer "Nova área" no
 * cliente (URL); indicadores e grade no servidor, dentro do Suspense.
 */
export default function AreasDeCultivoPage({ searchParams }: PageProps<"/areas-de-cultivo">) {
  return (
    <>
      <Suspense fallback={<AreasCabecalhoEstatico />}>
        <AreasCabecalho />
      </Suspense>
      <Suspense fallback={<EstoqueCarregando />}>
        <AreasConteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}
