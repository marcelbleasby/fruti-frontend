"use client";

import { Box, Button, Flex, HStack, Heading, Link, Skeleton, Stack, Text } from "@chakra-ui/react";
import { ArrowDownRight, ArrowUpRight, MinusCircle, PackageX, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { ActivityTimeline } from "@/components/data-display/activity-timeline";
import { Badge } from "@/components/data-display/badge";
import { RecordDetails } from "@/components/data-display/record-details";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { ConfirmActionDialog } from "@/components/overlays/confirm-action-dialog";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import { detalheDoLoteAction, excluirLoteAction, type DetalheDoLote } from "@/lib/estoque/actions";
import { formatData, formatMoeda, formatQuantidade, hojeISO, toNumber } from "@/lib/estoque/format";
import {
  CATEGORIA_LABEL,
  MOVIMENTACAO_LABEL,
  ORIGEM_LABEL,
  UNIDADE_LABEL,
  type Lote,
  type MovimentacaoApi,
  type TipoDeEstoque,
} from "@/lib/estoque/types";
import { useEstoqueUrl } from "../use-estoque-url";
import { MovimentacaoForm } from "./movimentacao-form";
import { SaldoCell } from "./saldo-cell";
import { ValidadeBadge } from "./validade-badge";

type Modo = "detalhe" | "PERDA" | "AJUSTE";

/** Drawer do lote, aberto por `?lote=<id>`. Carrega no cliente para não recarregar a lista. */
export function LoteDrawer({ tipo, podeEditar }: { tipo: TipoDeEstoque; podeEditar: boolean }) {
  const url = useEstoqueUrl();
  const { expireSession } = useAuth();
  const id = url.loteAberto;
  const [dados, setDados] = useState<{ id: string; versao: number; r: DetalheDoLote } | null>(null);
  const [versao, setVersao] = useState(0);
  const [modo, setModo] = useState<{ id: string | null; m: Modo }>({ id: null, m: "detalhe" });

  // Evento (não dependência): expireSession muda de identidade a cada render do AuthProvider.
  const aoCarregar = useEffectEvent((loteId: string, v: number, r: DetalheDoLote) => {
    if (r.status === "unauthenticated") expireSession();
    setDados({ id: loteId, versao: v, r });
  });

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    void detalheDoLoteAction(id, tipo).then((r) => {
      if (vivo) aoCarregar(id, versao, r);
    });
    return () => {
      vivo = false;
    };
  }, [id, tipo, versao]);

  const atual = dados && dados.id === id ? dados.r : null;
  const modoAtual: Modo = modo.id === id ? modo.m : "detalhe";
  const setModoAtual = (m: Modo) => setModo({ id, m });
  const lote = atual?.status === "ok" ? atual.lote : null;

  const editavel = podeEditar && tipo !== "producao" && lote !== null;
  const soEntrada = atual?.status === "ok" && atual.movimentacoes.every((m) => m.tipo === "ENTRADA");

  function depoisDeMudar(mensagem: string) {
    NotificationToast.success({ title: mensagem });
    setModoAtual("detalhe");
    setVersao((v) => v + 1);
    url.recarregar();
  }

  async function excluir() {
    if (!lote) return;
    const r = await excluirLoteAction(lote.id);
    if (r.status === "ok") {
      NotificationToast.success({ title: "Lote excluído" });
      url.fecharLote();
      url.recarregar();
    } else if (r.status === "unauthenticated") {
      expireSession();
    } else {
      NotificationToast.error({
        title: "Não foi possível excluir",
        description: r.status === "invalid" ? r.message : r.message,
      });
    }
  }

  const titulo =
    modoAtual === "PERDA" ? "Registrar perda" : modoAtual === "AJUSTE" ? "Ajustar saldo" : (lote?.material ?? "Lote");

  return (
    <Drawer
      open={Boolean(id)}
      onOpenChange={(d) => {
        if (!d.open) url.fecharLote();
      }}
      title={titulo}
      size="md"
      bottomSheetOnMobile
      footer={
        editavel && modoAtual === "detalhe" ? (
          <Flex w="full" gap="2" wrap="wrap" justify="space-between">
            {soEntrada ? (
              <ConfirmActionDialog
                title="Excluir este lote?"
                description="Se veio de outro lote, a quantidade usada volta para ele."
                confirmLabel="Excluir lote"
                tone="danger"
                onConfirm={excluir}
                trigger={
                  <Button variant="ghost" colorPalette="red">
                    <Trash2 aria-hidden /> Excluir
                  </Button>
                }
              />
            ) : (
              <span />
            )}
            <HStack gap="2">
              <Button variant="outline" onClick={() => setModoAtual("AJUSTE")}>
                <SlidersHorizontal aria-hidden /> Ajustar
              </Button>
              <Button
                variant="outline"
                colorPalette="red"
                onClick={() => setModoAtual("PERDA")}
                disabled={toNumber(lote?.saldo) <= 0}
              >
                <MinusCircle aria-hidden /> Registrar perda
              </Button>
            </HStack>
          </Flex>
        ) : undefined
      }
    >
      {!id ? null : !atual ? (
        <CarregandoLote />
      ) : atual?.status === "not_found" ? (
        <EmptyState
          variant="in-card"
          size="sm"
          icon={PackageX}
          title="Lote não encontrado"
          description="Ele pode ter sido excluído ou ser de outra propriedade."
        />
      ) : atual?.status === "unavailable" ? (
        <ErrorState size="sm" onRetry={() => setVersao((v) => v + 1)} />
      ) : atual?.status === "ok" && lote ? (
        modoAtual === "detalhe" ? (
          <DetalheDoLoteView
            lote={lote}
            origem={atual.origem}
            movimentacoes={atual.movimentacoes}
            somenteLeitura={tipo === "producao"}
            onAbrirLote={url.abrirLote}
          />
        ) : (
          <MovimentacaoForm
            key={modoAtual}
            lote={lote}
            tipo={modoAtual}
            onCancelar={() => setModoAtual("detalhe")}
            onConcluido={() => depoisDeMudar(modoAtual === "PERDA" ? "Perda registrada" : "Saldo ajustado")}
            onSessaoExpirada={expireSession}
          />
        )
      ) : (
        <CarregandoLote />
      )}
    </Drawer>
  );
}

