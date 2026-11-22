import "server-only";

import { Stack } from "@chakra-ui/react";
import { unstable_rethrow } from "next/navigation";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import {
  TAMANHO_DA_PAGINA,
  carregarCatalogo,
  filtrosDaUrl,
  listarLotes,
  listarSaldosDeInsumos,
  nomearLote,
  opcoesDeEspecies,
  resumoDeInsumos,
  resumoDoEstoque,
  type FiltrosDeLotes,
} from "@/lib/estoque/server";
import type { Lote, OpcaoCatalogo, ResumoDoEstoque, SaldoDeInsumo, TipoDeEstoque } from "@/lib/estoque/types";
import { EstoqueErro, EstoqueSemPropriedade } from "./components/estoque-estados";
import { EstoqueResumo } from "./components/estoque-resumo";
import { InsumosVisao } from "./components/insumos-visao";
import { LotesLista } from "./components/lotes-lista";
import { SaldosInsumos } from "./components/saldos-insumos";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Dados =
  | { estado: "sem_propriedade" }
  | { estado: "erro" }
  | {
      estado: "saldos";
      podeRegistrar: boolean;
      filtros: FiltrosDeLotes;
      resumo: ResumoDoEstoque;
      saldos: SaldoDeInsumo[];
      total: number;
    }
  | {
      estado: "lotes";
      podeRegistrar: boolean;
      filtros: FiltrosDeLotes;
      resumo: ResumoDoEstoque;
      lotes: Lote[];
      total: number;
      especies: OpcaoCatalogo[];
    };

async function carregar(tipo: TipoDeEstoque, sp: Awaited<SearchParams>): Promise<Dados> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { estado: "sem_propriedade" };
    const podeRegistrar = tipo !== "producao" && propriedade.meuPapel === "PROPRIETARIO";
    const filtros = filtrosDaUrl(sp);

    if (tipo === "insumos" && sp.visao !== "lotes") {
      const [pagina, resumo] = await Promise.all([
        listarSaldosDeInsumos(propriedade.id, filtros),
        resumoDeInsumos(propriedade.id),
      ]);
      return { estado: "saldos", podeRegistrar, filtros, resumo, saldos: pagina.itens, total: pagina.total };
    }

    const [pagina, resumo, catalogo] = await Promise.all([
      listarLotes(propriedade.id, tipo, filtros),
      tipo === "insumos" ? resumoDeInsumos(propriedade.id) : resumoDoEstoque(propriedade.id, tipo),
      carregarCatalogo(propriedade.id, tipo),
    ]);
    return {
      estado: "lotes",
      podeRegistrar,
      filtros,
      resumo,
      lotes: pagina.itens.map((l) => nomearLote(l, catalogo)),
      total: pagina.total,
      especies: tipo === "insumos" ? [] : opcoesDeEspecies(catalogo),
    };
  } catch (err) {
    // Deixa passar os sinais internos do Next (prerender de cookies, redirect…).
    unstable_rethrow(err);
    console.error(`[estoque] falha ao carregar ${tipo}`, err);
    return { estado: "erro" };
  }
}

/**
 * Conteúdo de uma tela de estoque (Server Component, dentro de <Suspense>):
 * lê a propriedade ativa (cookie) e os filtros da URL, busca na API e entrega
 * os dados prontos para os componentes de cliente.
 */
export async function EstoqueConteudo({ tipo, searchParams }: { tipo: TipoDeEstoque; searchParams: SearchParams }) {
  const dados = await carregar(tipo, await searchParams);

  if (dados.estado === "sem_propriedade") return <EstoqueSemPropriedade />;
  if (dados.estado === "erro") return <EstoqueErro />;

  return (
    <Stack gap="5">
      <EstoqueResumo tipo={tipo} resumo={dados.resumo} />
      {tipo === "insumos" ? <InsumosVisao visao={dados.estado} /> : null}
      {dados.estado === "saldos" ? (
        <SaldosInsumos
          saldos={dados.saldos}
          total={dados.total}
          pagina={dados.filtros.pagina}
          tamanhoDaPagina={TAMANHO_DA_PAGINA}
          podeRegistrar={dados.podeRegistrar}
        />
      ) : (
        <LotesLista
          tipo={tipo}
          lotes={dados.lotes}
          total={dados.total}
          pagina={dados.filtros.pagina}
          tamanhoDaPagina={TAMANHO_DA_PAGINA}
          especies={dados.especies}
          podeRegistrar={dados.podeRegistrar}
        />
      )}
    </Stack>
  );
}
