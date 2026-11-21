"use client";

import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { Archive, Copy, Download, Pencil, Printer, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  ActionMenu,
  Collapsible,
  Pagination,
  PaginationLoadMore,
  SkipNavContent,
  SkipNavLink,
  Steps,
  Tabs,
  TextLink,
  type ActionMenuEntry,
  type StepsItem,
  type TabsItem,
} from "@/components/navigation";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const TAB_ITEMS: TabsItem[] = [
  { value: "resumo", label: "Resumo", content: <Text textStyle="body.sm">Resumo do plantio PL-0042.</Text> },
  { value: "plantas", label: "Plantas", count: 480, content: <Text textStyle="body.sm">480 plantas em 2 grupos e 32 individuais.</Text> },
  { value: "imagens", label: "Imagens", count: 8, content: <Text textStyle="body.sm">8 imagens enviadas.</Text> },
  { value: "historico", label: "Histórico", content: <Text textStyle="body.sm">Últimas alterações.</Text> },
  { value: "documentos", label: "Documentos", disabled: true, content: null },
];

const VIEW_TABS: TabsItem[] = [
  { value: "grafico", label: "Gráfico", content: <Text textStyle="body.sm">Visualização em gráfico.</Text> },
  { value: "tabela", label: "Tabela", content: <Text textStyle="body.sm">Visualização em tabela.</Text> },
];

const MENU_ITEMS: ActionMenuEntry[] = [
  { value: "editar", label: "Editar plantio", icon: Pencil, shortcut: "E" },
  { value: "duplicar", label: "Duplicar", icon: Copy },
  {
    value: "exportar",
    label: "Exportar",
    icon: Download,
    items: [
      { value: "csv", label: "CSV" },
      { value: "pdf", label: "PDF" },
    ],
  },
  { value: "imprimir", label: "Imprimir", icon: Printer, disabled: true },
  { type: "separator" },
  { value: "arquivar", label: "Arquivar", icon: Archive },
  { value: "excluir", label: "Excluir plantio", icon: Trash2, destructive: true },
];

const STEP_ITEMS: StepsItem[] = [
  { title: "Espécie e cultivar", description: "Manga · Tommy Atkins", content: <Text textStyle="body.sm">Escolha a espécie e, se quiser, a cultivar.</Text> },
  { title: "Área", description: "A-03 · Talhão Norte", content: <Text textStyle="body.sm">Selecione a área do plantio.</Text> },
  { title: "Origem", description: "Mudas · LM-2026-014", content: <Text textStyle="body.sm">Informe o lote de origem.</Text> },
  { title: "Revisão", content: <Text textStyle="body.sm">Confira os dados antes de salvar.</Text> },
];

