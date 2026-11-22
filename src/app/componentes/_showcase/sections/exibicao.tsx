"use client";

import { Box, Button, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { CircleCheck, Edit, Images, LandPlot, Leaf, Sprout, Trash2, Wheat } from "lucide-react";
import { useState } from "react";
import {
  ActivityTimeline,
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  Code,
  CountBadge,
  DataList,
  DataTable,
  HighlightText,
  Image,
  Kbd,
  KbdShortcut,
  LoadingState,
  Mark,
  MetricCard,
  Progress,
  ProgressCircle,
  RecordDetails,
  SelectableTag,
  Separator,
  Skeleton,
  SkeletonCircle,
  SkeletonDetails,
  SkeletonInline,
  SkeletonList,
  SkeletonMetricCard,
  SkeletonTableRows,
  SkeletonText,
  Spinner,
  Stat,
  StatusBadge,
  Tag,
  TextList,
  AREA_STATUSES,
  BATCH_STATUSES,
  RECORD_STATUSES,
  PLANTING_STATUSES,
  type BadgeVariant,
  type ColumnDef,
  type DataTableSort,
  type PlantingStatus,
  type Tone,
} from "@/components/data-display";
import { IMAGES } from "../fixtures";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

interface PlantingRow {
  id: string;
  code: string;
  species: string;
  area: string;
  plants: number | null;
  plantedAt: string;
  status: PlantingStatus;
}

const ROWS: PlantingRow[] = [
  { id: "pl-0042", code: "PL-0042", species: "Manga Tommy Atkins", area: "A-03 · Talhão Norte", plants: 480, plantedAt: "2026-03-12", status: "em_desenvolvimento" },
  { id: "pl-0041", code: "PL-0041", species: "Acerola BRS 366 Jaburu", area: "A-01 · Talhão Sul", plants: 620, plantedAt: "2026-02-28", status: "em_desenvolvimento" },
  { id: "pl-0043", code: "PL-0043", species: "Banana Prata Anã", area: "A-06 · Baixio", plants: null, plantedAt: "2026-12-02", status: "implantado" },
  { id: "pl-0040", code: "PL-0040", species: "Caju CCP 76", area: "A-05 · Encosta", plants: 350, plantedAt: "2026-02-15", status: "em_desenvolvimento" },
  { id: "pl-0031", code: "PL-0031", species: "Melancia Crimson Sweet", area: "A-02 · Várzea", plants: 1400, plantedAt: "2025-08-10", status: "encerrado" },
];

const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));

const COLUMNS: ColumnDef<PlantingRow>[] = [
  { key: "code", header: "Código", sortable: true, mobile: "title", cell: (r) => <Code>{r.code}</Code> },
  { key: "species", header: "Espécie", sortable: true, mobile: "subtitle" },
  { key: "area", header: "Área", mobile: "field" },
  {
    key: "plants",
    header: "Plantas",
    numeric: true,
    sortable: true,
    sortValue: (r) => r.plants,
    cell: (r) => (r.plants == null ? "—" : r.plants.toLocaleString("pt-BR")),
    mobile: "field",
  },
  { key: "plantedAt", header: "Plantio", sortable: true, cell: (r) => fmtDate(r.plantedAt), mobile: "field" },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} size="sm" />, mobile: "badge" },
];

const TONES: Tone[] = ["green", "harvest", "gray", "red", "sky"];
const TONE_LABEL: Record<Tone, string> = { green: "Ativo", harvest: "Colheita", gray: "Neutro", red: "Erro", sky: "Info" };
const VARIANTS: BadgeVariant[] = ["solid", "subtle", "outline"];

