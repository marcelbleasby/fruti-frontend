import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/data-display/loading-state";
import { AreaDetalheConteudo } from "@/modules/areas-de-cultivo/area-detalhe-conteudo";

export const metadata: Metadata = { title: "Área de cultivo · Fruti" };

/** /areas-de-cultivo/[id] — resumo, unidades de cultivo e plantios da área. */
export default function AreaDeCultivoPage({ params }: PageProps<"/areas-de-cultivo/[id]">) {
  return (
    <Suspense fallback={<LoadingState variant="details" />}>
      <AreaDetalheConteudo params={params} />
    </Suspense>
  );
}
