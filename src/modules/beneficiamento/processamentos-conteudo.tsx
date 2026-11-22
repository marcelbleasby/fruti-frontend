import "server-only";

import { Stack } from "@chakra-ui/react";
import { unstable_rethrow } from "next/navigation";
import {
  TAMANHO_DA_PAGINA,
  carregarReferencias,
  filtrosDaUrl,
  listarProcessamentos,
  nomearProcessamento,
  resumoDosProcessamentos,
  type FiltrosDeProcessamentos,
} from "@/lib/beneficiamento/server";
import type { Processamento, ResumoDosProcessamentos } from "@/lib/beneficiamento/types";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import { EstoqueErro, EstoqueSemPropriedade } from "@/modules/estoque/components/estoque-estados";
import { ProcessamentosLista } from "./components/processamentos-lista";
import { ProcessamentosResumo } from "./components/processamentos-resumo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Dados =
  | { estado: "sem_propriedade" }
  | { estado: "erro" }
  | {
      estado: "ok";
      podeRegistrar: boolean;
      filtros: FiltrosDeProcessamentos;
      resumo: ResumoDosProcessamentos;
      processamentos: Processamento[];
      total: number;
    };

async function carregar(sp: Awaited<SearchParams>): Promise<Dados> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { estado: "sem_propriedade" };
    const filtros = filtrosDaUrl(sp);
    const [pagina, resumo, refs] = await Promise.all([
      listarProcessamentos(propriedade.id, filtros),
      resumoDosProcessamentos(propriedade.id, filtros),
      carregarReferencias(propriedade.id),
    ]);
    return {
      estado: "ok",
      podeRegistrar: propriedade.meuPapel === "PROPRIETARIO",
      filtros,
      resumo,
      processamentos: pagina.itens.map((p) => nomearProcessamento(p, refs)),
      total: pagina.total,
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[beneficiamento] falha ao carregar processamentos", err);
    return { estado: "erro" };
  }
}

/** Lista e resumo dos processamentos (Server Component, dentro de <Suspense>). */
export async function ProcessamentosConteudo({ searchParams }: { searchParams: SearchParams }) {
  const dados = await carregar(await searchParams);

  if (dados.estado === "sem_propriedade")
    return (
      <EstoqueSemPropriedade descricao="Cadastre uma propriedade para registrar processamentos." />
    );
  if (dados.estado === "erro") return <EstoqueErro titulo="Não foi possível carregar os processamentos" />;

  return (
    <Stack gap="5">
      <ProcessamentosResumo resumo={dados.resumo} />
      <ProcessamentosLista
        processamentos={dados.processamentos}
        total={dados.total}
        pagina={dados.filtros.pagina}
        tamanhoDaPagina={TAMANHO_DA_PAGINA}
        podeRegistrar={dados.podeRegistrar}
      />
    </Stack>
  );
}