const ACTIVITY = [
  { id: "1", at: "Hoje, 09:14", title: "32 plantas individuais registradas", description: "PL-0042", actor: "Ana Ribeiro", icon: <Wheat /> },
  { id: "2", at: "Ontem, 16:40", title: "Lote LM-2026-014 atualizado", description: "20 mudas disponíveis", icon: <Sprout /> },
  { id: "3", at: "18/11/2026", title: "Plantio PL-0044 criado", description: "Mamão · A-07", icon: <CircleCheck /> },
  { id: "4", at: "17/11/2026", title: "3 imagens adicionadas", description: "PL-0039", icon: <Images /> },
  { id: "5", at: "15/11/2026", title: "Dimensões atualizadas", description: "A-05 · Encosta", icon: <LandPlot /> },
];

export function ExibicaoSection() {
  const [sort, setSort] = useState<DataTableSort | null>({ key: "plantedAt", dir: "desc" });
  const [selection, setSelection] = useState<string[]>(["pl-0042", "pl-0041"]);
  const [page, setPage] = useState(1);
  const [pressed, setPressed] = useState({ manga: true, caju: false });
  const [tags, setTags] = useState(["Tommy Atkins", "Palmer", "Kent", "Keitt"]);

  return (
    <ShowcaseSection
      id="exibicao"
      title="Exibição de dados"
      description="Tabelas, detalhes, métricas, selos e estados de carregamento. O estado nunca depende só da cor."
    >
      <Demo name="DataTable" importPath="@/components/data-display" description="Ordenação com aria-sort, seleção com barra de ações e paginação. Abaixo de 768 px vira lista de cards.">
        <Stack gap="4">
          <Variant label="Ordenação + seleção + ações + paginação" p="0" overflow="hidden">
            <DataTable
              caption="Plantios, ordenados por data de plantio"
              columns={COLUMNS}
              data={ROWS}
              getRowId={(r) => r.id}
              getRowLabel={(r) => r.code}
              sort={sort}
              onSortChange={setSort}
              selection={selection}
              onSelectionChange={setSelection}
              bulkActions={[
                { label: "Alterar status", onClick: () => {} },
                { label: "Encerrar", onClick: () => {}, danger: true },
              ]}
              rowActions={() => [
                { label: "Editar", icon: <Edit />, onSelect: () => {} },
                { label: "Excluir", icon: <Trash2 />, onSelect: () => {}, danger: true },
              ]}
              pagination={{ page, pageSize: 5, total: 14 }}
              onPageChange={setPage}
            />
          </Variant>
          <VariantGrid min="340px">
            <Variant label="Carregando" p="0" overflow="hidden">
              <DataTable caption="Plantios" columns={COLUMNS} data={[]} loading loadingRows={3} />
            </Variant>
            <Variant label="Vazio" p="0" overflow="hidden">
              <DataTable
                caption="Plantios"
                columns={COLUMNS}
                data={[]}
                emptyTitle="Nenhum plantio ainda"
                emptyDescription="Registre o primeiro plantio para acompanhar plantas, origem e histórico."
              />
            </Variant>
            <Variant label="Erro" p="0" overflow="hidden">
              <DataTable caption="Plantios" columns={COLUMNS} data={[]} error onRetry={() => {}} />
            </Variant>
          </VariantGrid>
        </Stack>
      </Demo>

      <Demo name="RecordDetails" importPath="@/components/data-display">
        <VariantGrid min="340px">
          <Variant label="Itens · 2 colunas · card" bg="bg">
            <RecordDetails headingAs="h4"
              columns={2}
              items={[
                { label: "Espécie", value: <>Manga <Text as="span" fontStyle="italic" color="fg.muted">Mangifera indica</Text></> },
                { label: "Cultivar", value: "Tommy Atkins" },
                { label: "Área", value: "A-03 · Talhão Norte" },
                { label: "Data de plantio", value: "12/03/2026" },
                { label: "Lote de origem", value: <Code>LM-2026-014</Code> },
                { label: "Observações", value: null },
              ]}
            />
          </Variant>
          <Variant label="Seções · 3 colunas · sem moldura">
            <RecordDetails headingAs="h4"
              surface="none"
              columns={3}
              sections={[
                {
                  title: "Dimensões",
                  description: "Área retangular",
                  items: [
                    { label: "Comprimento", value: "300 m" },
                    { label: "Largura", value: "80 m" },
                    { label: "Área", value: "2,4 ha" },
                  ],
                },
                { title: "Notas", items: [{ label: "Características", value: "Solo arenoso, irrigação por gotejamento.", span: "full" }] },
              ]}
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="MetricCard · Stat" importPath="@/components/data-display">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
          <MetricCard label="Área cultivada" value={18.4} unit="ha" formatOptions={{ maximumFractionDigits: 1 }} icon={<LandPlot />} trend={{ value: "+4,2 ha", direction: "up", label: "em 12 meses" }} />
          <MetricCard label="Plantios em campo" value={9} icon={<Sprout />} description="2 implantados" href="/plantios" />
          <MetricCard label="Mudas livres" value={1150} trend={{ value: "−20", direction: "down", label: "no lote LM-2026-014" }} surface="subtle" />
          <MetricCard label="Plantas" value={0} loading />
        </SimpleGrid>
        <VariantGrid min="300px">
          <Variant label="size lg · sparkline">
            <MetricCard
              size="lg"
              surface="none"
              label="Área cultivada"
              value={18.4}
              unit="ha"
              formatOptions={{ maximumFractionDigits: 1 }}
              icon={<Leaf />}
              trend={{ value: "+4,2 ha", direction: "up", label: "em 12 meses" }}
              sparkline={[14.2, 14.2, 15, 15.6, 16, 16, 17.1, 17.4, 18, 18.4]}
              sparklineLabel="subiu de 14,2 para 18,4 ha em 12 meses"
            />
          </Variant>
          <Variant label="Stat compacto">
            <Row gap="8">
              <Stat label="Plantas" value="6.480" trend={{ value: "+12%", direction: "up" }} />
              <Stat label="Densidade" value="200" unit="pl/ha" helpText="média das áreas ativas" />
              <Stat label="Perdas" value="14" trend={{ value: "+3", direction: "up", sentiment: "negative" }} />
              <Stat label="Estoque" value="1.150" trend={{ value: "0", direction: "flat" }} />
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="StatusBadge" importPath="@/components/data-display" description="Ícone + texto + cor. Mapa central de status do domínio.">
        <VariantGrid min="300px">
          <Variant label="Plantio · md">
            <Row>
              {PLANTING_STATUSES.map((s) => <StatusBadge key={s} status={s} />)}
            </Row>
          </Variant>
          <Variant label="Lote · Área · sm">
            <Row>
              {BATCH_STATUSES.map((s) => <StatusBadge key={s} status={s} size="sm" />)}
              {AREA_STATUSES.map((s) => <StatusBadge key={s} status={s} size="sm" />)}
            </Row>
          </Variant>
          <Variant label="Registro (processamento, destinação) · sm">
            <Row>
              {RECORD_STATUSES.map((s) => <StatusBadge key={s} status={s} size="sm" />)}
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Badge · CountBadge" importPath="@/components/data-display">
        <Variant label="Variantes × tons">
          <Stack gap="3">
            {VARIANTS.map((v) => (
              <Row key={v}>
                <Text textStyle="caption" color="fg.muted" w="60px">{v}</Text>
                {TONES.map((t) => <Badge key={t} variant={v} tone={t}>{TONE_LABEL[t]}</Badge>)}
              </Row>
            ))}
            <Row>
              <Text textStyle="caption" color="fg.muted" w="60px">count</Text>
              <CountBadge count={3} aria-label="3 notificações" />
              <CountBadge count={42} />
              <CountBadge count={150} max={99} />
            </Row>
          </Stack>
        </Variant>
      </Demo>

      <Demo name="Tag · SelectableTag" importPath="@/components/data-display">
        <VariantGrid>
          <Variant label="Removível">
            <Row gap="2">
              {tags.map((t) => <Tag key={t} onRemove={() => setTags((x) => x.filter((y) => y !== t))}>{t}</Tag>)}
              <Tag>Sem remover</Tag>
            </Row>
          </Variant>
          <Variant label="Selecionável (aria-pressed)">
            <Row gap="2">
              <SelectableTag pressed={pressed.manga} onPressedChange={(v) => setPressed((p) => ({ ...p, manga: v }))} icon={<Leaf />}>Manga</SelectableTag>
              <SelectableTag pressed={pressed.caju} onPressedChange={(v) => setPressed((p) => ({ ...p, caju: v }))}>Caju</SelectableTag>
              <SelectableTag pressed={false} disabled>Maracujá</SelectableTag>
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Avatar · AvatarGroup" importPath="@/components/data-display">
        <VariantGrid>
          <Variant label="Tamanhos xs · sm · md · lg + sem nome">
            <Row>
              <Avatar name="Ana Ribeiro" size="xs" />
              <Avatar name="Ana Ribeiro" size="sm" />
              <Avatar name="Carlos Mendes" size="md" />
              <Avatar name="Carlos Mendes" size="lg" />
              <Avatar size="md" />
            </Row>
          </Variant>
          <Variant label="Grupo">
            <Stack gap="3">
              <AvatarGroup people={[{ name: "Ana Ribeiro" }, { name: "Carlos Mendes" }, { name: "Joana Lima" }, { name: "Pedro Alves" }, { name: "Rita Souza" }]} />
              <AvatarGroup people={[{ name: "Ana Ribeiro" }, { name: "Carlos Mendes" }, { name: "Joana Lima" }, { name: "Pedro Alves" }]} max={2} showCount />
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Card" importPath="@/components/data-display">
        <VariantGrid min="260px">
          <Card headingAs="h4" title="Outline (padrão)" description="Listas e grids." headerEnd={<StatusBadge status="em_desenvolvimento" size="sm" />} />
          <Card headingAs="h4" variant="elevated" title="Elevated" description="Menus e cards soltos." />
          <Card headingAs="h4" variant="subtle" title="Subtle" description="Resumos sem ação principal." />
          <Card headingAs="h4"
            title="Com rodapé"
            description="Ações separadas por divisor."
            footer={
              <>
                <Button size="sm" variant="ghost">Cancelar</Button>
                <Button size="sm">Salvar</Button>
              </>
            }
          />
          <Card headingAs="h4" href="/plantios/pl-0042" title="PL-0042 · card link" description="O card inteiro é um único alvo de clique." />
        </VariantGrid>
      </Demo>

      <Demo name="Separator · Kbd · Code · Mark · TextList" importPath="@/components/data-display">
        <VariantGrid>
          <Variant label="Separator">
            <Stack gap="4">
              <Separator />
              <Separator label="ou" />
            </Stack>
          </Variant>
          <Variant label="Kbd · KbdShortcut · Code">
            <Stack gap="3">
              <Row gap="2"><Kbd>Esc</Kbd><Kbd>Enter</Kbd><KbdShortcut keys={["Ctrl", "K"]} /></Row>
              <Text textStyle="body.sm">Plantio <Code>PL-0042</Code> do lote <Code>LM-2026-014</Code>.</Text>
            </Stack>
          </Variant>
          <Variant label="Mark · HighlightText">
            <Stack gap="2">
              <Text textStyle="body.sm">Lote com <Mark>estoque baixo</Mark>.</Text>
              <Text textStyle="body.sm"><HighlightText query="acer">Acerola BRS 366 Jaburu</HighlightText></Text>
            </Stack>
          </Variant>
          <Variant label="TextList">
            <TextList items={["Escolha a espécie", "Selecione a área", "Informe a origem"]} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Progress · ProgressCircle" importPath="@/components/data-display">
        <VariantGrid>
          <Variant label="Progress sm · md · lg · harvest · indeterminado">
            <Stack gap="4">
              <Progress label="Envio" value={64} size="sm" showValueText />
              <Progress label="Ocupação das áreas" value={75} showValueText helperText="18 de 24 ha" />
              <Progress label="Mudas utilizadas" value={480} max={500} size="lg" tone="harvest" showValueText formatValue={(v, m) => `${v} de ${m}`} />
              <Progress label="Processando" value={null} />
            </Stack>
          </Variant>
          <Variant label="ProgressCircle md · lg · harvest">
            <Row gap="6">
              <ProgressCircle value={75} label="Ocupação" showValueText />
              <ProgressCircle value={96} size="lg" tone="harvest" label="Mudas usadas" showValueText />
              <ProgressCircle value={null} label="Carregando" />
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Spinner · Skeleton · LoadingState" importPath="@/components/data-display" description="Skeleton com o formato do conteúdo final; Spinner só para operações curtas.">
        <VariantGrid>
          <Variant label="Spinner xs · sm · md · lg + rótulo">
            <Row gap="5">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="sm" label="Salvando…" />
            </Row>
          </Variant>
          <Variant label="Skeleton · SkeletonCircle · SkeletonText">
            <Stack gap="3">
              <Row><SkeletonCircle size="10" /><Skeleton h="4" w="160px" /></Row>
              <SkeletonText noOfLines={3} />
            </Stack>
          </Variant>
          <Variant label="Blocos prontos">
            <Stack gap="4">
              <SkeletonMetricCard />
              <SkeletonInline />
            </Stack>
          </Variant>
          <Variant label="SkeletonList · SkeletonTableRows · SkeletonDetails">
            <Stack gap="4">
              <SkeletonList rows={2} />
              <SkeletonTableRows rows={2} />
              <SkeletonDetails rows={4} columns={2} />
            </Stack>
          </Variant>
        </VariantGrid>
        <VariantGrid min="300px">
          <Variant label="LoadingState · table"><LoadingState variant="table" rows={3} /></Variant>
          <Variant label="LoadingState · cards"><LoadingState variant="cards" rows={2} /></Variant>
          <Variant label="LoadingState · details"><LoadingState variant="details" rows={4} columns={2} /></Variant>
          <Variant label="LoadingState · inline"><LoadingState variant="inline" label="Buscando plantios…" /></Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Image" importPath="@/components/data-display" description="Proporção reservada e carregamento preguiçoso evitam saltos de layout.">
        <VariantGrid min="220px">
          <Variant label="Com legenda · 4:3">
            <Image src={IMAGES[3].src} alt={IMAGES[3].alt} ratio={4 / 3} caption="Matriz M-07 · 02/09" />
          </Variant>
          <Variant label="Quadrada · fit contain">
            <Image src={IMAGES[0].src} alt={IMAGES[0].alt} ratio={1} fit="contain" bg="bg.subtle" />
          </Variant>
          <Variant label="Sem src (espaço reservado)">
            <Image src={null} alt="Foto da espécie" ratio={4 / 3} />
          </Variant>
          <Variant label="Falha ao carregar">
            <Image src="/imagem-inexistente.jpg" alt="Vistoria da linha 3" ratio={4 / 3} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="DataList" importPath="@/components/data-display">
        <Variant label="Pares rótulo/valor">
          <DataList
            items={[
              { label: "Categoria", value: "Laudo" },
              { label: "Tamanho", value: "1,2 MB" },
              { label: "Vinculado a", value: "Área A-03" },
              { label: "Enviado por", value: "Ana Ribeiro, 20/02/2026" },
              { label: "Páginas", value: null },
            ]}
          />
        </Variant>
      </Demo>

      <Demo name="ActivityTimeline" importPath="@/components/data-display">
        <VariantGrid min="320px">
          <Variant label="Com limite e “ver tudo”">
            <ActivityTimeline items={ACTIVITY} maxItems={4} onSeeAll={() => {}} />
          </Variant>
          <Variant label="Vazio">
            <Box>
              <ActivityTimeline items={[]} emptyText="Nenhuma atividade registrada ainda." />
            </Box>
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
