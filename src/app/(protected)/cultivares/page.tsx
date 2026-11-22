import type { Metadata } from "next";
import { Suspense } from "react";
import { CultivaresConteudo } from "@/modules/catalogo/catalogo-conteudo";
import { CatalogoCabecalho, CatalogoCabecalhoEstatico } from "@/modules/catalogo/components/catalogo-cabecalho";
import { LoadingState } from "@/components/data-display/loading-state";

export const metadata: Metadata = { title: "Cultivos · Fruti" };

/**
 * /cultivares — catálogo global. Cabeçalho e drawers no cliente (URL); lista no servidor,
 * dentro do Suspense (lê sessão, propriedade ativa e filtros da URL).
 */
export default function CultivaresPage({ searchParams }: PageProps<"/cultivares">) {
  return (
    <>
      <Suspense fallback={<CatalogoCabecalhoEstatico tela="cultivares" />}>
        <CatalogoCabecalho tela="cultivares" />
      </Suspense>
      <Suspense fallback={<LoadingState variant="table" rows={6} />}>
        <CultivaresConteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}
