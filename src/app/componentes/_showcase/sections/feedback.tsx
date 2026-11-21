"use client";

import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { CloudOff, Leaf, Search, Sprout, TriangleAlert } from "lucide-react";
import { useState } from "react";
import {
  Alert,
  ConcentricIndicator,
  EmptyState,
  ErrorState,
  NotificationBell,
  NotificationCenter,
  NotificationToast,
  SystemBanner,
  type EmptyStateSize,
  type ErrorStateVariant,
  type FeedbackStatus,
  type IndicatorTone,
  type NotificationItem,
} from "@/components/feedback";
import { Toaster } from "@/components/ui/toaster";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const STATUSES: FeedbackStatus[] = ["success", "info", "warning", "error"];

const ALERT_COPY: Record<FeedbackStatus, { title: string; description: string }> = {
  success: { title: "Plantio salvo", description: "PL-0044 foi cadastrado." },
  info: { title: "Dias quentes previstos", description: "Monitore a irrigação das áreas A-03 e A-05 nesta semana." },
  warning: { title: "Lote com estoque baixo", description: "LM-2026-014 tem 20 mudas disponíveis." },
  error: { title: "Sem permissão", description: "Seu perfil não pode editar o catálogo. A validação final é do backend." },
};

const SIZES: EmptyStateSize[] = ["sm", "md", "lg", "inline"];
const ERROR_VARIANTS: ErrorStateVariant[] = ["not-found", "server", "forbidden", "offline", "partial"];
const TONES: IndicatorTone[] = ["primary", "neutral", "danger", "warning", "info"];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", title: "Lote LM-2026-014 com estoque baixo", description: "20 mudas disponíveis de 500.", time: "09:20", group: "Hoje", read: false, tone: "warning" },
  { id: "n2", title: "Plantio PL-0044 criado", description: "Mamão · A-07 · Viveiro", time: "08:05", group: "Hoje", read: false, tone: "success" },
  { id: "n3", title: "3 imagens adicionadas", description: "PL-0039", time: "17/11", group: "Esta semana", read: true, tone: "info" },
  { id: "n4", title: "Falha ao enviar matriz_m07.heic", description: "Formato não aceito.", time: "16/11", group: "Esta semana", read: true, tone: "error" },
];

const wait = (ms: number, fail = false) =>
  new Promise<void>((resolve, reject) => window.setTimeout(() => (fail ? reject(new Error("falha")) : resolve()), ms));

