"use client";

import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { usePropriedade } from "@/lib/propriedades/propriedade-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { DestinacaoDrawer } from "./destinacao-drawer";
import { RegistrarDestinacaoDrawer } from "./registrar-destinacao-drawer";

const TITULO = "Destinações";
const DESCRICAO = "Venda, doação, consumo próprio, perda ou compostagem.";

/** Cabeçalho + drawers (`?destinacao=<id>`, `?registrar=1`). */
export function DestinacoesCabecalho() {
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
              <Plus aria-hidden /> Registrar destinação
            </Button>
          ) : undefined
        }
      />
      {podeEditar ? (
        <Button hideFrom="md" w="full" onClick={() => url.abrir("registrar")}>
          <Plus aria-hidden /> Registrar destinação
        </Button>
      ) : null}
      <RegistrarDestinacaoDrawer
        open={url.aberto("registrar") === "1" && podeEditar}
        onOpenChange={(open) => (open ? url.abrir("registrar") : url.fechar("registrar"))}
        onRegistrada={(id) => {
          url.recarregar();
          url.abrir("destinacao", id);
        }}
      />
      <DestinacaoDrawer podeEditar={podeEditar} />
    </>
  );
}

export function DestinacoesCabecalhoEstatico() {
  return <PageHeader hideBelow="md" title={TITULO} description={DESCRICAO} />;
}
