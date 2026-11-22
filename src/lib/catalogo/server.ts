import "server-only";

import type { Pagina } from "@/lib/api/fruti-api";
import { authedApiFetch } from "@/lib/auth/session";
import type { Cultivar, Species } from "@/modules/types";

/**
 * Catálogo global (espécies e cultivares), lido por qualquer usuário e escrito
 * só pela administração global. Adapta os esquemas da API aos tipos do DS
 * (`Species`, `Cultivar` em modules/types).
 */

export const TAMANHO_DA_PAGINA = 20;
const MAXIMO = 200;

export interface EspecieApi {
  id: string;
  nome_cientifico: string;
  nome_comum: string;
  descricao: string;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface CultivarApi {
  id: string;
  especie_id: string;
  nome: string;
  descricao: string;
  espacamento_recomendado_linhas_m: string | null;
  espacamento_recomendado_plantas_m: string | null;
  idade_inicio_producao_meses: number | null;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
}

interface PlantioResumo {
  especie_id: string;
  cultivar_id: string | null;
}

type Params = Record<string, string | number | boolean | null | undefined>;
const query = (params: Params) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};

const num = (v: string | null) => (v === null ? undefined : Number(v));

export function paraSpecies(e: EspecieApi, contagens?: Contagens): Species {
  return {
    id: e.id,
    name: e.nome_comum || e.nome_cientifico,
    scientificName: e.nome_cientifico,
    description: e.descricao || undefined,
    active: e.ativa,
    cultivarCount: contagens?.cultivaresPorEspecie.get(e.id) ?? 0,
    plantingCount: contagens?.plantiosPorEspecie ? (contagens.plantiosPorEspecie.get(e.id) ?? 0) : undefined,
  };
}

export function paraCultivar(c: CultivarApi, contagens?: Contagens): Cultivar {
  return {
    id: c.id,
    name: c.nome,
    speciesId: c.especie_id,
    characteristics: c.descricao || undefined,
    rowSpacingM: num(c.espacamento_recomendado_linhas_m),
    plantSpacingM: num(c.espacamento_recomendado_plantas_m),
    productionStartMonths: c.idade_inicio_producao_meses ?? undefined,
    notes: c.observacoes || undefined,
    createdAt: c.criado_em,
    plantingCount: contagens?.plantiosPorCultivar ? (contagens.plantiosPorCultivar.get(c.id) ?? 0) : undefined,
  };
}

export interface FiltrosDeEspecies {
  busca?: string;
  /** undefined = todas (só administração global vê inativas). */
  ativa?: boolean;
  pagina: number;
}

export async function listarEspecies(f: FiltrosDeEspecies) {
  return authedApiFetch<Pagina<EspecieApi>>(
    `/catalogo/especies${query({
      busca: f.busca,
      ativa: f.ativa,
      ordenar: "nome_comum",
      limit: TAMANHO_DA_PAGINA,
      offset: (f.pagina - 1) * TAMANHO_DA_PAGINA,
    })}`,
  );
}

/** Todas as espécies (até 200), para filtros e selects. */
export async function todasAsEspecies(apenasAtivas = true) {
  const { itens } = await authedApiFetch<Pagina<EspecieApi>>(
    `/catalogo/especies${query({ ativa: apenasAtivas ? true : undefined, ordenar: "nome_comum", limit: MAXIMO })}`,
  );
  return itens;
}

export async function listarCultivares(f: { especieId?: string; busca?: string }) {
  const { itens, total } = await authedApiFetch<Pagina<CultivarApi>>(
    `/catalogo/cultivares${query({ especie_id: f.especieId, busca: f.busca, ordenar: "nome", limit: MAXIMO })}`,
  );
  return { itens, total };
}

export async function obterEspecie(id: string) {
  return authedApiFetch<EspecieApi>(`/catalogo/especies/${id}`);
}

export async function obterCultivar(id: string) {
  return authedApiFetch<CultivarApi>(`/catalogo/cultivares/${id}`);
}

/* ------------------------------------------------------------------ */
/* Contagens                                                           */
/* ------------------------------------------------------------------ */

export interface Contagens {
  cultivaresPorEspecie: Map<string, number>;
  /** Plantios na propriedade ativa; ausente = não foi possível contar. */
  plantiosPorEspecie?: Map<string, number>;
  plantiosPorCultivar?: Map<string, number>;
}

/**
 * Cultivares por espécie (catálogo) e plantios por espécie/cultivar na
 * propriedade ativa. Plantios são opcionais: se falhar, as telas simplesmente
 * não mostram a contagem (o DS esconde a coluna).
 */
export async function carregarContagens(propriedadeId: string | null): Promise<Contagens> {
  const [cultivares, plantios] = await Promise.all([
    authedApiFetch<Pagina<CultivarApi>>(`/catalogo/cultivares?limit=${MAXIMO}`),
    propriedadeId
      ? authedApiFetch<Pagina<PlantioResumo>>(`/propriedades/${propriedadeId}/plantios?limit=${MAXIMO}`).catch(() => null)
      : Promise.resolve(null),
  ]);
  const conta = <T,>(lista: T[], chave: (x: T) => string | null) => {
    const m = new Map<string, number>();
    for (const x of lista) {
      const k = chave(x);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  return {
    cultivaresPorEspecie: conta(cultivares.itens, (c) => c.especie_id),
    plantiosPorEspecie: plantios ? conta(plantios.itens, (p) => p.especie_id) : undefined,
    plantiosPorCultivar: plantios ? conta(plantios.itens, (p) => p.cultivar_id) : undefined,
  };
}
