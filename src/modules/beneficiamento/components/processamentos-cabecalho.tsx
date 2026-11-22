"use client";

import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { usePropriedade } from "@/lib/propriedades/propriedade-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { ProcessamentoDrawer } from "./processamento-drawer";
import { RegistrarProcessamentoDrawer } from "./registrar-processamento-drawer";

const TITULO = "Processamentos";
const DESCRICAO = "Fruta transformada em produtos, com rendimento e custo.";

/** Cabeçalho + drawers (`?processamento=<id>`, `?registrar=1`). */
export function ProcessamentosCabecalho() {
  const url = useListaUrl();
  const { ativa } = usePropriedade();
  const podeEditar = ativa?.meuPapel === "PROPRIETARIO";

  return (
    <>
      <PageHeader
        hideBelow="md"
        title={TITULO}
        description={DESCRICAO}
        actions={
          podeEditar ? (
            <Button onClick={() => url.abrir("registrar")}>
              <Plus aria-hidden /> Registrar processamento
            </Button>
          ) : undefined
        }
      />
      {podeEditar ? (
        <Button hideFrom="md" w="full" onClick={() => url.abrir("registrar")}>
          <Plus aria-hidden /> Registrar processamento
        </Button>
      ) : null}
      <RegistrarProcessamentoDrawer
        open={url.aberto("registrar") === "1" && podeEditar}
        onOpenChange={(open) => (open ? url.abrir("registrar") : url.fechar("registrar"))}
        onRegistrado={(id) => {
          url.recarregar();
          url.abrir("processamento", id);
        }}
      />
      <ProcessamentoDrawer podeEditar={podeEditar} />
    </>
  );
}

export function ProcessamentosCabecalhoEstatico() {
  return <PageHeader hideBelow="md" title={TITULO} description={DESCRICAO} />;
}
