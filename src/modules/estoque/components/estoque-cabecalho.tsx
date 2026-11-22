"use client";

import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { usePropriedade } from "@/lib/propriedades/propriedade-context";
import type { TipoDeEstoque } from "@/lib/estoque/types";
import { useEstoqueUrl } from "../use-estoque-url";
import { EntradaDrawer } from "./entrada-drawer";
import { LoteDrawer } from "./lote-drawer";

export const TEXTOS_DO_ESTOQUE: Record<TipoDeEstoque, { titulo: string; descricao: string }> = {
  vegetal: { titulo: "Mudas e sementes", descricao: "Lotes de mudas e sementes, com saldo e validade." },
  insumos: { titulo: "Insumos", descricao: "Lotes e saldos dos insumos da propriedade." },
  // Título completo: fora do menu não há o grupo "Estoque" para dar contexto.
  producao: { titulo: "Estoque de produção", descricao: "Fruta colhida e produtos processados." },
};

/** Cabeçalho da tela + drawers (lote e entrada), controlados pela URL. */
export function EstoqueCabecalho({ tipo }: { tipo: TipoDeEstoque }) {
  const url = useEstoqueUrl();
  const { ativa } = usePropriedade();
  const podeEditar = ativa?.meuPapel === "PROPRIETARIO";
  const registra = tipo !== "producao";
  const textos = TEXTOS_DO_ESTOQUE[tipo];

  return (
    <>
      <PageHeader
        hideBelow="md"
        title={textos.titulo}
        description={textos.descricao}
        actions={
          registra && podeEditar ? (
            <Button onClick={url.abrirEntrada}>
              <Plus aria-hidden /> Registrar entrada
            </Button>
          ) : undefined
        }
      />
      {registra && podeEditar ? (
        <Button hideFrom="md" w="full" onClick={url.abrirEntrada}>
          <Plus aria-hidden /> Registrar entrada
        </Button>
      ) : null}
      {registra ? (
        <EntradaDrawer
          tipo={tipo}
          open={url.entradaAberta && podeEditar}
          onOpenChange={(open) => (open ? url.abrirEntrada() : url.fecharEntrada())}
          onCriado={(id) => {
            url.recarregar();
            url.abrirLote(id);
          }}
        />
      ) : null}
      <LoteDrawer tipo={tipo} podeEditar={podeEditar} />
    </>
  );
}

/** Versão estática (sem URL/ações) para o fallback do Suspense. */
export function EstoqueCabecalhoEstatico({ tipo }: { tipo: TipoDeEstoque }) {
  const textos = TEXTOS_DO_ESTOQUE[tipo];
  return <PageHeader hideBelow="md" title={textos.titulo} description={textos.descricao} />;
}
