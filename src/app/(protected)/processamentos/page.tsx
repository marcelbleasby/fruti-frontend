import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ProcessamentosCabecalho,
  ProcessamentosCabecalhoEstatico,
} from "@/modules/beneficiamento/components/processamentos-cabecalho";
import { ProcessamentosConteudo } from "@/modules/beneficiamento/processamentos-conteudo";
import { EstoqueCarregando } from "@/modules/estoque/components/estoque-estados";

export const metadata: Metadata = { title: "Processamentos · Fruti" };

/**
 * /processamentos — cabeçalho e drawers no cliente (URL: ?processamento=, ?registrar=1);
 * lista e resumo no servidor, dentro do Suspense (leem cookie e filtros da URL).
 */
export default function ProcessamentosPage({ searchParams }: PageProps<"/processamentos">) {
  return (
    <>
      <Suspense fallback={<ProcessamentosCabecalhoEstatico />}>
        <ProcessamentosCabecalho />
      </Suspense>
      <Suspense fallback={<EstoqueCarregando />}>
        <ProcessamentosConteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}
