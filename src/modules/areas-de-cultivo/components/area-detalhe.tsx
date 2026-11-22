"use client";

import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { Pencil, Plus, Trash2, Grid2x2Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ConfirmActionDialog } from "@/components/overlays/confirm-action-dialog";
import { excluirAreaAction, excluirUnidadeAction } from "@/lib/areas/actions";
import { useAuth } from "@/lib/auth/auth-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { AreaCode, AreaDetails, AreaUnitMap, CULTIVATION_UNIT_TYPE_LABEL, type AreaDetailsTab } from "@/modules/areas";
import { formatNumber } from "@/modules/format";
import type { Area, CultivationUnit, PlantingSummary } from "@/modules/types";
import { AreaFormDrawer } from "./area-formulario";
import { UnidadeFormDrawer } from "./unidade-formulario";

const ABAS: AreaDetailsTab[] = ["resumo", "unidades", "plantios"];
const m = (v: number) => `${formatNumber(v)} m`;

const colunas: ColumnDef<CultivationUnit>[] = [
  {
    key: "name",
    header: "Unidade",
    mobile: "title",
    cell: (u) => (
      <Flex align="baseline" gap="2" minW="0">
        <AreaCode color="primary">{u.code}</AreaCode>
        <Text as="span" fontWeight="600" color="fg.heading" truncate>
          {u.name}
        </Text>
      </Flex>
    ),
  },
  { key: "type", header: "Tipo", mobile: "subtitle", cell: (u) => CULTIVATION_UNIT_TYPE_LABEL[u.type] },
  {
    key: "medidas",
    header: "Medidas",
    cell: (u) => (
      <Text as="span" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
        {formatNumber(u.length)} × {m(u.width)}
      </Text>
    ),
  },
  {
    key: "area",
    header: "Área",
    numeric: true,
    cell: (u) => `${formatNumber(Math.round(u.length * u.width * 100) / 100)} m²`,
  },
  {
    key: "posicao",
    header: "Posição",
    cell: (u) =>
      u.x != null && u.y != null ? (
        <Text as="span" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
          X {m(u.x)} · Y {m(u.y)}
        </Text>
      ) : (
        <Text as="span" color="fg.muted">
          Sem posição
        </Text>
      ),
  },
];

