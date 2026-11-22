import type { Metadata } from "next";
import { Suspense } from "react";
import { EspeciesConteudo } from "@/modules/catalogo/catalogo-conteudo";
import { CatalogoCabecalho, CatalogoCabecalhoEstatico } from "@/modules/catalogo/components/catalogo-cabecalho";
import { LoadingState } from "@/components/data-display/loading-state";

export const metadata: Metadata = { title: "Espécies · Fruti" };

/**
 * /especies — catálogo global. Cabeçalho e drawers no cliente (URL); lista no servidor,
 * dentro do Suspense (lê sessão, propriedade ativa e filtros da URL).
 */
export default function EspeciesPage({ searchParams }: PageProps<"/especies">) {
  return (
    <>
      <Suspense fallback={<CatalogoCabecalhoEstatico tela="especies" />}>
        <CatalogoCabecalho tela="especies" />
      </Suspense>
      <Suspense fallback={<LoadingState variant="table" rows={6} />}>
        <EspeciesConteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}
