import "server-only";

import { Stack } from "@chakra-ui/react";
import { unstable_rethrow } from "next/navigation";
import { listarAreas } from "@/lib/areas/server";
import { getPropriedadeAtiva } from "@/lib/propriedades/server";
import { EstoqueErro, EstoqueSemPropriedade } from "@/modules/estoque/components/estoque-estados";
import type { Area } from "@/modules/types";
import { AreasLista, AreasResumo } from "./components/areas-lista";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Dados =
  | { estado: "sem_propriedade" }
  | { estado: "erro" }
  | { estado: "ok"; podeCadastrar: boolean; todas: Area[]; areas: Area[] };

const normalizar = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

async function carregar(sp: Awaited<SearchParams>): Promise<Dados> {
  try {
    const propriedade = await getPropriedadeAtiva();
    if (!propriedade) return { estado: "sem_propriedade" };
    const busca = typeof sp.busca === "string" ? sp.busca.trim().slice(0, 100) : "";
    // Os indicadores são da propriedade toda; a grade segue a busca (nome ou código, como na API).
    const { areas: todas } = await listarAreas(propriedade.id);
    const termo = normalizar(busca);
    const areas = termo
      ? todas.filter((a) => normalizar(a.name).includes(termo) || normalizar(a.code).includes(termo))
      : todas;
    return { estado: "ok", podeCadastrar: propriedade.meuPapel === "PROPRIETARIO", todas, areas };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[areas] falha ao carregar áreas de cultivo", err);
    return { estado: "erro" };
  }
}

/** Indicadores e grade de áreas (Server Component, dentro de <Suspense>). */
export async function AreasConteudo({ searchParams }: { searchParams: SearchParams }) {
  const dados = await carregar(await searchParams);

  if (dados.estado === "sem_propriedade")
    return <EstoqueSemPropriedade descricao="Cadastre uma propriedade para registrar as áreas de cultivo." />;
  if (dados.estado === "erro") return <EstoqueErro titulo="Não foi possível carregar as áreas de cultivo" />;

  return (
    <Stack gap="5">
      {dados.todas.length ? <AreasResumo areas={dados.todas} /> : null}
      <AreasLista areas={dados.areas} podeCadastrar={dados.podeCadastrar} />
    </Stack>
  );
}
