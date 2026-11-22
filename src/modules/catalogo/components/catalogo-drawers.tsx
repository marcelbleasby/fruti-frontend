"use client";

import { Button, Flex, Skeleton, Stack } from "@chakra-ui/react";
import { FileX, Plus, Trash2 } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { ConfirmActionDialog } from "@/components/overlays/confirm-action-dialog";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  detalheDaCultivarAction,
  detalheDaEspecieAction,
  excluirCultivarAction,
  excluirEspecieAction,
  type DetalheDaCultivar,
  type DetalheDaEspecie,
} from "@/lib/catalogo/actions";
import { useListaUrl } from "@/lib/use-lista-url";
import { CultivarDetails } from "@/modules/cultivars/components/cultivar-details";
import { SpeciesDetails } from "@/modules/species/components/species-details";

function Carregando({ rotulo }: { rotulo: string }) {
  return (
    <Stack gap="4" aria-busy="true" aria-label={rotulo}>
      <Skeleton h="6" w="50%" />
      <Skeleton h="32" />
      <Skeleton h="16" />
    </Stack>
  );
}

/** Carrega o detalhe pelo parâmetro da URL; `versao` força recarregar depois de editar. */
function useDetalhe<T extends { status: string }>(id: string | null, carregar: (id: string) => Promise<T>, versao: number) {
  const { expireSession } = useAuth();
  const [dados, setDados] = useState<{ id: string; r: T } | null>(null);
  const aoCarregar = useEffectEvent((did: string, r: T) => {
    if (r.status === "unauthenticated") expireSession();
    setDados({ id: did, r });
  });
  useEffect(() => {
    if (!id) return;
    let vivo = true;
    void carregar(id).then((r) => vivo && aoCarregar(id, r));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `carregar` é uma Server Action estável
  }, [id, versao]);
  return dados && dados.id === id ? dados.r : null;
}

/* ------------------------------------------------------------------ */

/** Espécie (`?especie=<id>`): SpeciesDetails do DS + ações da administração global. */
export function EspecieDrawer() {
  const url = useListaUrl();
  const { user, expireSession } = useAuth();
  const admin = Boolean(user?.administradorGlobal);
  const id = url.aberto("especie");
  // Recarrega ao voltar de um formulário (form some da URL).
  const versao = url.aberto("form") ? -1 : 0;
  const [extra, setExtra] = useState(0);
  const atual = useDetalhe<DetalheDaEspecie>(id, detalheDaEspecieAction, versao + extra);
  const esp = atual?.status === "ok" ? atual : null;

  async function excluir() {
    if (!id) return;
    const r = await excluirEspecieAction(id);
    if (r.status === "ok") {
      NotificationToast.success({ title: "Espécie excluída" });
      url.fechar("especie");
      url.recarregar();
    } else if (r.status === "unauthenticated") expireSession();
    else NotificationToast.error({ title: "Não foi possível excluir", description: r.status === "invalid" ? r.message : r.message });
  }

  return (
    <Drawer
      open={Boolean(id)}
      onOpenChange={(d) => !d.open && url.fechar("especie")}
      // O SpeciesDetails já mostra o nome em destaque; o título do drawer só dá o contexto.
      title="Espécie"
      size="md"
      bottomSheetOnMobile
      footer={
        admin && esp ? (
          <Flex w="full" gap="2" justify="space-between" wrap="wrap">
            <ConfirmActionDialog
              title={`Excluir ${esp.especie.name}?`}
              description={
                esp.cultivares.length
                  ? "A espécie tem cultivos. Exclua os cultivos antes."
                  : "Ela sai do catálogo; para só esconder, marque como inativa."
              }
              confirmLabel="Excluir espécie"
              tone="danger"
              onConfirm={excluir}
              trigger={
                <Button variant="ghost" colorPalette="red">
                  <Trash2 aria-hidden /> Excluir
                </Button>
              }
            />
            <Button variant="outline" onClick={() => url.setFiltros({ form: "cultivar", especieAlvo: id, pagina: url.get("pagina") })}>
              <Plus aria-hidden /> Nova cultivar
            </Button>
          </Flex>
        ) : undefined
      }
    >
      {!id ? null : !atual ? (
        <Carregando rotulo="Carregando espécie" />
      ) : atual.status === "not_found" ? (
        <EmptyState variant="in-card" size="sm" icon={FileX} title="Espécie não encontrada" description="Ela pode ter sido excluída do catálogo." />
      ) : atual.status === "unavailable" ? (
        <ErrorState size="sm" onRetry={() => setExtra((v) => v + 1)} />
      ) : esp ? (
        <SpeciesDetails
          species={esp.especie}
          relatedCultivars={esp.cultivares}
          getCultivarHref={(c) => `/cultivares?cultivar=${c.id}`}
          onEdit={admin ? () => url.setFiltros({ form: "especie", alvo: id, pagina: url.get("pagina") }) : undefined}
          headingAs="h3"
          borderWidth="0"
          boxShadow="none"
          p="0"
        />
      ) : null}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */

/** Cultivar (`?cultivar=<id>`): CultivarDetails do DS + ações da administração global. */
export function CultivarDrawer() {
  const url = useListaUrl();
  const { user, expireSession } = useAuth();
  const admin = Boolean(user?.administradorGlobal);
  const id = url.aberto("cultivar");
  const versao = url.aberto("form") ? -1 : 0;
  const [extra, setExtra] = useState(0);
  const atual = useDetalhe<DetalheDaCultivar>(id, detalheDaCultivarAction, versao + extra);
  const cv = atual?.status === "ok" ? atual : null;

  async function excluir() {
    if (!id) return;
    const r = await excluirCultivarAction(id);
    if (r.status === "ok") {
      NotificationToast.success({ title: "Cultivo excluído" });
      url.fechar("cultivar");
      url.recarregar();
    } else if (r.status === "unauthenticated") expireSession();
    else NotificationToast.error({ title: "Não foi possível excluir", description: r.message });
  }

  return (
    <Drawer
      open={Boolean(id)}
      onOpenChange={(d) => !d.open && url.fechar("cultivar")}
      title="Cultivo"
      size="md"
      bottomSheetOnMobile
      footer={
        admin && cv ? (
          <Flex w="full" justify="flex-start">
            <ConfirmActionDialog
              title={`Excluir o cultivo ${cv.cultivar.name}?`}
              description="Ele sai do catálogo de todas as propriedades."
              confirmLabel="Excluir cultivo"
              tone="danger"
              onConfirm={excluir}
              trigger={
                <Button variant="ghost" colorPalette="red">
                  <Trash2 aria-hidden /> Excluir
                </Button>
              }
            />
          </Flex>
        ) : undefined
      }
    >
      {!id ? null : !atual ? (
        <Carregando rotulo="Carregando cultivo" />
      ) : atual.status === "not_found" ? (
        <EmptyState variant="in-card" size="sm" icon={FileX} title="Cultivo não encontrado" description="Ela pode ter sido excluída do catálogo." />
      ) : atual.status === "unavailable" ? (
        <ErrorState size="sm" onRetry={() => setExtra((v) => v + 1)} />
      ) : cv ? (
        <CultivarDetails
          cultivar={cv.cultivar}
          species={{ id: cv.especie.id, name: cv.especie.name, scientificName: cv.especie.scientificName }}
          speciesHref={`/especies?especie=${cv.especie.id}`}
          onEdit={admin ? () => url.setFiltros({ form: "cultivar", alvo: id, pagina: url.get("pagina") }) : undefined}
          headingAs="h3"
          borderWidth="0"
          boxShadow="none"
          p="0"
        />
      ) : null}
    </Drawer>
  );
}
