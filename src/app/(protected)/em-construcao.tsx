"use client";

import { Construction } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout";

/** Provisório: ocupa a rota até a tela de verdade existir. */
export function EmConstrucao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <>
      <PageHeader title={titulo} description={descricao} hideBelow="md" />
      <EmptyState
        variant="first-use"
        icon={Construction}
        title="Tela em construção"
        description="O conteúdo desta seção vem a seguir."
        bordered
      />
    </>
  );
}