function CarregandoLote() {
  return (
    <Stack gap="4" aria-busy="true" aria-label="Carregando lote">
      <Skeleton h="5" w="40%" />
      <Skeleton h="14" />
      <Skeleton h="40" />
      <Skeleton h="24" />
    </Stack>
  );
}

function sinal(m: MovimentacaoApi) {
  const n = toNumber(m.quantidade);
  return n > 0 ? "+" : n < 0 ? "−" : "";
}

function DetalheDoLoteView({
  lote,
  origem,
  movimentacoes,
  somenteLeitura,
  onAbrirLote,
}: {
  lote: Lote;
  origem: Lote | null;
  movimentacoes: MovimentacaoApi[];
  somenteLeitura: boolean;
  onAbrirLote: (id: string) => void;
}) {
  const u = UNIDADE_LABEL[lote.unidade].curta;
  const custoUnit =
    lote.custo_unitario === null ? "Sem custo informado" : `${formatMoeda(lote.custo_unitario)}/${u}${lote.custo_completo ? "" : " (incompleto)"}`;

  return (
    <Stack gap="6">
      <Stack gap="3">
        <HStack gap="2" wrap="wrap">
          <Badge tone={lote.categoria === "MUDA" ? "green" : lote.categoria === "SEMENTE" ? "harvest" : "gray"}>
            {CATEGORIA_LABEL[lote.categoria]}
          </Badge>
          <Text fontFamily="mono" fontSize="sm" color="fg.muted">
            {lote.codigo || "Sem código"}
          </Text>
          {lote.materialDetalhe ? (
            <Text fontSize="sm" color="fg.muted">
              · {lote.materialDetalhe}
            </Text>
          ) : null}
        </HStack>
        <Box p="4" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border">
          <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
            <Box flex="1" minW="200px">
              <Text textStyle="overline" color="fg.muted" mb="1">
                Saldo
              </Text>
              <SaldoCell saldo={lote.saldo} inicial={lote.quantidade_inicial} unidade={lote.unidade} size="lg" />
            </Box>
            <Box>
              <Text textStyle="overline" color="fg.muted" mb="1">
                Validade
              </Text>
              <ValidadeBadge validade={lote.validade} />
            </Box>
          </Flex>
        </Box>
      </Stack>

      <RecordDetails
        columns={2}
        surface="none"
        headingAs="h3"
        items={[
          { label: "Origem", value: ORIGEM_LABEL[lote.origem] },
          { label: "Entrada", value: formatData(lote.data_de_entrada) },
          ...(lote.fornecedor ? [{ label: "Fornecedor", value: lote.fornecedor }] : []),
          ...(lote.validade ? [{ label: "Validade", value: formatData(lote.validade) }] : []),
          ...(lote.taxa_de_germinacao_pct !== null
            ? [{ label: "Germinação", value: `${toNumber(lote.taxa_de_germinacao_pct).toLocaleString("pt-BR")}%` }]
            : []),
          ...(lote.lote_do_fabricante ? [{ label: "Lote do fabricante", value: lote.lote_do_fabricante }] : []),
          { label: "Custo total", value: formatMoeda(lote.custo_total) },
          { label: "Custo unitário", value: custoUnit },
          ...(origem
            ? [
                {
                  label: "Produzido a partir de",
                  span: "full" as const,
                  value: (
                    <Link as="button" color="primary" textDecoration="underline" onClick={() => onAbrirLote(origem.id)}>
                      {origem.codigo || "Lote sem código"} · {origem.material}
                    </Link>
                  ),
                },
              ]
            : []),
          ...(lote.procedencia ? [{ label: "Procedência", value: lote.procedencia, span: "full" as const }] : []),
          ...(lote.observacoes ? [{ label: "Observações", value: lote.observacoes, span: "full" as const }] : []),
        ]}
      />

      <Stack gap="3">
        <Heading as="h3" textStyle="heading.sm" color="fg.heading" m="0">
          Movimentações
        </Heading>
        <ActivityTimeline
          items={movimentacoes.map((m) => {
            const entrada = toNumber(m.quantidade) > 0;
            return {
              id: m.id,
              at: new Date(`${m.data}T12:00:00-03:00`),
              icon: entrada ? <ArrowUpRight /> : <ArrowDownRight />,
              title: `${MOVIMENTACAO_LABEL[m.tipo]} · ${sinal(m)}${formatQuantidade(Math.abs(toNumber(m.quantidade)), lote.unidade)}`,
              description: [m.justificativa, m.observacoes].filter(Boolean).join(" — ") || undefined,
            };
          })}
          formatDate={(d) => formatData(hojeISO(d))}
          emptyText="Nenhuma movimentação."
        />
        {somenteLeitura ? (
          <Text fontSize="sm" color="fg.muted">
            Para desfazer, cancele a colheita ou o processamento de origem.
          </Text>
        ) : null}
      </Stack>
    </Stack>
  );
}
