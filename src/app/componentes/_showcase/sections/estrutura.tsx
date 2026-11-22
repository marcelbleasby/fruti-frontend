"use client";

import { Box, Button, Flex, NativeSelect, Stack, Text } from "@chakra-ui/react";
import {
  BarChart3,
  Bell,
  Download,
  FileText,
  History,
  LandPlot,
  LayoutDashboard,
  Leaf,
  ListFilter,
  MoreHorizontal,
  Plus,
  Sprout,
  Trees,
  Wheat,
} from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/data-display/status-badge";
import { SearchField } from "@/components/forms/search-field";
import {
  AppHeader,
  AppSidebar,
  BentoGrid,
  BentoTile,
  Breadcrumb,
  FrutiLogo,
  FrutiLogoMark,
  MobileAppHeader,
  MobileNavBar,
  NavIconGlyph,
  PageHeader,
  PageSection,
  PageToolbar,
  UserAvatar,
  type AppliedFilterChip,
  type AppUser,
  type NavEntry,
  type NavItem,
} from "@/components/layout";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const USER: AppUser = { name: "Ana Ribeiro", role: "Técnica agrícola" };

const NAV: NavEntry[] = [
  {
    label: "Visão geral",
    items: [
      { label: "Painel", href: "/painel", icon: LayoutDashboard },
      { label: "Indicadores", href: "/indicadores", icon: BarChart3 },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Espécies", href: "/especies", icon: Leaf },
      { label: "Cultivares", href: "/cultivares", icon: Trees },
    ],
  },
  {
    label: "Produção",
    items: [
      { label: "Áreas", href: "/areas", icon: LandPlot },
      { label: "Plantios", href: "/plantios", icon: Sprout, badge: 3 },
      { label: "Plantas", href: "/plantas", icon: Wheat },
    ],
  },
  {
    label: "Registros",
    items: [
      { label: "Documentos", href: "/documentos", icon: FileText },
      { label: "Histórico", href: "/historico", icon: History },
    ],
  },
];

const MOBILE_NAV: NavItem[] = [
  { label: "Painel", href: "/painel", icon: LayoutDashboard },
  { label: "Plantios", href: "/plantios", icon: Sprout },
  { label: "Áreas", href: "/areas", icon: LandPlot },
];

const PLANTINGS = [
  { code: "PL-0042", status: "em_desenvolvimento" as const, desc: "Manga · Tommy Atkins" },
  { code: "PL-0043", status: "implantado" as const, desc: "Banana · Prata Anã" },
  { code: "PL-0041", status: "em_desenvolvimento" as const, desc: "Acerola · BRS 366 Jaburu" },
  { code: "PL-0040", status: "em_desenvolvimento" as const, desc: "Caju · CCP 76" },
];

/** Moldura de celular (390 px) para os componentes de navegação mobile. */
function PhoneFrame({ children, dark, label }: { children: React.ReactNode; dark?: boolean; label: string }) {
  return (
    <Box
      role="group"
      aria-label={label}
      position="relative"
      w="full"
      maxW="390px"
      h="560px"
      mx="auto"
      overflow="hidden"
      borderRadius="32px"
      borderWidth="1px"
      borderColor="border"
      bg={dark ? "green.900" : "bg"}
    >
      {children}
    </Box>
  );
}

function PlantingRows({ dark }: { dark?: boolean }) {
  return (
    <Stack gap="2" px="4" pb="32">
      {[...PLANTINGS, ...PLANTINGS].map((p, i) => (
        <Flex
          key={`${p.code}-${i}`}
          align="center"
          justify="space-between"
          gap="2"
          p="3"
          bg={dark ? "green.800" : "bg.panel"}
          color={dark ? "white" : "fg"}
          borderWidth="1px"
          borderColor={dark ? "green.700" : "border"}
          borderRadius="l3"
        >
          <Stack gap="0">
            <Text textStyle="code" fontWeight="600">
              {p.code}
            </Text>
            <Text textStyle="body.sm" color={dark ? "green.100" : "fg.muted"}>
              {p.desc}
            </Text>
          </Stack>
          <StatusBadge status={p.status} size="sm" />
        </Flex>
      ))}
    </Stack>
  );
}

