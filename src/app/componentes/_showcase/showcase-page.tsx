"use client";

import { Box, Button, Flex, Heading, Link, Skeleton, Stack, Text } from "@chakra-ui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useState } from "react";

/**
 * Vitrine com UM grupo por vez: só a seção ativa é montada e o JS de cada
 * seção é carregado sob demanda (next/dynamic). A seção ativa vive no hash
 * da URL (#formularios), então dá para compartilhar o link e usar o voltar.
 */

function SectionLoading() {
  return (
    <Stack gap="4" aria-busy="true" aria-label="Carregando seção">
      <Skeleton h="9" w="280px" />
      <Skeleton h="5" w="60%" />
      <Skeleton h="240px" />
      <Skeleton h="240px" />
    </Stack>
  );
}

/** Cada seção vira um chunk próprio, baixado só quando aberta. */
const load = (loader: () => Promise<ComponentType>) => dynamic(loader, { loading: SectionLoading });

interface SectionDef {
  id: string;
  label: string;
  Component: ComponentType;
}

const GROUPS: { label: string; items: SectionDef[] }[] = [
  {
    label: "Design system",
    items: [
      { id: "fundamentos", label: "Fundamentos", Component: load(() => import("./sections/fundamentos").then((m) => m.FundamentosSection)) },
      { id: "formularios", label: "Formulários", Component: load(() => import("./sections/formularios").then((m) => m.FormulariosSection)) },
      { id: "estrutura", label: "Estrutura e layout", Component: load(() => import("./sections/estrutura").then((m) => m.EstruturaSection)) },
      { id: "exibicao", label: "Exibição de dados", Component: load(() => import("./sections/exibicao").then((m) => m.ExibicaoSection)) },
      { id: "navegacao", label: "Navegação", Component: load(() => import("./sections/navegacao").then((m) => m.NavegacaoSection)) },
      { id: "sobreposicoes", label: "Sobreposições", Component: load(() => import("./sections/sobreposicoes").then((m) => m.SobreposicoesSection)) },
      { id: "feedback", label: "Feedback", Component: load(() => import("./sections/feedback").then((m) => m.FeedbackSection)) },
      { id: "autenticacao", label: "Autenticação", Component: load(() => import("./sections/autenticacao").then((m) => m.AutenticacaoSection)) },
    ],
  },
  {
    label: "Indicadores",
    items: [
      { id: "graficos", label: "Gráficos e diagramas", Component: load(() => import("./sections/graficos").then((m) => m.GraficosSection)) },
      { id: "historico", label: "Histórico", Component: load(() => import("./sections/historico").then((m) => m.HistoricoSection)) },
    ],
  },
  {
    label: "Domínio agrícola",
    items: [
      { id: "catalogo", label: "Espécies e cultivares", Component: load(() => import("./sections/catalogo").then((m) => m.CatalogoSection)) },
      { id: "areas", label: "Áreas", Component: load(() => import("./sections/areas").then((m) => m.AreasSection)) },
      { id: "plantios", label: "Plantios", Component: load(() => import("./sections/plantios").then((m) => m.PlantiosSection)) },
      { id: "plantas", label: "Plantas", Component: load(() => import("./sections/plantas").then((m) => m.PlantasSection)) },
      { id: "mudas", label: "Sementes e mudas", Component: load(() => import("./sections/mudas").then((m) => m.MudasSection)) },
      { id: "arquivos", label: "Documentos e imagens", Component: load(() => import("./sections/arquivos").then((m) => m.ArquivosSection)) },
    ],
  },
];

const SECTIONS = GROUPS.flatMap((g) => g.items);
const DEFAULT_ID = SECTIONS[0].id;

function readHash(): string {
  const hash = window.location.hash.slice(1);
  return SECTIONS.some((s) => s.id === hash) ? hash : DEFAULT_ID;
}

/** Seção ativa sincronizada com o hash (componente só roda no cliente). */
function useActiveSectionId(): string {
  const [id, setId] = useState(readHash);
  useEffect(() => {
    const onHashChange = () => setId(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return id;
}

function NavLink({ item, active }: { item: SectionDef; active: boolean }) {
  return (
    <Link
      href={`#${item.id}`}
      aria-current={active ? "page" : undefined}
      textStyle="body.sm"
      fontWeight={active ? "600" : "400"}
      color={active ? "fg.heading" : "fg"}
      bg={active ? "primary.subtle" : undefined}
      px="2.5"
      py="1.5"
      borderRadius="l2"
      whiteSpace="nowrap"
      _hover={{ bg: active ? "primary.subtle" : "bg.hover", textDecoration: "none" }}
    >
      {item.label}
    </Link>
  );
}

/** Corpo da vitrine (cliente: os componentes do Chakra usam contexto). */
export function ShowcasePage() {
  const activeId = useActiveSectionId();
  const index = SECTIONS.findIndex((s) => s.id === activeId);
  const active = SECTIONS[index];
  const prev = SECTIONS[index - 1];
  const next = SECTIONS[index + 1];
  const ActiveSection = active.Component;

  return (
    <Flex maxW="1440px" mx="auto" px={{ base: "4", md: "8" }} py="8" gap="10" align="flex-start">
      <Box
        as="nav"
        aria-label="Grupos de componentes"
        display={{ base: "none", lg: "block" }}
        position="sticky"
        top="6"
        w="220px"
        flexShrink={0}
        maxH="calc(100dvh - 48px)"
        overflowY="auto"
      >
        <Stack gap="6">
          {GROUPS.map((group) => (
            <Stack key={group.label} gap="0.5">
              <Text textStyle="overline" color="fg.muted" mb="1">
                {group.label}
              </Text>
              {group.items.map((item) => (
                <NavLink key={item.id} item={item} active={item.id === activeId} />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      <Stack as="main" gap="10" flex="1" minW="0">
        <Stack gap="2">
          <Heading as="h1" textStyle="display" color="fg.heading">
            Componentes do Fruti
          </Heading>
          <Text textStyle="body" color="fg.muted" maxW="72ch">
            Todos os componentes do design system e do domínio agrícola, com suas variantes e estados. Um grupo por vez;
            os dados são de exemplo e nenhuma ação altera registros.
          </Text>
        </Stack>

        {/* Mobile/tablet: grupos em faixa rolável. */}
        <Box as="nav" aria-label="Grupos de componentes" display={{ base: "block", lg: "none" }} mx={{ base: "-4", md: "-8" }}>
          <Flex gap="1" overflowX="auto" px={{ base: "4", md: "8" }} pb="2">
            {SECTIONS.map((item) => (
              <NavLink key={item.id} item={item} active={item.id === activeId} />
            ))}
          </Flex>
        </Box>

        <ActiveSection key={active.id} />

        <Flex justify="space-between" gap="3" pt="6" borderTopWidth="1px" borderColor="border" wrap="wrap">
          {prev ? (
            <Button asChild variant="outline">
              <a href={`#${prev.id}`}>
                <ArrowLeft aria-hidden="true" />
                {prev.label}
              </a>
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button asChild variant="outline">
              <a href={`#${next.id}`}>
                {next.label}
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          )}
        </Flex>
      </Stack>
    </Flex>
  );
}
