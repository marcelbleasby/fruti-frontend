import "server-only";

import { Stack } from "@chakra-ui/react";
import { unstable_rethrow } from "next/navigation";
import {
  TAMANHO_DA_PAGINA,
  carregarReferencias,
  filtrosDeDestinacoesDaUrl,
  listarDestinacoes,
  nomearDestinacao,
  resumoDasDestinacoes,
  type FiltrosDeDestinacoes,
} from "@/lib/beneficiamento/server";
import type { Destinacao, ResumoDasDestinacoes } from "@/lib/beneficiamento/types";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import { EstoqueErro, EstoqueSemPropriedade } from "@/modules/estoque/components/estoque-estados";
import { DestinacoesLista } from "./components/destinacoes-lista";
import { DestinacoesResumo } from "./components/destinacoes-resumo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Dados =
  | { estado: "sem_propriedade" }
  | { estado: "erro" }
  | {
      estado: "ok";
      podeRegistrar: boolean;
      filtros: FiltrosDeDestinacoes;
      resumo: ResumoDasDestinacoes;
      destinacoes: Destinacao[];
      total: number;
    };

async function carregar(sp: Awaited<SearchParams>): Promise<Dados> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { estado: "sem_propriedade" };
    const filtros = filtrosDeDestinacoesDaUrl(sp);
    const refs = await carregarReferencias(propriedade.id);
    const [pagina, resumo] = await Promise.all([
      listarDestinacoes(propriedade.id, filtros),
      resumoDasDestinacoes(propriedade.id, filtros, refs),
    ]);
    return {
      estado: "ok",
      podeRegistrar: propriedade.meuPapel === "PROPRIETARIO",
      filtros,
      resumo,
      destinacoes: pagina.itens.map((d) => nomearDestinacao(d, refs)),
      total: pagina.total,
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[beneficiamento] falha ao carregar destinações", err);
    return { estado: "erro" };
  }
}

/** Lista e resumo das destinações (Server Component, dentro de <Suspense>). */
export async function DestinacoesConteudo({ searchParams }: { searchParams: SearchParams }) {
  const dados = await carregar(await searchParams);

  if (dados.estado === "sem_propriedade")
    return (
      <EstoqueSemPropriedade descricao="Cadastre uma propriedade para registrar destinações." />
    );
  if (dados.estado === "erro") return <EstoqueErro titulo="Não foi possível carregar as destinações" />;

  return (
    <Stack gap="5">
      <DestinacoesResumo resumo={dados.resumo} />
      <DestinacoesLista
        destinacoes={dados.destinacoes}
        total={dados.total}
        pagina={dados.filtros.pagina}
        tamanhoDaPagina={TAMANHO_DA_PAGINA}
        podeRegistrar={dados.podeRegistrar}
      />
    </Stack>
  );
}
