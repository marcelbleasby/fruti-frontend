"use client";

import { Box, Button, Flex, HStack, Link, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Ban, FileX } from "lucide-react";
import NextLink from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { Progress } from "@/components/data-display/progress";
import { RecordDetails, type RecordDetailsItem } from "@/components/data-display/record-details";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Alert } from "@/components/feedback/alert";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  cancelarProcessamentoAction,
  detalheDoProcessamentoAction,
  type DetalheDoProcessamento,
} from "@/lib/beneficiamento/actions";
import type { ItemDoProcessamento, Processamento } from "@/lib/beneficiamento/types";
import { formatData, formatMoeda, formatQuantidade, toNumber } from "@/lib/estoque/format";
import { useListaUrl } from "@/lib/use-lista-url";
import { CancelarRegistroDialog } from "./cancelar-registro-dialog";

const qtd = (i: ItemDoProcessamento) => (i.unidade ? formatQuantidade(i.quantidade, i.unidade) : i.quantidade);

/** Detalhe do processamento (`?processamento=<id>`), carregado no cliente. */
export function ProcessamentoDrawer({ podeEditar }: { podeEditar: boolean }) {
  const url = useListaUrl();
  const { expireSession } = useAuth();
  const id = url.aberto("processamento");
  const [dados, setDados] = useState<{ id: string; r: DetalheDoProcessamento } | null>(null);
  const [versao, setVersao] = useState(0);
  const [cancelando, setCancelando] = useState(false);

  const aoCarregar = useEffectEvent((pid: string, r: DetalheDoProcessamento) => {
    if (r.status === "unauthenticated") expireSession();
    setDados({ id: pid, r });
  });

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    void detalheDoProcessamentoAction(id).then((r) => {
      if (vivo) aoCarregar(id, r);
    });
    return () => {
      vivo = false;
    };
  }, [id, versao]);

  const atual = dados && dados.id === id ? dados.r : null;
  const proc = atual?.status === "ok" ? atual.processamento : null;
  const cancelavel = podeEditar && proc?.situacao === "REGISTRADO";

  return (
    <>
      <Drawer
        open={Boolean(id)}
        onOpenChange={(d) => {
          if (!d.open) url.fechar("processamento");
        }}
        title={proc ? `Processamento de ${formatData(proc.data)}` : "Processamento"}
        size="md"
        bottomSheetOnMobile
        footer={
          cancelavel ? (
            <Flex w="full" justify="flex-end">
              <Button variant="outline" colorPalette="red" onClick={() => setCancelando(true)}>
                <Ban aria-hidden /> Cancelar processamento
              </Button>
            </Flex>
          ) : undefined
        }
      >
        {!id ? null : !atual ? (
          <Stack gap="4" aria-busy="true" aria-label="Carregando processamento">
            <Skeleton h="5" w="40%" />
            <Skeleton h="20" />
            <Skeleton h="40" />
          </Stack>
        ) : atual.status === "not_found" ? (
          <EmptyState
            variant="in-card"
            size="sm"
            icon={FileX}
            title="Processamento não encontrado"
            description="Ele pode ser de outra propriedade."
          />
        ) : atual.status === "unavailable" ? (
          <ErrorState size="sm" onRetry={() => setVersao((v) => v + 1)} />
        ) : proc ? (
          <DetalheView proc={proc} />
        ) : null}
      </Drawer>

      {proc ? (
        <CancelarRegistroDialog
          open={cancelando}
          onOpenChange={setCancelando}
          titulo="Cancelar processamento?"
          subtitulo={`Processamento de ${formatData(proc.data)}`}
          explicacao="Os lotes voltam ao estoque e os produtos gerados são desfeitos."
          rotuloConfirmar="Cancelar processamento"
          placeholder="Ex.: quantidade de polpa lançada errada"
          onConfirmar={(motivo) => cancelarProcessamentoAction(proc.id, motivo)}
          onCancelado={() => {
            setCancelando(false);
            NotificationToast.success({ title: "Processamento cancelado", description: "O estoque voltou ao que era antes." });
            setVersao((v) => v + 1);
            url.recarregar();
          }}
          onSessaoExpirada={expireSession}
        />
      ) : null}
    </>
  );
}