export function EstruturaSection() {
  const [collapsed, setCollapsed] = useState(false);
  const [chips, setChips] = useState<AppliedFilterChip[]>([
    { id: "especie", label: "Espécie: Manga" },
    { id: "origem", label: "Origem: Mudas" },
  ]);

  return (
    <ShowcaseSection
      id="estrutura"
      title="Estrutura e layout"
      description="Navegação global, cabeçalhos de página, barra de ferramentas e o grid Bento. No mobile, navegação em Liquid Glass."
    >
      <Demo
        name="AppSidebar"
        importPath="@/components/layout"
        description="Expandida (248 px) ou recolhida em rail de ícones com nome em Tooltip. Abaixo de 768 px vira Drawer (via AppShell)."
      >
        <VariantGrid min="320px">
          <Variant label="Expandida (controlada)" p="0" overflow="hidden">
            <Box minH="620px" display="flex">
              <AppSidebar
                items={NAV}
                activeHref="/plantios"
                responsive={false}
                collapsible
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
                footer={<Text textStyle="caption" color="fg.muted">Fruti · v0.1</Text>}
              />
            </Box>
          </Variant>
          <Variant label="Recolhida (rail)" p="0" overflow="hidden">
            <Box minH="620px" display="flex">
              <AppSidebar items={NAV} activeHref="/areas" responsive={false} collapsed />
            </Box>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AppHeader" importPath="@/components/layout" description="Contexto da área, menu da conta e ações. O botão de menu aparece quando há onOpenNav.">
        <Stack gap="4">
          <Variant label="Com menu da conta e notificações" p="0" overflow="hidden">
            <AppHeader
              title="Produção"
              user={USER}
              userMenuItems={[
                { value: "perfil", label: "Meu perfil" },
                { value: "sair", label: "Sair", tone: "danger" },
              ]}
              actions={
                <Button variant="ghost" size="md" aria-label="Notificações">
                  <Bell />
                </Button>
              }
            />
          </Variant>
          <Variant label="Com breadcrumb e botão de menu" p="0" overflow="hidden">
            <AppHeader
              title="Plantios"
              breadcrumb={<Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Plantios", href: "/plantios" }, { label: "PL-0042", mono: true }]} />}
              user={USER}
              onOpenNav={() => {}}
            />
          </Variant>
        </Stack>
      </Demo>

      <Demo
        name="MobileAppHeader · MobileNavBar"
        importPath="@/components/layout"
        description="Vidro só na navegação; o conteúdo continua opaco e a lista ganha recuo inferior. Com transparência reduzida o material vira branco opaco."
      >
        <VariantGrid min="300px">
          <Variant label="Nível superior (root)" bg="bg.subtle">
            <PhoneFrame label="Exemplo mobile: Plantios">
              <MobileAppHeader headingAs="h2"
                variant="root"
                title="Plantios"
                actions={[
                  { label: "Filtros", icon: ListFilter },
                  { label: "Conta de Ana Ribeiro", content: <UserAvatar user={USER} size={32} />, "aria-haspopup": "menu" },
                ]}
              />
              <PlantingRows />
              <Box position="absolute" insetX="0" bottom="0">
                <MobileNavBar
                  fixed={false}
                  items={MOBILE_NAV}
                  activeHref="/plantios"
                  onOpenMore={() => {}}
                  primaryAction={{ label: "Novo plantio", icon: Plus, onClick: () => {} }}
                />
              </Box>
            </PhoneFrame>
          </Variant>
          <Variant label="Detalhe com voltar · sobre fundo escuro" bg="bg.subtle">
            <PhoneFrame label="Exemplo mobile: detalhe PL-0042" dark>
              <MobileAppHeader headingAs="h2"
                variant="detail"
                title="PL-0042"
                backHref="/plantios"
                backLabel="Plantios"
                actions={[{ label: "Mais ações", icon: MoreHorizontal, "aria-haspopup": "menu" }]}
              />
              <PlantingRows dark />
              <Box position="absolute" insetX="0" bottom="0">
                <MobileNavBar fixed={false} items={MOBILE_NAV} activeHref="/areas" onOpenMore={() => {}} moreActive />
              </Box>
            </PhoneFrame>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Breadcrumb" importPath="@/components/layout" description="Só a partir de 768 px (hideOnMobile). Identificadores em Fira Code.">
        <Variant label="Três níveis">
          <Breadcrumb hideOnMobile={false} items={[{ label: "Início", href: "/" }, { label: "Plantios", href: "/plantios" }, { label: "PL-0042", mono: true }]} />
        </Variant>
      </Demo>

      <Demo name="PageHeader" importPath="@/components/layout" description="Uma ação primária por página; as demais em outline ou no menu de mais ações.">
        <Stack gap="4">
          <Variant label="Com status, breadcrumb e ações">
            <PageHeader
              headingAs="h2"
              title="Plantios"
              status={<StatusBadge status="em_desenvolvimento" />}
              description="Acompanhe os plantios por área, espécie e origem."
              breadcrumb={[{ label: "Início", href: "/" }, { label: "Plantios" }]}
              actions={
                <>
                  <Button variant="outline">
                    <Download /> Exportar
                  </Button>
                  <Button>
                    <Plus /> Novo plantio
                  </Button>
                </>
              }
            />
          </Variant>
          <Variant label="Só título">
            <PageHeader headingAs="h2" title="Espécies" />
          </Variant>
        </Stack>
      </Demo>

      <Demo name="PageSection" importPath="@/components/layout">
        <VariantGrid min="320px">
          <Variant label="Com descrição e ação" bg="bg">
            <PageSection
              headingAs="h4"
              title="Dados do plantio"
              description="Informações cadastrais e origem."
              actions={<Button variant="outline" size="sm">Editar</Button>}
            >
              <Text textStyle="body.sm">Manga · Tommy Atkins · A-03 · Talhão Norte</Text>
            </PageSection>
          </Variant>
          <Variant label="Sem cabeçalho" bg="bg">
            <PageSection headingAs="h4">
              <Text textStyle="body.sm">Conteúdo livre da seção.</Text>
            </PageSection>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="PageToolbar" importPath="@/components/layout" description="Filtros aplicados viram chips removíveis.">
        <Stack gap="4">
          <Variant label="Busca, filtros, ações e chips">
            <PageToolbar
              search={<SearchField placeholder="Buscar plantios" />}
              filters={
                <>
                  <NativeSelect.Root size="md" width="auto" minW="160px">
                    <NativeSelect.Field aria-label="Área" defaultValue="">
                      <option value="">Área: todas</option>
                      <option value="a-03">A-03 · Talhão Norte</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Button variant="outline">
                    <ListFilter /> Filtros
                  </Button>
                </>
              }
              actions={<Button variant="ghost">Exportar</Button>}
              appliedFilters={chips}
              onRemoveFilter={(id) => setChips((c) => c.filter((x) => x.id !== id))}
              onClearFilters={() => setChips([])}
            />
          </Variant>
          <Variant label="Só busca">
            <PageToolbar search={<SearchField placeholder="Buscar espécies" />} />
          </Variant>
        </Stack>
      </Demo>

      <Demo
        name="BentoGrid · BentoTile"
        importPath="@/components/layout"
        description="2 colunas até 1279 px e 4 a partir de 1280 px. Tiles de 1, 2 ou 4 colunas e 1 ou 2 linhas; tons default, subtle e inverse."
      >
        <BentoGrid>
          <BentoTile colSpan={4} tone="default">
            <Text textStyle="heading.sm">colSpan 4 · default</Text>
            <Text textStyle="body.sm" color="fg.muted">Tabela de plantios, gráfico combinado.</Text>
          </BentoTile>
          <BentoTile colSpan={2} rowSpan={2} tone="subtle" padding="lg">
            <Text textStyle="heading.sm">colSpan 2 · rowSpan 2 · subtle · padding lg</Text>
          </BentoTile>
          <BentoTile colSpan={1}>
            <Text textStyle="heading.sm">colSpan 1</Text>
          </BentoTile>
          <BentoTile colSpan={1} tone="inverse">
            <Text textStyle="heading.sm" color="white">colSpan 1 · inverse</Text>
          </BentoTile>
          <BentoTile colSpan={2} as="article">
            <Text textStyle="heading.sm">colSpan 2 · article</Text>
          </BentoTile>
        </BentoGrid>
      </Demo>

      <Demo name="FrutiLogo · FrutiLogoMark · UserAvatar · NavIconGlyph" importPath="@/components/layout">
        <VariantGrid>
          <Variant label="Logo">
            <Row gap="6">
              <FrutiLogo />
              <FrutiLogo size={36} />
              <FrutiLogo markOnly />
              <FrutiLogoMark size={20} aria-hidden="true" />
            </Row>
          </Variant>
          <Variant label="UserAvatar 32 · 36">
            <Row>
              <UserAvatar user={{ name: "Carlos Mendes" }} size={32} />
              <UserAvatar user={USER} size={36} />
            </Row>
          </Variant>
          <Variant label="NavIconGlyph 16 · 20 · 24">
            <Row color="fg.heading">
              <NavIconGlyph icon={Sprout} size={16} />
              <NavIconGlyph icon={Sprout} size={20} />
              <NavIconGlyph icon={Sprout} size={24} />
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="AppShell"
        importPath="@/components/layout"
        description="Composição de página inteira (sidebar sticky de 100dvh, AppHeader, MobileNavBar fixa e Drawer “Mais”). Ocupa a viewport, por isso não é renderizada aqui: as peças acima são exatamente as que ela monta."
      >
        <Text textStyle="code" color="fg.muted">
          {"<AppShell navItems={nav} title=\"Produção\" user={user} primaryAction={…}>{children}</AppShell>"}
        </Text>
      </Demo>
    </ShowcaseSection>
  );
}
