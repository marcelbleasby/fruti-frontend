"use client";

import { Box, Button, Flex, IconButton, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Download, Leaf, MoreHorizontal, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Code } from "@/components/data-display/code";
import { glassFallbackCss, glassIconButtonCss } from "@/components/layout/glass";
import { SkipNavContent, SkipNavLink } from "@/components/navigation/skip-nav-link";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

/** Contraste WCAG 2.x entre duas cores hex (#RRGGBB). */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const ratio = (n: number) => `${n.toFixed(1).replace(".", ",")}:1`;

const WHITE = "#FFFFFF";
/** Quase preto: o ink (#1E293B) não chega a 4,5:1 sobre border.control (#6B8F7A). */
const DARK = "#0F172A";
/** Cor do rótulo sobre a amostra: a de maior contraste entre escuro e branco (≥ 4,5:1 em todas). */
const labelOn = (hex: string) => (contrast(DARK, hex) >= contrast(WHITE, hex) ? DARK : WHITE);

interface Swatch {
  token: string;
  hex: string;
  use: string;
  /** Par de referência para o contraste (padrão: branco). */
  against?: { hex: string; name: string };
  /** Texto fixo quando a cor não é usada como texto nem como borda de controle. */
  note?: string;
}

const BG = { hex: "#F0FDF4", name: "bg" };
const MUTED = { hex: "#E8F0F1", name: "bg.muted" };

const COLORS: Swatch[] = [
  { token: "primary", hex: "#15803D", use: "Ações principais, links, foco" },
  { token: "primary.hover", hex: "#166534", use: "Hover e pressionado do primário" },
  { token: "primary.subtle", hex: "#DCFCE7", use: "Seleção, badge Ativo, item atual", note: "fundo · texto green.900 8,3:1" },
  { token: "secondary", hex: "#22C55E", use: "Marca e gráficos — nunca texto", note: "decorativo" },
  { token: "accent", hex: "#A16207", use: "Colheita, Em preparo" },
  { token: "fg.heading", hex: "#14532D", use: "Títulos e destaque", against: BG },
  { token: "ink · fg", hex: "#1E293B", use: "Texto de corpo e valores" },
  { token: "fg.muted", hex: "#475569", use: "Texto auxiliar", against: BG },
  { token: "fg.subtle", hex: "#566375", use: "Metadados terciários (novo valor AA)", against: MUTED },
  { token: "bg", hex: "#F0FDF4", use: "Fundo da aplicação", note: "superfície" },
  { token: "bg.muted", hex: "#E8F0F1", use: "Superfícies neutras", note: "superfície" },
  { token: "border", hex: "#BBF7D0", use: "Bordas de cards e divisores", note: "decorativo" },
  { token: "border.control", hex: "#6B8F7A", use: "Bordas de campos e outline (não texto ≥ 3:1)" },
  { token: "danger", hex: "#B91C1C", use: "Erros, ações destrutivas" },
  { token: "fg.info", hex: "#075985", use: "Planejado, informativo", against: { hex: "#E0F2FE", name: "info" } },
];

/** Pares texto/fundo usados de fato nos componentes. need: 4.5 texto · 3 não texto (WCAG 1.4.3 / 1.4.11). */
const PAIRS: { fg: string; bg: string; label: string; need: 4.5 | 3 }[] = [
  { fg: "#1E293B", bg: "#FFFFFF", label: "fg sobre bg.panel", need: 4.5 },
  { fg: "#14532D", bg: "#F0FDF4", label: "fg.heading sobre bg", need: 4.5 },
  { fg: "#475569", bg: "#E8F0F1", label: "fg.muted sobre bg.muted", need: 4.5 },
  { fg: "#566375", bg: "#E8F0F1", label: "fg.subtle sobre bg.muted", need: 4.5 },
  { fg: "#FFFFFF", bg: "#15803D", label: "branco sobre primary (botão)", need: 4.5 },
  { fg: "#15803D", bg: "#DCFCE7", label: "primary sobre primary.subtle", need: 4.5 },
  { fg: "#14532D", bg: "#DCFCE7", label: "StatusBadge Ativo", need: 4.5 },
  { fg: "#78350F", bg: "#FEF3C7", label: "StatusBadge Em preparo", need: 4.5 },
  { fg: "#075985", bg: "#E0F2FE", label: "StatusBadge Planejado", need: 4.5 },
  { fg: "#991B1B", bg: "#FEE2E2", label: "StatusBadge Cancelado", need: 4.5 },
  { fg: "#FFFFFF", bg: "#A16207", label: "branco sobre accent", need: 4.5 },
  { fg: "#6B8F7A", bg: "#FFFFFF", label: "border.control (campo) sobre branco", need: 3 },
  { fg: "#64748B", bg: "#FFFFFF", label: "Switch desligado (slate.500)", need: 3 },
  { fg: "#15803D", bg: "#FFFFFF", label: "Anel de foco", need: 3 },
];

