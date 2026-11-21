"use client";

import { Button, IconButton, Stack, Text } from "@chakra-ui/react";
import { Filter, Pencil, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { TextLink } from "@/components/navigation";
import {
  BottomSheet,
  ConfirmActionDialog,
  Dialog,
  Drawer,
  Popover,
  Tooltip,
  type DialogSize,
  type DrawerSize,
} from "@/components/overlays";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const DIALOG_COPY: Record<DialogSize, { title: string; subtitle: string; body: string }> = {
  sm: { title: "Remover imagem?", subtitle: "vistoria_linha_03.jpg", body: "A imagem sai da galeria do plantio." },
  md: { title: "Editar grupo", subtitle: "GR-0042-01 · Linhas 1 a 4", body: "Formulário curto: nome e quantidade de plantas do grupo." },
  lg: { title: "Detalhes do lote", subtitle: "LM-2026-014 · Mudas enxertadas", body: "Conteúdo longo: origem, disponibilidade, plantios e documentos ligados ao lote." },
};

function DialogDemo({ size }: { size: DialogSize }) {
  const [open, setOpen] = useState(false);
  const copy = DIALOG_COPY[size];
  return (
    <Dialog
      size={size}
      open={open}
      onOpenChange={(d) => setOpen(d.open)}
      title={copy.title}
      subtitle={copy.subtitle}
      trigger={<Button variant="outline">Abrir {size}</Button>}
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setOpen(false)}>Salvar</Button>
        </>
      }
    >
      <Text textStyle="body.sm">{copy.body}</Text>
    </Dialog>
  );
}

function DrawerDemo({ size, placement, mobileSheet, label }: { size?: DrawerSize; placement?: "start" | "end"; mobileSheet?: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer
      size={size}
      placement={placement}
      bottomSheetOnMobile={mobileSheet}
      open={open}
      onOpenChange={(d) => setOpen(d.open)}
      title="Filtros de plantios"
      trigger={
        <Button variant="outline">
          <Filter /> {label}
        </Button>
      }
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Limpar
          </Button>
          <Button onClick={() => setOpen(false)}>Ver 9 plantios</Button>
        </>
      }
    >
      <Stack gap="2">
        <Text textStyle="body.sm">Área: A-03 · Talhão Norte</Text>
        <Text textStyle="body.sm">Espécie: Manga</Text>
        <Text textStyle="body.sm">Status: Ativo</Text>
      </Stack>
    </Drawer>
  );
}

function BottomSheetDemo({ handle, close, label, children }: { handle?: boolean; close?: boolean; label: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <BottomSheet
      open={open}
      onOpenChange={(d) => setOpen(d.open)}
      title="Novo registro"
      showHandle={handle}
      showCloseButton={close}
      trigger={<Button variant="outline">{label}</Button>}
      footer={
        <Button w="full" onClick={() => setOpen(false)}>
          Continuar
        </Button>
      }
    >
      {children ?? (
        <Stack gap="2">
          <Text textStyle="body.sm">Plantio</Text>
          <Text textStyle="body.sm">Lote de mudas</Text>
          <Text textStyle="body.sm">Imagem</Text>
        </Stack>
      )}
    </BottomSheet>
  );
}