function DetalheView({ proc }: { proc: Processamento }) {
  const pct = proc.rendimento.rendimento_pct === null ? null : toNumber(proc.rendimento.rendimento_pct);
  const kgEntrada = toNumber(proc.rendimento.kg_de_entrada);

  const itens = (lista: ItemDoProcessamento[], comLink = false): RecordDetailsItem[] =>
    lista.map((i) => ({
      key: i.loteId,
      label: (
        <>
          {i.nome}
          {i.codigo ? (
            <Text as="span" fontFamily="mono" color="fg.muted" ms="1.5">
              {i.codigo}
            </Text>
          ) : null}
        </>
      ),
      value: (
        <Flex direction="column" gap="0.5">
          <Text as="span" fontWeight="600" fontVariantNumeric="tabular-nums">
            {qtd(i)}
            {i.custo !== null ? (
              <Text as="span" fontWeight="400" color="fg.muted">
                {" "}
                · {formatMoeda(i.custo)}
              </Text>
            ) : null}
          </Text>
          {comLink ? (
            <Link asChild fontSize="sm" color="primary" textDecoration="underline" textUnderlineOffset="3px">
              <NextLink href={`/estoque-de-producao?lote=${i.loteId}`}>Ver lote no estoque</NextLink>
            </Link>
          ) : null}
        </Flex>
      ),
    }));

  const custos: RecordDetailsItem[] = [
    ...(proc.custo_adicional !== null ? [{ label: "Custo adicional", value: formatMoeda(proc.custo_adicional) }] : []),
    {
      label: "Custo total",
      value:
        proc.custoTotal === null
          ? "Sem custo informado"
          : `${formatMoeda(proc.custoTotal)}${proc.custoIncompleto ? " (alguma entrada sem custo)" : ""}`,
    },
  ];

  return (
    <Stack gap="6">
      <HStack gap="2" wrap="wrap">
        <StatusBadge status={proc.situacao === "CANCELADO" ? "cancelado" : "registrado"} />
        <Text fontSize="sm" color="fg.muted">
          Registrado em {formatData(proc.criado_em)}
        </Text>
      </HStack>

      {proc.situacao === "CANCELADO" ? (
        <Alert
          status="warning"
          title="Processamento cancelado"
          description={proc.motivo_do_cancelamento || "Sem motivo informado."}
        />
      ) : null}

      <Box p="4" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border">
        {pct === null ? (
          <Text fontSize="sm" color="fg.muted">
            Sem rendimento: nenhuma entrada em kg.
          </Text>
        ) : (
          <Progress
            label="Rendimento"
            value={Math.min(100, pct)}
            showValueText
            formatValue={() => `${pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
            helperText={`${formatQuantidade(kgEntrada, "QUILOGRAMA")} de entrada · ${formatQuantidade(proc.perda_kg, "QUILOGRAMA")} de descarte`}
          />
        )}
      </Box>

      <RecordDetails
        columns={1}
        surface="none"
        headingAs="h3"
        sections={[
          { key: "entradas", title: "Entradas", items: itens(proc.lotesDeEntrada) },
          ...(proc.insumosConsumidos.length
            ? [{ key: "insumos", title: "Insumos usados", items: itens(proc.insumosConsumidos) }]
            : []),
          // Cancelado: os lotes gerados foram desfeitos, então não há lote para abrir.
          { key: "saidas", title: "Produtos gerados", items: itens(proc.produtosGerados, proc.situacao === "REGISTRADO") },
          { key: "custos", title: "Custos", items: custos },
          ...(proc.observacoes
            ? [{ key: "obs", title: "Observações", items: [{ label: "Observações", value: proc.observacoes }] }]
            : []),
        ]}
      />
    </Stack>
  );
}