/** Pares a evitar — medidos, ficam abaixo do mínimo. */
const AVOID = [
  { fg: "#22C55E", bg: "#FFFFFF", label: "secondary como texto" },
  { fg: "#A16207", bg: "#FEF3C7", label: "harvest.700 sobre harvest.100" },
  { fg: "#94A3B8", bg: "#FFFFFF", label: "slate.400 em ícone/controle" },
];

/** Escala de `fontSizes` — só múltiplos de 4 (rem; nada abaixo de 12 px). `sm` = md e `lg` = xl são aliases. */
const FONT_SIZES = [
  { token: "xs", px: 12 },
  { token: "md", px: 16, alias: "sm" },
  { token: "xl", px: 20, alias: "lg" },
  { token: "2xl", px: 24 },
  { token: "3xl", px: 28 },
  { token: "4xl", px: 32 },
  { token: "5xl", px: 40 },
];

/** Papéis de `textStyles` — tamanho/peso/altura de linha em px. */
const TYPE_ROLES = [
  { style: "display.lg", sample: "6.480", spec: "700 · 40/48", use: "Número de destaque (MetricCard lg)", heading: true },
  { style: "display", sample: "Componentes do Fruti", spec: "700 · 32/40", use: "Título de página principal", heading: true },
  { style: "heading.xl", sample: "Plantios", spec: "700 · 28/36", use: "Título de página / seção da vitrine", heading: true },
  { style: "heading.lg", sample: "Talhão Norte", spec: "700 · 24/32", use: "Título de tela de detalhe, valores de métrica", heading: true },
  { style: "heading.md", sample: "Dados do plantio", spec: "600 · 20/28", use: "Seção dentro da página", heading: true },
  { style: "heading.sm", sample: "Origem do material", spec: "600 · 16/24", use: "Título de card, painel, diálogo", heading: true },
  { style: "body", sample: "Texto corrido e campos de formulário.", spec: "400 · 16/24", use: "Corpo" },
  { style: "body.sm", sample: "Tabelas, descrições e ações.", spec: "400 · 16/24", use: "Corpo em tabelas e listas (mesmo tamanho do body)" },
  { style: "label", sample: "Data de plantio", spec: "500 · 16/24", use: "Rótulos de campo, itens de menu" },
  { style: "caption", sample: "Atualizado há 5 min", spec: "500 · 12/16", use: "Metadados, badges, contadores (nunca corpo)" },
  { style: "overline", sample: "Domínio agrícola", spec: "600 · 12/16 · caixa alta", use: "Rótulo de grupo" },
  { style: "code", sample: "PL-0042 · LM-2026-014", spec: "Fira Code 500 · 16/24", use: "Códigos e identificadores" },
  { style: "code.sm", sample: "A-03", spec: "Fira Code 500 · 12/16", use: "Códigos em chips e metadados" },
] as const;

const WEIGHTS = [
  { w: "700", use: "display, heading.xl/lg, números de destaque" },
  { w: "600", use: "heading.md/sm, botões, overline" },
  { w: "500", use: "label, caption, código" },
  { w: "400", use: "body, body.sm" },
];

const RADII = [
  { token: "l1", use: "chips, checkbox", px: "4px" },
  { token: "l2", use: "campos, botões", px: "8px" },
  { token: "l3", use: "cards, diálogos", px: "12px" },
  { token: "2xl", use: "painéis grandes", px: "16px" },
  { token: "l4", use: "tiles do Bento", px: "24px" },
  { token: "full", use: "badges, avatares", px: "pílula" },
];

/** Escala de espaço (px) — `spacing` 1 · 2 · 3 · 4 · 5 · 6 · 8 · 10 · 12. */
const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48];

/** Alturas de controle — todas múltiplas de 4. */
const CONTROL_HEIGHTS = [
  { px: 24, use: "Badge, chip, tag" },
  { px: 32, use: "Botão sm, segmento compacto" },
  { px: 40, use: "Botão md, campo md (desktop)" },
  { px: 44, use: "Campo lg, alvo de toque mínimo no mobile" },
  { px: 48, use: "Botão lg, barra de navegação" },
];
const SHADOWS = ["xs", "sm", "md", "lg", "glass"];

