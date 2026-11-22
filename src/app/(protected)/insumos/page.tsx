import type { Metadata } from "next";
import { Suspense } from "react";
import { EstoqueCabecalho, EstoqueCabecalhoEstatico } from "@/modules/estoque/components/estoque-cabecalho";
import { EstoqueCarregando } from "@/modules/estoque/components/estoque-estados";
import { EstoqueConteudo } from "@/modules/estoque/estoque-conteudo";

export const metadata: Metadata = { title: "Insumos · Fruti" };

/**
 * /insumos — cabeçalho e drawers no cliente (URL: ?lote=, ?registrar=1);
 * lista e resumo no servidor, dentro do Suspense (leem cookie e filtros da URL).
 */
export default function InsumosPage({ searchParams }: PageProps<"/insumos">) {
  return (
    <>
      <Suspense fallback={<EstoqueCabecalhoEstatico tipo="insumos" />}>
        <EstoqueCabecalho tipo="insumos" />
      </Suspense>
      <Suspense fallback={<EstoqueCarregando />}>
        <EstoqueConteudo tipo="insumos" searchParams={searchParams} />
      </Suspense>
    </>
  );
}
