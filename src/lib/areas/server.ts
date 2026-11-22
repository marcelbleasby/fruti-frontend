import "server-only";

import type { Pagina } from "@/lib/api/fruti-api";
import { authedApiFetch } from "@/lib/auth/session";
import type { Area, CultivationUnit, CultivationUnitType, PlantingStatus, PlantingSummary } from "@/modules/types";

/**
 * Áreas e unidades de cultivo da propriedade atual. Adapta os esquemas da API
 * (`AreaSaida`, `UnidadeSaida`, `PlantioSaida`) aos tipos do DS (modules/types).
 */

const MAXIMO = 200;

export interface AreaApi {
  id: string;
  propriedade_id: string;
  nome: string;
  codigo: string;
  descricao: string;
  comprimento_m: string;
  largura_m: string;
  area_m2: string;
  area_hectares: string;
  area_em_unidades_m2: string;
  area_livre_m2: string;
  criado_em: string;
  atualizado_em: string;
}

export interface UnidadeApi {
  id: string;
  area_de_cultivo_id: string;
  propriedade_id: string;
  tipo: "CANTEIRO" | "TALHAO" | "OUTRO";
  nome: string;
  codigo: string;
  descricao: string;
  comprimento_m: string;
  largura_m: string;
  posicao_x_m: string | null;
  posicao_y_m: string | null;
  area_m2: string;
}

interface PlantioApi {
  id: string;
  area_de_cultivo_id: string;
  unidade_de_cultivo_id: string;
  especie_id: string;
  cultivar_id: string | null;
  nome: string;
  nome_exibicao: string;
  situacao: string;
  data_implantacao: string | null;
  data_encerramento: string | null;
  plantas: { vivas: number };
}

interface NomeApi {
  id: string;
  nome?: string;
  nome_comum?: string;
  nome_cientifico?: string;
}

type Params = Record<string, string | number | boolean | null | undefined>;
const query = (params: Params) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};

const EM_CAMPO = new Set(["IMPLANTADO", "EM_DESENVOLVIMENTO", "COLHIDO"]);

export interface ContagemDaArea {
  plantios: number;
  plantas: number;
}

export function paraArea(a: AreaApi, contagem?: ContagemDaArea): Area {
  return {
    id: a.id,
    code: a.codigo,
    name: a.nome,
    description: a.descricao || undefined,
    length: Number(a.comprimento_m),
    width: Number(a.largura_m),
    createdAt: a.criado_em,
    unitsAreaM2: Number(a.area_em_unidades_m2),
    freeAreaM2: Number(a.area_livre_m2),
    activePlantings: contagem?.plantios ?? 0,
    plants: contagem?.plantas ?? 0,
  };
}

export function paraUnidade(u: UnidadeApi): CultivationUnit {
  return {
    id: u.id,
    areaId: u.area_de_cultivo_id,
    type: u.tipo.toLowerCase() as CultivationUnitType,
    name: u.nome,
    code: u.codigo,
    description: u.descricao || undefined,
    length: Number(u.comprimento_m),
    width: Number(u.largura_m),
    x: u.posicao_x_m === null ? null : Number(u.posicao_x_m),
    y: u.posicao_y_m === null ? null : Number(u.posicao_y_m),
  };
}

/** Plantios em campo e plantas vivas por área (uma chamada só, agrupada aqui). */
async function contagensPorArea(propriedadeId: string, areaId?: string) {
  const { itens } = await authedApiFetch<Pagina<PlantioApi>>(
    `/propriedades/${propriedadeId}/plantios${query({ em_campo: true, area_de_cultivo_id: areaId, limit: MAXIMO })}`,
  );
  const mapa = new Map<string, ContagemDaArea>();
  for (const p of itens) {
    if (!EM_CAMPO.has(p.situacao)) continue;
    const c = mapa.get(p.area_de_cultivo_id) ?? { plantios: 0, plantas: 0 };
    c.plantios += 1;
    c.plantas += p.plantas.vivas;
    mapa.set(p.area_de_cultivo_id, c);
  }
  return mapa;
}

export async function listarAreas(propriedadeId: string, busca?: string) {
  const [{ itens, total }, contagens] = await Promise.all([
    authedApiFetch<Pagina<AreaApi>>(
      `/propriedades/${propriedadeId}/areas-de-cultivo${query({ busca, ordenar: "nome", limit: MAXIMO })}`,
    ),
    contagensPorArea(propriedadeId).catch(() => new Map<string, ContagemDaArea>()),
  ]);
  return { areas: itens.map((a) => paraArea(a, contagens.get(a.id))), total };
}

export async function obterArea(id: string) {
  return authedApiFetch<AreaApi>(`/areas-de-cultivo/${id}`);
}

export async function listarUnidades(areaId: string) {
  const { itens } = await authedApiFetch<Pagina<UnidadeApi>>(
    `/areas-de-cultivo/${areaId}/unidades-de-cultivo${query({ ordenar: "codigo", limit: MAXIMO })}`,
  );
  return itens.map(paraUnidade);
}

/**
 * Todos os plantios da área (inclusive encerrados), com nomes de espécie e cultivo.
 * O plantio não tem código na API; o `code` exibido é o da unidade de cultivo onde está.
 */
export async function listarPlantiosDaArea(
  propriedadeId: string,
  area: Area,
  unidades: CultivationUnit[],
): Promise<PlantingSummary[]> {
  const { itens } = await authedApiFetch<Pagina<PlantioApi>>(
    `/propriedades/${propriedadeId}/plantios${query({ area_de_cultivo_id: area.id, ordenar: "-data_implantacao", limit: MAXIMO })}`,
  );
  if (!itens.length) return [];
  const [especies, cultivares] = await Promise.all([
    authedApiFetch<Pagina<NomeApi>>(`/catalogo/especies?limit=${MAXIMO}`).catch(() => ({ itens: [] as NomeApi[] })),
    itens.some((p) => p.cultivar_id)
      ? authedApiFetch<Pagina<NomeApi>>(`/catalogo/cultivares?limit=${MAXIMO}`).catch(() => ({
          itens: [] as NomeApi[],
        }))
      : Promise.resolve({ itens: [] as NomeApi[] }),
  ]);
  const especie = new Map(especies.itens.map((e) => [e.id, e]));
  const cultivar = new Map(cultivares.itens.map((c) => [c.id, c.nome ?? ""]));
  const unidade = new Map(unidades.map((u) => [u.id, u.code || u.name]));
  return itens.map((p) => {
    const e = especie.get(p.especie_id);
    return {
      id: p.id,
      code: unidade.get(p.unidade_de_cultivo_id) ?? "—",
      status: p.situacao.toLowerCase() as PlantingStatus,
      species: {
        id: p.especie_id,
        name: e?.nome_comum || e?.nome_cientifico || "Espécie",
        scientificName: e?.nome_cientifico,
      },
      cultivar: p.cultivar_id ? { id: p.cultivar_id, name: cultivar.get(p.cultivar_id) || "Cultivo" } : null,
      area: { id: area.id, code: area.code, name: area.name },
      plantedAt: p.data_implantacao ?? undefined,
      endedAt: p.data_encerramento ?? undefined,
      plants: p.plantas.vivas,
    };
  });
}

export async function contagemDaArea(propriedadeId: string, areaId: string) {
  return (await contagensPorArea(propriedadeId, areaId)).get(areaId);
}
