import "server-only";

import { unstable_rethrow } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  TAMANHO_DA_PAGINA,
  carregarContagens,
  listarCultivares,
  listarEspecies,
  paraCultivar,
  paraSpecies,
  todasAsEspecies,
} from "@/lib/catalogo/server";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import { EstoqueErro } from "@/modules/estoque/components/estoque-estados";
import type { Cultivar, Species, SpeciesRef } from "@/modules/types";
import { CultivaresLista } from "./components/cultivares-lista";
import { EspeciesLista } from "./components/especies-lista";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const s = (sp: Awaited<SearchParams>, k: string) => {
  const v = sp[k];
  return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
};

async function contexto() {
  const [user, propriedade] = await Promise.all([getCurrentUser(), getPropriedadeAtiva().catch(() => null)]);
  return { admin: Boolean(user?.administradorGlobal), propriedadeId: propriedade?.id ?? null };
}

/* ------------------------------------------------------------------ */

type DadosEspecies = { ok: true; especies: Species[]; total: number; pagina: number } | { ok: false };

async function carregarEspecies(sp: Awaited<SearchParams>): Promise<DadosEspecies> {
  try {
    const { admin, propriedadeId } = await contexto();
    const pagina = Math.max(1, Number.parseInt(s(sp, "pagina") ?? "1", 10) || 1);
    const situacao = s(sp, "situacao");
    // Inativas só para a administração global; os demais veem o catálogo vigente.
    const ativa = !admin ? true : situacao === "inativas" ? false : situacao === "todas" ? undefined : true;
    const [lista, contagens] = await Promise.all([
      listarEspecies({ busca: s(sp, "busca"), ativa, pagina }),
      carregarContagens(propriedadeId),
    ]);
    return { ok: true, especies: lista.itens.map((e) => paraSpecies(e, contagens)), total: lista.total, pagina };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[catalogo] falha ao carregar espécies", err);
    return { ok: false };
  }
}

export async function EspeciesConteudo({ searchParams }: { searchParams: SearchParams }) {
  const dados = await carregarEspecies(await searchParams);
  if (!dados.ok) return <EstoqueErro titulo="Não foi possível carregar as espécies" />;
  return <EspeciesLista especies={dados.especies} total={dados.total} pagina={dados.pagina} tamanhoDaPagina={TAMANHO_DA_PAGINA} />;
}

/* ------------------------------------------------------------------ */

type DadosCultivares = { ok: true; cultivares: Cultivar[]; especies: SpeciesRef[] } | { ok: false };

async function carregarCultivares(sp: Awaited<SearchParams>): Promise<DadosCultivares> {
  try {
    const { admin, propriedadeId } = await contexto();
    const [lista, especies, contagens] = await Promise.all([
      listarCultivares({ especieId: s(sp, "especie"), busca: s(sp, "busca") }),
      todasAsEspecies(!admin),
      carregarContagens(propriedadeId),
    ]);
    return {
      ok: true,
      cultivares: lista.itens.map((c) => paraCultivar(c, contagens)),
      especies: especies.map((e) => ({ id: e.id, name: e.nome_comum || e.nome_cientifico, scientificName: e.nome_cientifico })),
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[catalogo] falha ao carregar cultivares", err);
    return { ok: false };
  }
}

export async function CultivaresConteudo({ searchParams }: { searchParams: SearchParams }) {
  const dados = await carregarCultivares(await searchParams);
  if (!dados.ok) return <EstoqueErro titulo="Não foi possível carregar os cultivos" />;
  return <CultivaresLista cultivares={dados.cultivares} especies={dados.especies} />;
}