const GLASS_TOKENS = [
  ["material", "rgba(255,255,255,0.62)"],
  ["blur", "24px · saturate 180%"],
  ["borda", "1px rgba(255,255,255,0.75)"],
  ["sombra", "0 10px 30px rgba(20,83,45,0.18)"],
  ["tinta (ação)", "rgba(21,128,61,0.88)"],
  ["fallback", "#FFFFFF opaco"],
];

function GlassCapsule() {
  return (
    <Flex layerStyle="glass" css={glassFallbackCss} borderRadius="full" h="64px" px="3" gap="2" align="center" w="fit-content">
      <Box as="button" aria-label="Painel" css={glassIconButtonCss}>
        <Leaf size={20} strokeWidth={1.75} />
      </Box>
      <Box as="button" aria-label="Mais opções" css={glassIconButtonCss}>
        <MoreHorizontal size={20} strokeWidth={1.75} />
      </Box>
      <Flex layerStyle="glass.primary" borderRadius="full" boxSize="48px" align="center" justify="center" aria-hidden="true">
        <Plus size={24} strokeWidth={2} />
      </Flex>
    </Flex>
  );
}

export function FundamentosSection() {
  return (
    <ShowcaseSection
      id="fundamentos"
      title="Fundamentos"
      description="Tokens do tema claro único (Chakra v3 · createSystem): cores e contraste AA, escala tipográfica e papéis de texto, forma, espaço, sombra, ícones, botões, foco e o material Liquid Glass."
    >
      <Demo name="Cores" importPath="@/theme · semanticTokens.colors" description="Contraste calculado (WCAG 2.x): texto ≥ 4,5:1, texto grande (≥ 24 px, ou 20 px em negrito) e elementos de controle ≥ 3:1. Desabilitado é isento.">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3">
          {COLORS.map((c) => {
            const against = c.against ?? { hex: WHITE, name: "branco" };
            return (
              <Stack key={c.token} gap="0" borderWidth="1px" borderColor="border" borderRadius="l3" overflow="hidden" bg="bg.panel">
                <Flex h="64px" bg={c.hex} align="flex-end" p="2" color={labelOn(c.hex)}>
                  <Text textStyle="code.sm">{c.hex}</Text>
                </Flex>
                <Stack gap="0.5" p="3">
                  <Code w="fit-content">{c.token}</Code>
                  <Text textStyle="body.sm">{c.use}</Text>
                  <Text textStyle="caption" color="fg.muted">
                    {c.note ?? `${ratio(contrast(c.hex, against.hex))} com ${against.name}`}
                  </Text>
                </Stack>
              </Stack>
            );
          })}
        </SimpleGrid>
      </Demo>

      <Demo name="Contraste mínimo AA" importPath="WCAG 1.4.3 · 1.4.11" description="Pares usados nos componentes, medidos a partir dos tokens. Verde = atende; vermelho = combinação proibida.">
        <VariantGrid min="340px">
          <Variant label="Pares em uso">
            <Stack gap="2">
              {PAIRS.map((p) => {
                const r = contrast(p.fg, p.bg);
                const ok = r >= p.need;
                return (
                  <Flex key={p.label} align="center" gap="3">
                    <Flex boxSize="9" flexShrink={0} align="center" justify="center" bg={p.bg} color={p.fg} borderWidth="1px" borderColor="border" borderRadius="l2" textStyle="label" fontWeight="700" aria-hidden="true">
                      Aa
                    </Flex>
                    <Text textStyle="body.sm" flex="1" minW="0">{p.label}</Text>
                    <Text textStyle="code.sm" color={ok ? "fg.success" : "fg.error"} whiteSpace="nowrap">
                      {ratio(r)} · {ok ? "AA" : "falha"} {p.need === 3 ? "(3:1)" : ""}
                    </Text>
                  </Flex>
                );
              })}
            </Stack>
          </Variant>
          <Variant label="Evitar">
            <Stack gap="2">
              {AVOID.map((p) => (
                <Flex key={p.label} align="center" gap="3">
                  <Flex boxSize="9" flexShrink={0} align="center" justify="center" bg={p.bg} color={p.fg} borderWidth="1px" borderColor="border" borderRadius="l2" textStyle="label" fontWeight="700" aria-hidden="true">
                    Aa
                  </Flex>
                  <Text textStyle="body.sm" flex="1" minW="0">{p.label}</Text>
                  <Text textStyle="code.sm" color="fg.error" whiteSpace="nowrap">{ratio(contrast(p.fg, p.bg))}</Text>
                </Flex>
              ))}
              <Text textStyle="caption" color="fg.muted" pt="2">
                Cor nunca é o único indicador: status levam ícone e texto.
              </Text>
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Tipografia" importPath="@/theme · textStyles · fontSizes" description="Grade de 4 px: tamanhos 12 · 16 · 20 · 24 · 28 · 32 · 40 e alturas de linha fixas, também múltiplas de 4 (rem, acompanha o zoom do usuário). Hierarquia por tamanho e peso, não por cor; o nível do título (h1–h4) é semântico e independe do papel visual.">
        <Variant label="Escala de tamanhos (fontSizes)">
          <Flex gap="5" align="flex-end" wrap="wrap">
            {FONT_SIZES.map((f) => (
              <Stack key={f.token} gap="1" align="center">
                <Text fontSize={f.token} fontWeight="600" color="fg.heading" lineHeight="1">
                  Aa
                </Text>
                <Code>{f.token}</Code>
                <Text textStyle="caption" color="fg.muted">
                  {f.px} px{f.alias ? ` · = ${f.alias}` : ""}
                </Text>
              </Stack>
            ))}
          </Flex>
        </Variant>
        <Variant label="Papéis (textStyles)">
          <Stack gap="3" separator={<Box borderBottomWidth="1px" borderColor="border.subtle" />}>
            {TYPE_ROLES.map((t) => (
              <Flex key={t.style} gap="4" align="baseline" wrap="wrap">
                <Code w="128px" flexShrink={0}>{t.style}</Code>
                <Text textStyle={t.style} color={"heading" in t ? "fg.heading" : "fg"} flex="1" minW="200px">
                  {t.sample}
                </Text>
                <Stack gap="0" w={{ base: "full", md: "280px" }} flexShrink={0}>
                  <Text textStyle="caption" color="fg">{t.spec}</Text>
                  <Text textStyle="caption" color="fg.muted">{t.use}</Text>
                </Stack>
              </Flex>
            ))}
          </Stack>
        </Variant>
        <VariantGrid min="300px">
          <Variant label="Pesos">
            <Stack gap="2">
              {WEIGHTS.map((w) => (
                <Flex key={w.w} gap="3" align="baseline">
                  <Text textStyle="body" fontWeight={w.w} color="fg.heading" w="48px" flexShrink={0}>{w.w}</Text>
                  <Text textStyle="body.sm" color="fg.muted">{w.use}</Text>
                </Flex>
              ))}
            </Stack>
          </Variant>
          <Variant label="Regras">
            <Stack as="ul" gap="1.5" ps="4" listStyleType="disc" textStyle="body.sm" color="fg">
              <li>Todo texto de leitura em 16 px; 12 px só em legendas, badges e contadores.</li>
              <li>Alturas de linha fixas e múltiplas de 4: 12/16, 16/24, 20/28, 24/32, 28/36, 32/40, 40/48.</li>
              <li>Fira Sans em tudo; Fira Code só para códigos e identificadores.</li>
              <li>Números de tabela e métricas com algarismos tabulares.</li>
              <li>Títulos h1 → h2 → h3 sem pular nível; o tamanho vem do papel.</li>
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Forma, espaçamento e elevação" importPath="@/theme · radii · spacing · shadows" description="Organic Biophilic + Flat: cantos arredondados e sombra esverdeada, sem gradientes. Grade de 4 px em espaços, tamanhos, raios, ícones e alturas de controle. Os meios-passos do Chakra (0.5 · 1.5 · 2.5 · 3.5 · 4.5) foram arredondados para cima no tema: 4 · 8 · 12 · 16 · 20 px.">
        <VariantGrid min="300px">
          <Variant label="Raios">
            <Row gap="4" align="flex-end">
              {RADII.map((r) => (
                <Stack key={r.token} gap="1" align="center">
                  <Box boxSize="56px" bg="primary.subtle" borderWidth="1px" borderColor="border.emphasized" borderRadius={r.token} />
                  <Code>{r.token}</Code>
                  <Text textStyle="caption" color="fg.muted">{r.px} · {r.use}</Text>
                </Stack>
              ))}
            </Row>
          </Variant>
          <Variant label="Espaçamento">
            <Stack gap="2">
              {SPACING.map((s) => (
                <Flex key={s} align="center" gap="3">
                  <Text textStyle="caption" color="fg.muted" w="40px">{s} px</Text>
                  <Box h="3" w={`${s}px`} bg="primary" borderRadius="l1" />
                </Flex>
              ))}
            </Stack>
          </Variant>
          <Variant label="Alturas de controle">
            <Stack gap="2">
              {CONTROL_HEIGHTS.map((c) => (
                <Flex key={c.px} align="center" gap="3">
                  <Box h={`${c.px}px`} w="48px" flexShrink={0} bg="primary.subtle" borderWidth="1px" borderColor="border.emphasized" borderRadius="l2" />
                  <Text textStyle="code.sm" w="40px" flexShrink={0}>{c.px} px</Text>
                  <Text textStyle="caption" color="fg.muted">{c.use}</Text>
                </Flex>
              ))}
            </Stack>
          </Variant>
          <Variant label="Sombras" bg="bg">
            <Row gap="5">
              {SHADOWS.map((s) => (
                <Stack key={s} gap="2" align="center">
                  <Box boxSize="64px" bg="bg.panel" borderRadius="l3" boxShadow={s} />
                  <Code>{s}</Code>
                </Stack>
              ))}
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Ícones" importPath="lucide-react" description="Uma família em contorno, strokeWidth 1.75. Ícone ao lado de texto recebe aria-hidden; botão só com ícone recebe aria-label.">
        <Variant label="12 · 16 · 20 · 24">
          <Row gap="6" color="fg.heading">
            {[12, 16, 20, 24].map((size) => (
              <Stack key={size} gap="1" align="center">
                <Leaf size={size} strokeWidth={1.75} aria-hidden="true" />
                <Text textStyle="caption" color="fg.muted">{size}</Text>
              </Stack>
            ))}
          </Row>
        </Variant>
      </Demo>

      <Demo name="Button · IconButton" importPath="@chakra-ui/react (receita do tema)" description="Um único botão primário por tela. Em carregamento fica desabilitado e mostra o progresso; no mobile, altura mínima de 44 px.">
        <VariantGrid min="320px">
          <Variant label="Variantes">
            <Row>
              <Button variant="solid">Primário</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="ghost">Ghost</Button>
              <Button colorPalette="red">
                <Trash2 /> Excluir
              </Button>
              <Button colorPalette="red" variant="outline">Encerrar</Button>
            </Row>
          </Variant>
          <Variant label="Tamanhos sm · md · lg">
            <Row>
              <Button size="sm">Salvar</Button>
              <Button size="md">Salvar</Button>
              <Button size="lg">Salvar</Button>
            </Row>
          </Variant>
          <Variant label="Estados">
            <Row>
              <Button>
                <Save /> Salvar plantio
              </Button>
              <Button loading loadingText="Salvando…">Salvar plantio</Button>
              <Button disabled>Salvar plantio</Button>
              <Button variant="outline" disabled>Exportar</Button>
            </Row>
          </Variant>
          <Variant label="IconButton (aria-label)">
            <Row>
              <IconButton aria-label="Novo plantio" size="sm"><Plus /></IconButton>
              <IconButton aria-label="Editar" variant="outline"><Pencil /></IconButton>
              <IconButton aria-label="Baixar" variant="subtle"><Download /></IconButton>
              <IconButton aria-label="Mais ações" variant="ghost" size="lg"><MoreHorizontal /></IconButton>
              <IconButton aria-label="Excluir" colorPalette="red" variant="ghost"><Trash2 /></IconButton>
            </Row>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Foco e teclado" importPath="@/components/navigation · SkipNavLink" description="Anel de foco visível (2 px + offset 2 px) em todo controle. Use Tab nesta área para ver o link “Pular para o conteúdo”.">
        <Variant label="SkipNavLink + focusRing" position="relative" minH="140px">
          <SkipNavLink contentId="fundamentos-skip-alvo" />
          <Stack gap="3">
            <Row>
              <Button variant="outline">Tab até aqui</Button>
              <Button>Foco visível</Button>
            </Row>
            <SkipNavContent id="fundamentos-skip-alvo">
              <Text textStyle="body.sm" color="fg.muted">Alvo do link de pular (SkipNavContent).</Text>
            </SkipNavContent>
          </Stack>
        </Variant>
      </Demo>

      <Demo name="Material Liquid Glass" importPath="layerStyle glass · glass.primary · @/components/layout/glass" description="Só na navegação mobile. Com transparência reduzida, o material vira branco opaco.">
        <VariantGrid min="300px">
          <Variant label="Sobre fundo claro" bg="green.100">
            <GlassCapsule />
          </Variant>
          <Variant label="Sobre fundo escuro" bg="green.900">
            <GlassCapsule />
          </Variant>
          <Variant label="Tokens">
            <Stack gap="1.5">
              {GLASS_TOKENS.map(([k, v]) => (
                <Flex key={k} justify="space-between" gap="3">
                  <Text textStyle="body.sm" color="fg.muted">{k}</Text>
                  <Text textStyle="code.sm">{v}</Text>
                </Flex>
              ))}
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