export function SobreposicoesSection() {
  const [result, setResult] = useState<string>("");

  return (
    <ShowcaseSection
      id="sobreposicoes"
      title="Sobreposições"
      description="Tooltip, Popover, Drawer, BottomSheet, Dialog e ConfirmActionDialog. Esc fecha e o foco volta ao gatilho."
    >
      <Demo name="Tooltip" importPath="@/components/overlays" description="Só repete o nome do controle; nunca informação essencial.">
        <Variant label="posições · com atalho · sem seta">
          <Row>
            <Tooltip content="Editar plantio" shortcut="E">
              <IconButton aria-label="Editar plantio" variant="outline">
                <Pencil />
              </IconButton>
            </Tooltip>
            <Tooltip content="Excluir" placement="bottom">
              <IconButton aria-label="Excluir" variant="outline">
                <Trash2 />
              </IconButton>
            </Tooltip>
            <Tooltip content="Filtros" placement="right" showArrow={false}>
              <IconButton aria-label="Filtros" variant="outline">
                <Filter />
              </IconButton>
            </Tooltip>
          </Row>
        </Variant>
      </Demo>

      <Demo name="Popover" importPath="@/components/overlays">
        <VariantGrid>
          <Variant label="gatilho padrão (?)">
            <Row>
              <Text textStyle="body.sm">Densidade</Text>
              <Popover title="O que é densidade?" triggerLabel="O que é densidade?">
                <Text textStyle="body.sm">Plantas por hectare: total de plantas ÷ área calculada.</Text>
              </Popover>
            </Row>
          </Variant>
          <Variant label="gatilho próprio · fechar · largura">
            <Popover
              title="Estoque baixo"
              trigger={<Button variant="outline" size="sm">LM-2026-014</Button>}
              showCloseButton
              width="320px"
              placement="bottom-start"
            >
              <Stack gap="2">
                <Text textStyle="body.sm">20 de 500 mudas disponíveis.</Text>
                <TextLink href="#sobreposicoes" variant="standalone">
                  Ver lote
                </TextLink>
              </Stack>
            </Popover>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Drawer" importPath="@/components/overlays" description="sm 320 · md 448 · lg 672; lateral end (padrão) ou start; vira BottomSheet no mobile se pedido.">
        <Variant label="tamanhos e lados">
          <Row>
            <DrawerDemo size="sm" label="sm · end" />
            <DrawerDemo size="md" label="md · end" />
            <DrawerDemo size="lg" label="lg · end" />
            <DrawerDemo placement="start" label="sm · start" />
            <DrawerDemo mobileSheet label="BottomSheet no mobile" />
          </Row>
        </Variant>
      </Demo>

      <Demo name="BottomSheet" importPath="@/components/overlays">
        <Variant label="com alça · com botão fechar">
          <Row>
            <BottomSheetDemo label="Padrão" />
            <BottomSheetDemo label="Com alça" handle />
            <BottomSheetDemo label="Com fechar" close />
          </Row>
        </Variant>
      </Demo>

      <Demo name="Dialog" importPath="@/components/overlays" description="sm 360 · md 460 · lg 672; no mobile md e lg ocupam a tela.">
        <Variant label="tamanhos">
          <Row>
            <DialogDemo size="sm" />
            <DialogDemo size="md" />
            <DialogDemo size="lg" />
          </Row>
        </Variant>
      </Demo>

      <Demo name="ConfirmActionDialog" importPath="@/components/overlays" description="Foco inicial em Cancelar; Promise mostra carregamento até resolver.">
        <VariantGrid>
          <Variant label="tone danger · async">
            <ConfirmActionDialog
              title="Encerrar PL-0042?"
              description="As 480 plantas saem dos indicadores de plantios ativos. O histórico é mantido."
              confirmLabel="Encerrar plantio"
              onConfirm={async () => {
                await wait(1200);
                setResult("PL-0042 encerrado");
              }}
              trigger={<Button colorPalette="red">Encerrar plantio</Button>}
            />
          </Variant>
          <Variant label="tone default">
            <ConfirmActionDialog
              tone="default"
              title="Reativar PL-0031?"
              description="O plantio volta a contar nos indicadores."
              confirmLabel="Reativar plantio"
              onConfirm={() => setResult("PL-0031 reativado")}
              trigger={<Button variant="outline">Reativar</Button>}
            />
          </Variant>
          <Variant label="loading forçado">
            <ConfirmActionDialog
              title="Excluir lote?"
              confirmLabel="Excluir lote"
              loading
              onConfirm={() => {}}
              trigger={<Button variant="outline">Abrir em carregamento</Button>}
            />
          </Variant>
        </VariantGrid>
        <Text textStyle="caption" color="fg.muted" aria-live="polite">
          {result || "Nenhuma confirmação ainda"}
        </Text>
      </Demo>
    </ShowcaseSection>
  );
}