export function FeedbackSection() {
  const [closedAlert, setClosedAlert] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  return (
    <ShowcaseSection
      id="feedback"
      title="Feedback"
      description="Toast para resultado de ação; Alert e SystemBanner para contexto que precisa ficar visível; estados vazio e de erro."
    >
      <Toaster />

      <Demo name="Alert" importPath="@/components/feedback">
        <VariantGrid min="360px">
          {STATUSES.map((status) => (
            <Variant key={status} label={`status ${status}`}>
              <Alert status={status} {...ALERT_COPY[status]} />
            </Variant>
          ))}
          <Variant label="com ação">
            <Alert status="warning" {...ALERT_COPY.warning} action={{ label: "Ver lote", onClick: () => {} }} />
          </Variant>
          <Variant label="fechável">
            {closedAlert ? (
              <Button size="sm" variant="outline" onClick={() => setClosedAlert(false)}>
                Mostrar de novo
              </Button>
            ) : (
              <Alert status="success" {...ALERT_COPY.success} onClose={() => setClosedAlert(true)} />
            )}
          </Variant>
          <Variant label="com conteúdo extra (children)">
            <Alert status="error" title="Corrija 2 campos para salvar">
              <Box as="ul" ps="4" textStyle="body.sm" listStyleType="disc">
                <li>Quantidade excede as 500 mudas do lote</li>
                <li>Informe a data de plantio</li>
              </Box>
            </Alert>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SystemBanner" importPath="@/components/feedback" description="Faixa global (sticky por padrão; aqui sem sticky).">
        <Stack gap="3">
          {STATUSES.map((status) => (
            <SystemBanner
              key={status}
              sticky={false}
              status={status}
              title={status === "warning" ? "Manutenção programada" : ALERT_COPY[status].title}
              description={status === "warning" ? "Sábado, 22/11, das 22h às 23h. Os registros feitos offline serão sincronizados." : undefined}
              action={status === "error" ? { label: "Tentar de novo", onClick: () => {} } : undefined}
            />
          ))}
        </Stack>
      </Demo>

      <Demo name="NotificationToast · Toaster" importPath="@/components/feedback · @/components/ui/toaster" description="Sucesso e informação somem em 5 s; erro e toasts com ação ficam até serem fechados.">
        <Variant label="dispare cada status">
          <Row>
            <Button variant="outline" onClick={() => NotificationToast.success({ title: "Plantio salvo", description: "PL-0044 foi cadastrado.", action: { label: "Ver", onClick: () => {} } })}>
              Sucesso
            </Button>
            <Button variant="outline" onClick={() => NotificationToast.info({ title: "Sincronização concluída", description: "12 registros enviados." })}>
              Informação
            </Button>
            <Button variant="outline" onClick={() => NotificationToast.warning({ title: "Estoque baixo", description: "LM-2026-014 tem 20 mudas." })}>
              Atenção
            </Button>
            <Button variant="outline" onClick={() => NotificationToast.error({ title: "Falha ao salvar", description: "Verifique a conexão e tente de novo." })}>
              Erro
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                NotificationToast.promise(wait(1500), {
                  loading: { title: "Salvando plantio…" },
                  success: { title: "Plantio salvo" },
                  error: { title: "Falha ao salvar" },
                })
              }
            >
              Promessa · sucesso
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                NotificationToast.promise(wait(1500, true), {
                  loading: { title: "Enviando imagem…" },
                  success: { title: "Imagem enviada" },
                  error: { title: "Falha no envio", description: "Tente novamente." },
                })
              }
            >
              Promessa · erro
            </Button>
            <Button variant="ghost" onClick={() => NotificationToast.dismiss()}>
              Fechar todos
            </Button>
          </Row>
        </Variant>
      </Demo>

      <Demo name="NotificationBell · NotificationCenter" importPath="@/components/feedback">
        <VariantGrid>
          <Variant label="NotificationBell · 0 / 3 / acima do máximo">
            <Row>
              <NotificationBell />
              <NotificationBell count={3} />
              <NotificationBell count={24} />
              <NotificationBell count={120} max={99} />
            </Row>
          </Variant>
          <Variant label="NotificationCenter (clique no sino)">
            <NotificationCenter
              notifications={notifications}
              onMarkAllRead={() => setNotifications((list) => list.map((n) => ({ ...n, read: true })))}
              onItemSelect={(item) => setNotifications((list) => list.map((n) => (n.id === item.id ? { ...n, read: true } : n)))}
              onViewAll={() => {}}
              onOpenPreferences={() => {}}
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="ConcentricIndicator" importPath="@/components/feedback">
        <Variant label="tons">
          <Row gap="6">
            {TONES.map((tone) => (
              <Stack key={tone} align="center" gap="2">
                <ConcentricIndicator icon={tone === "danger" ? TriangleAlert : tone === "info" ? CloudOff : Sprout} tone={tone} diameter={88} iconSize={28} />
                <Text textStyle="caption" color="fg.muted">
                  {tone}
                </Text>
              </Stack>
            ))}
          </Row>
        </Variant>
      </Demo>

      <Demo name="EmptyState" importPath="@/components/feedback" description="Variantes first-use · no-results · in-card · all-done em cada tamanho.">
        <Stack gap="4">
          <Variant label="first-use · lg · com checklist">
            <EmptyState headingAs="h4"
              variant="first-use"
              size="lg"
              icon={Sprout}
              title="Nenhum plantio ainda"
              description="Registre o primeiro plantio para acompanhar plantas, origem e histórico."
              actions={<Button>Novo plantio</Button>}
              checklist={[
                { title: "Cadastrar uma área", description: "A-03 · Talhão Norte", done: true },
                { title: "Cadastrar a espécie", description: "Manga", done: true },
                { title: "Registrar o plantio" },
              ]}
            />
          </Variant>
          <VariantGrid min="300px">
            {SIZES.map((size) => (
              <Variant key={`fu-${size}`} label={`first-use · ${size}`}>
                <EmptyState headingAs="h4"
                  variant="first-use"
                  size={size}
                  icon={Leaf}
                  title="Nenhuma espécie no catálogo"
                  description="Cadastre a primeira espécie para criar cultivares e plantios."
                  actions={<Button size="sm">Cadastrar espécie</Button>}
                />
              </Variant>
            ))}
            {SIZES.map((size) => (
              <Variant key={`nr-${size}`} label={`no-results · ${size}`}>
                <EmptyState headingAs="h4"
                  variant="no-results"
                  size={size}
                  icon={Search}
                  title="Nenhum resultado"
                  description="Nada com “Manga” em A-07 · Viveiro."
                  actions={
                    <Button size="sm" variant="outline">
                      Limpar filtros
                    </Button>
                  }
                />
              </Variant>
            ))}
            {SIZES.map((size) => (
              <Variant key={`ic-${size}`} label={`in-card · ${size}`}>
                <EmptyState headingAs="h4" variant="in-card" size={size} title="Sem imagens" description="Envie fotos das vistorias deste plantio." />
              </Variant>
            ))}
            {SIZES.map((size) => (
              <Variant key={`ad-${size}`} label={`all-done · ${size}`}>
                <EmptyState headingAs="h4" variant="all-done" size={size} title="Tudo em dia" description="Nenhuma notificação pendente." />
              </Variant>
            ))}
          </VariantGrid>
        </Stack>
      </Demo>

      <Demo name="ErrorState" importPath="@/components/feedback" description="404, 500, 403, sem conexão e falha parcial; tamanhos md, sm e compact.">
        <VariantGrid min="340px">
          {ERROR_VARIANTS.map((variant) => (
            <Variant key={variant} label={`variant ${variant}`}>
              <ErrorState headingAs="h4"
                variant={variant}
                focusOnMount={false}
                onRetry={() => wait(1200)}
                requestId={variant === "server" ? "req_7f3a9c21" : undefined}
                errorCode={variant === "server" ? 500 : undefined}
                occurredAt={variant === "server" ? "21/11/2026 09:14" : undefined}
                nextRetryIn={variant === "offline" ? 15 : undefined}
              />
            </Variant>
          ))}
          <Variant label="server · sm · 3 tentativas falhas">
            <ErrorState headingAs="h4" variant="server" size="sm" focusOnMount={false} failedAttempts={3} onRetry={() => wait(800)} />
          </Variant>
          <Variant label="server · compact (BentoTile)">
            <ErrorState headingAs="h4" variant="server" size="compact" focusOnMount={false} onRetry={() => {}} />
          </Variant>
          <Variant label="not-found · ações alternativas">
            <ErrorState headingAs="h4"
              variant="not-found"
              size="sm"
              focusOnMount={false}
              actions={
                <Button size="sm" variant="outline">
                  Voltar para plantios
                </Button>
              }
            />
          </Variant>
          <Variant label="retrying (forçado)">
            <ErrorState headingAs="h4" variant="server" size="sm" focusOnMount={false} onRetry={() => {}} retrying />
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
