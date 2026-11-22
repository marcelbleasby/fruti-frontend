import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DestinacoesCabecalho,
  DestinacoesCabecalhoEstatico,
} from "@/modules/beneficiamento/components/destinacoes-cabecalho";
import { DestinacoesConteudo } from "@/modules/beneficiamento/destinacoes-conteudo";
import { EstoqueCarregando } from "@/modules/estoque/components/estoque-estados";

export const metadata: Metadata = { title: "Destinações · Fruti" };

/**
 * /destinacoes — cabeçalho e drawers no cliente (URL: ?destinacao=, ?registrar=1);
 * lista e resumo no servidor, dentro do Suspense (leem cookie e filtros da URL).
 */
export default function DestinacoesPage({ searchParams }: PageProps<"/destinacoes">) {
  return (
    <>
      <Suspense fallback={<DestinacoesCabecalhoEstatico />}>
        <DestinacoesCabecalho />
      </Suspense>
      <Suspense fallback={<EstoqueCarregando />}>
        <DestinacoesConteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}
