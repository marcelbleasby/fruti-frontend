import type { Metadata } from "next";
import { Suspense } from "react";
import { EstoqueCabecalho, EstoqueCabecalhoEstatico } from "@/modules/estoque/components/estoque-cabecalho";
import { EstoqueCarregando } from "@/modules/estoque/components/estoque-estados";
import { EstoqueConteudo } from "@/modules/estoque/estoque-conteudo";

export const metadata: Metadata = { title: "Estoque de produção · Fruti" };

/**
 * /estoque-de-producao — cabeçalho e drawers no cliente (URL: ?lote=, ?registrar=1);
 * lista e resumo no servidor, dentro do Suspense (leem cookie e filtros da URL).
 */
export default function EstoqueDeProducaoPage({ searchParams }: PageProps<"/estoque-de-producao">) {
  return (
    <>
      <Suspense fallback={<EstoqueCabecalhoEstatico tipo="producao" />}>
        <EstoqueCabecalho tipo="producao" />
      </Suspense>
      <Suspense fallback={<EstoqueCarregando />}>
        <EstoqueConteudo tipo="producao" searchParams={searchParams} />
      </Suspense>
    </>
  );
}
