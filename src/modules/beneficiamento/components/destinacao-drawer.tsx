"use client";

import { Button, Flex, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Ban, FileX } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { RecordDetails, type RecordDetailsItem } from "@/components/data-display/record-details";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Alert } from "@/components/feedback/alert";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  cancelarDestinacaoAction,
  detalheDaDestinacaoAction,
  type DetalheDaDestinacao,
} from "@/lib/beneficiamento/actions";
import { TIPO_DE_DESTINACAO_LABEL, type Destinacao, type ItemDoProcessamento } from "@/lib/beneficiamento/types";
import { formatData, formatMoeda, formatQuantidade, toNumber } from "@/lib/estoque/format";
import { useListaUrl } from "@/lib/use-lista-url";
import { CancelarRegistroDialog } from "./cancelar-registro-dialog";
import { TipoDeDestinacaoBadge } from "./tipo-de-destinacao";

const qtd = (i: ItemDoProcessamento) => (i.unidade ? formatQuantidade(i.quantidade, i.unidade) : i.quantidade);

/** Detalhe da destinação (`?destinacao=<id>`), carregado no cliente. */
export function DestinacaoDrawer({ podeEditar }: { podeEditar: boolean }) {
  const url = useListaUrl();
  const { expireSession } = useAuth();
  const id = url.aberto("destinacao");
  const [dados, setDados] = useState<{ id: string; r: DetalheDaDestinacao } | null>(null);
  const [versao, setVersao] = useState(0);
  const [cancelando, setCancelando] = useState(false);

  const aoCarregar = useEffectEvent((did: string, r: DetalheDaDestinacao) => {
    if (r.status === "unauthenticated") expireSession();
    setDados({ id: did, r });
  });

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    void detalheDaDestinacaoAction(id).then((r) => {
      if (vivo) aoCarregar(id, r);
    });
    return () => {
      vivo = false;
    };
  }, [id, versao]);

  const atual = dados && dados.id === id ? dados.r : null;
  const dest = atual?.status === "ok" ? atual.destinacao : null;

  return (
    <>
      <Drawer
        open={Boolean(id)}
        onOpenChange={(d) => {
          if (!d.open) url.fechar("destinacao");
        }}
        title={dest ? `${TIPO_DE_DESTINACAO_LABEL[dest.tipo]} de ${formatData(dest.data)}` : "Destinação"}
        size="md"
        bottomSheetOnMobile
        footer={
          podeEditar && dest?.situacao === "REGISTRADO" ? (
            <Flex w="full" justify="flex-end">
              <Button variant="outline" colorPalette="red" onClick={() => setCancelando(true)}>
                <Ban aria-hidden /> Cancelar destinação
              </Button>
            </Flex>
          ) : undefined
        }
      >
        {!id ? null : !atual ? (
          <Stack gap="4" aria-busy="true" aria-label="Carregando destinação">
            <Skeleton h="5" w="40%" />
            <Skeleton h="32" />
          </Stack>
        ) : atual.status === "not_found" ? (
          <EmptyState variant="in-card" size="sm" icon={FileX} title="Destinação não encontrada" description="Ela pode ser de outra propriedade." />
        ) : atual.status === "unavailable" ? (
          <ErrorState size="sm" onRetry={() => setVersao((v) => v + 1)} />
        ) : dest ? (
          <DetalheView dest={dest} />
        ) : null}
      </Drawer>

      {dest ? (
        <CancelarRegistroDialog
          open={cancelando}
          onOpenChange={setCancelando}
          titulo="Cancelar destinação?"
          subtitulo={`${TIPO_DE_DESTINACAO_LABEL[dest.tipo]} de ${formatData(dest.data)}`}
          explicacao={
            dest.tipo === "COMPOSTAGEM"
              ? "Os lotes voltam ao estoque e o lote de adubo é desfeito."
              : "Os lotes voltam ao estoque de produção."
          }
          rotuloConfirmar="Cancelar destinação"
          placeholder="Ex.: venda registrada em duplicidade"
          onConfirmar={(motivo) => cancelarDestinacaoAction(dest.id, motivo)}
          onCancelado={() => {
            setCancelando(false);
            NotificationToast.success({ title: "Destinação cancelada", description: "Os lotes voltaram ao estoque." });
            setVersao((v) => v + 1);
            url.recarregar();
          }}
          onSessaoExpirada={expireSession}
        />
      ) : null}
    </>
  );
}

function DetalheView({ dest }: { dest: Destinacao }) {
  const itens: RecordDetailsItem[] = dest.lotes.map((l) => ({
    key: l.loteId,
    label: (
      <>
        {l.nome}
        {l.codigo ? (
          <Text as="span" fontFamily="mono" color="fg.muted" ms="1.5">
            {l.codigo}
          </Text>
        ) : null}
      </>
    ),
    value: (
      <Text as="span" fontWeight="600" fontVariantNumeric="tabular-nums">
        {qtd(l)}
        {l.custo !== null ? (
          <Text as="span" fontWeight="400" color="fg.muted">
            {" "}
            · custo {formatMoeda(l.custo)}
          </Text>
        ) : null}
      </Text>
    ),
  }));

  const venda: RecordDetailsItem[] =
    dest.tipo === "VENDA"
      ? [
          { label: "Comprador", value: dest.comprador || "Não informado" },
          { label: "Valor", value: dest.valor_total === null ? "Não informado" : formatMoeda(dest.valor_total) },
          ...(dest.valor_total !== null && dest.kg > 0
            ? [{ label: "Preço médio", value: `${formatMoeda(toNumber(dest.valor_total) / dest.kg)}/kg` }]
            : []),
        ]
      : [];

  return (
    <Stack gap="6">
      <HStack gap="2" wrap="wrap">
        <TipoDeDestinacaoBadge tipo={dest.tipo} />
        {/* sm: mesma altura do badge de tipo ao lado */}
        <StatusBadge status={dest.situacao === "CANCELADO" ? "cancelado" : "registrado"} size="sm" />
      </HStack>

      {dest.situacao === "CANCELADO" ? (
        <Alert status="warning" title="Destinação cancelada" description={dest.motivo_do_cancelamento || "Sem motivo informado."} />
      ) : null}

      <RecordDetails
        columns={1}
        surface="none"
        headingAs="h3"
        sections={[
          { key: "lotes", title: "O que saiu do estoque", items: itens },
          ...(venda.length ? [{ key: "venda", title: "Venda", items: venda }] : []),
          ...(dest.composto
            ? [
                {
                  key: "composto",
                  title: "Adubo gerado",
                  items: [{ label: dest.composto.nome, value: qtd(dest.composto) }],
                },
              ]
            : []),
          ...(dest.observacoes
            ? [{ key: "obs", title: "Observações", items: [{ label: "Observações", value: dest.observacoes }] }]
            : []),
        ]}
      />
      <Text fontSize="sm" color="fg.muted">
        Registrada em {formatData(dest.criado_em)}.
      </Text>
    </Stack>
  );
}
