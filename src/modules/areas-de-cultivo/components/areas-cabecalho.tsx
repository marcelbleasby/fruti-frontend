"use client";

import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { usePropriedade } from "@/lib/propriedades/propriedade-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { AreaFormDrawer } from "./area-formulario";

const TITULO = "Áreas de cultivo";
const DESCRICAO = "Estufas e setores, divididos em canteiros e talhões.";

/** Cabeçalho da lista + drawer "Nova área" (`?form=area`). Cadastrar: só Proprietário. */
export function AreasCabecalho() {
  const url = useListaUrl();
  const router = useRouter();
  const { ativa } = usePropriedade();
  const pode = ativa?.meuPapel === "PROPRIETARIO";
  const abrir = () => url.setFiltros({ form: "area" });

  return (
    <>
      <PageHeader
        hideBelow="md"
        title={TITULO}
        description={DESCRICAO}
        actions={
          pode ? (
            <Button onClick={abrir}>
              <Plus aria-hidden /> Nova área
            </Button>
          ) : undefined
        }
      />
      {pode ? (
        <Button hideFrom="md" w="full" onClick={abrir}>
          <Plus aria-hidden /> Nova área
        </Button>
      ) : null}
      {pode ? <AreaFormDrawer aoCriar={(id) => router.push(`/areas-de-cultivo/${id}`)} /> : null}
    </>
  );
}

export function AreasCabecalhoEstatico() {
  return <PageHeader hideBelow="md" title={TITULO} description={DESCRICAO} />;
}