export function AreaDetalhe({
  area,
  unidades,
  plantios,
  podeEditar,
}: {
  area: Area;
  unidades: CultivationUnit[];
  plantios: PlantingSummary[];
  podeEditar: boolean;
}) {
  const url = useListaUrl();
  const router = useRouter();
  const { expireSession } = useAuth();
  const [excluindo, setExcluindo] = useState<CultivationUnit | null>(null);

  const abaUrl = url.get("aba") as AreaDetailsTab | null;
  const aba = abaUrl && ABAS.includes(abaUrl) ? abaUrl : "resumo";
  // Aba na URL sem nova entrada no histórico e sem buscar os dados de novo.
  function trocarAba(nova: AreaDetailsTab) {
    const sp = new URLSearchParams(window.location.search);
    if (nova === "resumo") sp.delete("aba");
    else sp.set("aba", nova);
    const s = sp.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }

  const novaUnidade = () => url.setFiltros({ form: "unidade", alvo: null, aba: "unidades" });
  const editarUnidade = (u: CultivationUnit) => url.setFiltros({ form: "unidade", alvo: u.id, aba: "unidades" });
  const nomeDaArea = area.code ? `${area.code} · ${area.name}` : area.name;

  async function excluirUnidade() {
    if (!excluindo) return;
    const r = await excluirUnidadeAction(excluindo.id);
    if (r.status === "ok") {
      NotificationToast.success({ title: "Unidade excluída" });
      setExcluindo(null);
      url.recarregar();
    } else if (r.status === "unauthenticated") expireSession();
    else NotificationToast.error({ title: "Não foi possível excluir", description: r.message });
  }

  async function excluirArea() {
    const r = await excluirAreaAction(area.id);
    if (r.status === "ok") {
      NotificationToast.success({ title: "Área excluída" });
      router.push("/areas-de-cultivo");
    } else if (r.status === "unauthenticated") expireSession();
    else NotificationToast.error({ title: "Não foi possível excluir", description: r.message });
  }

  const conteudoUnidades = (
    <Stack gap="4">
      {unidades.length ? (
        <>
          <Flex
            direction="column"
            gap="3"
            p="5"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            borderRadius="l3"
            boxShadow="xs"
          >
            <Flex justify="space-between" align="center" gap="3" wrap="wrap">
              <Heading as="h2" textStyle="heading.md" color="fg.heading">
                Desenho da área
              </Heading>
              {podeEditar ? (
                <Button size="sm" variant="outline" onClick={novaUnidade}>
                  <Plus aria-hidden /> Nova unidade
                </Button>
              ) : null}
            </Flex>
            <AreaUnitMap length={area.length} width={area.width} units={unidades} maxWidth={720} />
          </Flex>
          <DataTable<CultivationUnit>
            caption={`Unidades de cultivo de ${area.name} — ${unidades.length} no total`}
            columns={colunas}
            data={unidades}
            getRowId={(u) => u.id}
            getRowLabel={(u) => u.name}
            onRowClick={podeEditar ? editarUnidade : undefined}
            rowActions={
              podeEditar
                ? (u) => [
                    { label: "Editar", icon: <Pencil />, onSelect: () => editarUnidade(u) },
                    { label: "Excluir", icon: <Trash2 />, danger: true, onSelect: () => setExcluindo(u) },
                  ]
                : undefined
            }
            minTableWidth="640px"
          />
        </>
      ) : (
        <EmptyState
          variant="first-use"
          size="md"
          icon={Grid2x2Plus}
          title="Nenhuma unidade de cultivo"
          description="Divida a área em canteiros e talhões para registrar plantios."
          actions={
            podeEditar ? (
              <Button onClick={novaUnidade}>
                <Plus aria-hidden /> Nova unidade
              </Button>
            ) : undefined
          }
        />
      )}
    </Stack>
  );

  return (
    <Stack gap="4">
      <Breadcrumb items={[{ label: "Áreas de cultivo", href: "/areas-de-cultivo" }, { label: area.name }]} />
      <AreaDetails
        area={area}
        plantings={plantios}
        tab={aba}
        onTabChange={trocarAba}
        units={conteudoUnidades}
        unitCount={unidades.length}
        showImages={false}
        showHistory={false}
        plantingListProps={{ hideCreate: true, getPlantingHref: (p) => `/plantios?plantio=${p.id}` }}
        actions={
          podeEditar ? (
            <Flex gap="2" wrap="wrap">
              <ConfirmActionDialog
                title={`Excluir ${nomeDaArea}?`}
                description={
                  unidades.length
                    ? "A área tem unidades de cultivo. Exclua as unidades antes."
                    : "A área sai da lista. Esta ação não pode ser desfeita aqui."
                }
                confirmLabel="Excluir área"
                tone="danger"
                onConfirm={excluirArea}
                trigger={
                  <Button variant="ghost" colorPalette="red">
                    <Trash2 aria-hidden /> Excluir
                  </Button>
                }
              />
              <Button variant="outline" onClick={() => url.setFiltros({ form: "area", alvo: area.id })}>
                <Pencil aria-hidden /> Editar
              </Button>
              <Button onClick={novaUnidade}>
                <Plus aria-hidden /> Nova unidade
              </Button>
            </Flex>
          ) : undefined
        }
      />
      <ConfirmActionDialog
        open={Boolean(excluindo)}
        onOpenChange={(o) => !o && setExcluindo(null)}
        title={excluindo ? `Excluir ${excluindo.name}?` : ""}
        description="Não é possível excluir uma unidade com plantio planejado ou em campo."
        confirmLabel="Excluir unidade"
        tone="danger"
        onConfirm={excluirUnidade}
      />
      {podeEditar ? (
        <>
          <AreaFormDrawer area={area} />
          <UnidadeFormDrawer area={area} unidades={unidades} />
        </>
      ) : null}
    </Stack>
  );
}
