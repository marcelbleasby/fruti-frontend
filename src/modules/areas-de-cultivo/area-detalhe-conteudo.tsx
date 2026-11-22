import "server-only";

import { notFound, unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/fruti-api";
import { contagemDaArea, listarPlantiosDaArea, listarUnidades, obterArea, paraArea } from "@/lib/areas/server";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import { EstoqueErro } from "@/modules/estoque/components/estoque-estados";
import type { Area, CultivationUnit, PlantingSummary } from "@/modules/types";
import { AreaDetalhe } from "./components/area-detalhe";

const UUID = /^[0-9a-f-]{36}$/i;

type Dados =
  | { estado: "nao_encontrada" }
  | { estado: "erro" }
  | { estado: "ok"; area: Area; unidades: CultivationUnit[]; plantios: PlantingSummary[]; podeEditar: boolean };

async function carregar(id: string): Promise<Dados> {
  if (!UUID.test(id)) return { estado: "nao_encontrada" };
  try {
    const [api, unidades, propriedade] = await Promise.all([obterArea(id), listarUnidades(id), getPropriedadeAtiva()]);
    const [contagem, plantios] = await Promise.all([
      contagemDaArea(api.propriedade_id, id).catch(() => undefined),
      listarPlantiosDaArea(api.propriedade_id, paraArea(api), unidades).catch(() => []),
    ]);
    const area = paraArea(api, contagem);
    const podeEditar = propriedade?.id === api.propriedade_id && propriedade.meuPapel === "PROPRIETARIO";
    return { estado: "ok", area, unidades, plantios, podeEditar };
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ApiError && err.status === 404) return { estado: "nao_encontrada" };
    console.error("[areas] falha ao carregar área de cultivo", err);
    return { estado: "erro" };
  }
}

/** Detalhe da área (Server Component, dentro de <Suspense>: lê params e sessão). */
export async function AreaDetalheConteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dados = await carregar(id);
  if (dados.estado === "nao_encontrada") notFound();
  if (dados.estado === "erro") return <EstoqueErro titulo="Não foi possível carregar a área de cultivo" />;
  return (
    <AreaDetalhe area={dados.area} unidades={dados.unidades} plantios={dados.plantios} podeEditar={dados.podeEditar} />
  );
}