export function NavegacaoSection() {
  const [page, setPage] = useState(2);
  const [step, setStep] = useState(1);
  const [loaded, setLoaded] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const loadMore = () => {
    setLoadingMore(true);
    window.setTimeout(() => {
      setLoaded((n) => Math.min(n + 20, 54));
      setLoadingMore(false);
    }, 800);
  };

  return (
    <ShowcaseSection
      id="navegacao"
      title="Navegação"
      description="Abas, menus de ação, paginação, passos, links e conteúdo recolhível."
    >
      <Demo name="Tabs" importPath="@/components/navigation" description="line (padrão, com contagens) e enclosed (troca de visualização).">
        <VariantGrid min="420px">
          <Variant label="variant line · com contagem e aba desabilitada">
            <Tabs items={TAB_ITEMS} defaultValue="resumo" aria-label="Seções do plantio" />
          </Variant>
          <Variant label="variant enclosed">
            <Tabs items={VIEW_TABS} variant="enclosed" defaultValue="grafico" aria-label="Visualização" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="ActionMenu" importPath="@/components/navigation" description="Itens com ícone, atalho, submenu, desabilitado, separador e ação destrutiva.">
        <VariantGrid>
          <Variant label="gatilho padrão · tamanhos sm / md / lg">
            <Row>
              <ActionMenu label="Ações do plantio PL-0042" items={MENU_ITEMS} triggerSize="sm" onSelect={setLastAction} />
              <ActionMenu label="Ações do plantio PL-0042" items={MENU_ITEMS} onSelect={setLastAction} />
              <ActionMenu label="Ações do plantio PL-0042" items={MENU_ITEMS} triggerSize="lg" onSelect={setLastAction} />
            </Row>
          </Variant>
          <Variant label="gatilho próprio">
            <ActionMenu
              label="Compartilhar"
              items={[
                { value: "link", label: "Copiar link", icon: Copy },
                { value: "email", label: "Enviar por e-mail", icon: Share2 },
              ]}
              trigger={
                <Button variant="outline" size="sm">
                  <Share2 /> Compartilhar
                </Button>
              }
              onSelect={setLastAction}
            />
          </Variant>
        </VariantGrid>
        <Text textStyle="caption" color="fg.muted" aria-live="polite">
          {lastAction ? `Última ação: ${lastAction}` : "Nenhuma ação escolhida"}
        </Text>
      </Demo>

      <Demo name="Pagination · PaginationLoadMore" importPath="@/components/navigation">
        <Stack gap="4">
          <Variant label="variant full">
            <Pagination count={140} pageSize={10} page={page} onPageChange={setPage} variant="full" />
          </Variant>
          <VariantGrid>
            <Variant label="variant compact">
              <Pagination count={140} pageSize={10} page={page} onPageChange={setPage} variant="compact" />
            </Variant>
            <Variant label="variant responsive (padrão)">
              <Pagination count={140} pageSize={10} page={page} onPageChange={setPage} />
            </Variant>
            <Variant label="PaginationLoadMore (mobile)">
              <PaginationLoadMore loaded={loaded} total={54} itemLabel="plantios" onLoadMore={loadMore} loading={loadingMore} />
            </Variant>
          </VariantGrid>
        </Stack>
      </Demo>

      <Demo name="Steps" importPath="@/components/navigation" description="Passo concluído com ícone; o atual recebe aria-current.">
        <VariantGrid min="420px">
          <Variant label="controlado · com navegação">
            <Steps
              items={STEP_ITEMS}
              step={step}
              onStepChange={(d) => setStep(d.step)}
              showNavigation
              completedContent={<Text textStyle="body.sm">Plantio pronto para salvar.</Text>}
            />
          </Variant>
          <Variant label="somente indicador · passo 3 de 4">
            <Steps items={STEP_ITEMS.map(({ title, description }) => ({ title, description }))} defaultStep={2} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="TextLink" importPath="@/components/navigation">
        <VariantGrid>
          <Variant label="variant inline">
            <Text textStyle="body.sm">
              O lote <TextLink href="#navegacao">LM-2026-014</TextLink> originou o plantio PL-0042.
            </Text>
          </Variant>
          <Variant label="variant standalone">
            <TextLink href="#navegacao" variant="standalone">
              Ver todos os plantios
            </TextLink>
          </Variant>
          <Variant label="external">
            <TextLink href="https://www.embrapa.br" external>
              Zoneamento agrícola (Embrapa)
            </TextLink>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Accordion · Collapsible" importPath="@/components/navigation">
        <VariantGrid min="380px">
          <Variant label="Accordion · múltiplas seções, uma desabilitada">
            <Accordion
              defaultValue={["dados"]}
              items={[
                { value: "dados", title: "Dados do plantio", content: <Text textStyle="body.sm">Manga · Tommy Atkins · A-03.</Text> },
                { value: "origem", title: "Origem do material", content: <Text textStyle="body.sm">Mudas · LM-2026-014.</Text> },
                { value: "obs", title: "Observações", content: null, disabled: true },
              ]}
            />
          </Variant>
          <Variant label="Collapsible · rótulo aberto/fechado">
            <Collapsible label="Ver detalhes técnicos" openLabel="Ocultar detalhes técnicos">
              <Text textStyle="body.sm">Código da requisição: req_7f3a9c21</Text>
            </Collapsible>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SkipNavLink · SkipNavContent" importPath="@/components/navigation" description="Aparece ao receber foco pelo teclado (Tab). Leva ao conteúdo marcado.">
        <Variant label="Tab dentro da caixa para ver o link">
          <Box position="relative" minH="24">
            <SkipNavLink contentId="demo-conteudo" />
            <Text textStyle="body.sm" color="fg.muted">
              Pressione Tab aqui para revelar “Pular para o conteúdo”.
            </Text>
            <SkipNavContent id="demo-conteudo">
              <Text textStyle="body.sm" mt="3">
                Conteúdo principal (destino do link).
              </Text>
            </SkipNavContent>
          </Box>
        </Variant>
      </Demo>
    </ShowcaseSection>
  );
}
