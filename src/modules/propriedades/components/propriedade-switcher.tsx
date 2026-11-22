"use client";

import { Box, Flex, Menu, Portal, Skeleton, Text, Tooltip, chakra } from "@chakra-ui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { SidebarSlotContext } from "@/components/layout";

export interface PropriedadeOption {
  id: string;
  nome: string;
  /** Papel do usuário na propriedade, já traduzido (ex.: "Proprietário"). */
  papel?: string;
}

export interface PropriedadeSwitcherProps extends SidebarSlotContext {
  propriedades: PropriedadeOption[];
  ativaId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter((p) => p.length > 2 || /^\p{Lu}/u.test(p));
  const letras = (partes.length > 1 ? [partes[0], partes[partes.length - 1]] : [nome]).map((p) => p[0]);
  return letras.join("").slice(0, 2).toUpperCase();
}

function Monograma({ nome, size = 32 }: { nome: string; size?: number }) {
  return (
    <Flex
      as="span"
      aria-hidden="true"
      flex="none"
      boxSize={`${size}px`}
      align="center"
      justify="center"
      borderRadius="md"
      bg="primary.subtle"
      color="fg.heading"
      fontSize="xs"
      fontWeight="700"
      letterSpacing="0.02em"
    >
      {iniciais(nome)}
    </Flex>
  );
}

/**
 * Seletor da propriedade ativa, para o `header` da AppSidebar. Expandida:
 * monograma + nome + papel. No rail: só o monograma, com o nome em Tooltip.
 * Com uma propriedade só, mostra sem menu.
 */
export function PropriedadeSwitcher({ propriedades, ativaId, onSelect, loading, sel, railNow }: PropriedadeSwitcherProps) {
  const ativa = propriedades.find((p) => p.id === ativaId) ?? null;

  const frame = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    w: sel("full", "48px"),
    h: sel("52px", "48px"),
    px: sel("8px", "0"),
    justifyContent: sel("flex-start", "center"),
    alignSelf: sel("stretch", "center"),
    borderRadius: sel("lg", "xl"),
    borderWidth: sel("1px", "0"),
    borderColor: "border",
    bg: "bg.panel",
    textAlign: "start",
  } as const;

  if (loading) {
    return <Skeleton {...frame} borderWidth="0" aria-label="Carregando propriedades" />;
  }

  if (!ativa) {
    return (
      <Text display={sel("block", "none")} px="12px" textStyle="caption" color="fg.muted">
        Nenhuma propriedade vinculada.
      </Text>
    );
  }

  const identidade = (
    <>
      <Monograma nome={ativa.nome} />
      <Flex direction="column" minW="0" flex="1" display={sel("flex", "none")}>
        <Text as="span" textStyle="label" fontWeight="600" color="fg.heading" truncate>
          {ativa.nome}
        </Text>
        {ativa.papel ? (
          <Text as="span" textStyle="caption" color="fg.muted" truncate>
            {ativa.papel}
          </Text>
        ) : null}
      </Flex>
    </>
  );

  const comTooltip = (trigger: React.ReactNode) => (
    <Tooltip.Root disabled={!railNow} openDelay={300} closeDelay={0} positioning={{ placement: "right" }}>
      <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>{ativa.nome}</Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );

  if (propriedades.length === 1) {
    return comTooltip(
      <Box {...frame} tabIndex={railNow ? 0 : undefined} aria-label={`Propriedade: ${ativa.nome}`}>
        {identidade}
      </Box>,
    );
  }

  return (
    <Menu.Root
      positioning={railNow ? { placement: "right-start", gutter: 12 } : { placement: "bottom-start" }}
    >
      {/* Tooltip num wrapper: Tooltip.Trigger e Menu.Trigger no mesmo elemento brigam pelo id e o menu perde a âncora. */}
      {comTooltip(
        <Box display="flex" w={sel("full", "48px")} alignSelf={sel("stretch", "center")}>
          <Menu.Trigger asChild>
            <chakra.button
              type="button"
              aria-label={`Propriedade atual: ${ativa.nome}. Trocar propriedade`}
              cursor="pointer"
              fontFamily="body"
              transition="background-color 150ms ease, border-color 150ms ease"
              _hover={{ bg: "bg.hover" }}
              _expanded={{ bg: "bg.hover", borderColor: "border.emphasized" }}
              focusVisibleRing="outside"
              {...frame}
            >
              {identidade}
              <Box as="span" display={sel("inline-flex", "none")} color="fg.muted" flex="none">
                <ChevronsUpDown size={16} strokeWidth={1.75} aria-hidden="true" />
              </Box>
            </chakra.button>
          </Menu.Trigger>
        </Box>,
      )}
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW={railNow ? "240px" : "var(--reference-width)"}
            maxW="320px"
            maxH="360px"
            overflowY="auto"
            borderRadius="l3"
            boxShadow="lg"
          >
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel textStyle="overline" color="fg.muted">
                Propriedades
              </Menu.ItemGroupLabel>
              <Menu.RadioItemGroup value={ativa.id} onValueChange={(d) => d.value && onSelect(d.value)}>
                {propriedades.map((p) => (
                  <Menu.RadioItem key={p.id} value={p.id} gap="10px" py="6px">
                    <Monograma nome={p.nome} size={28} />
                    <Flex direction="column" minW="0" flex="1">
                      <Text as="span" textStyle="label" fontWeight={p.id === ativa.id ? "600" : "500"} truncate>
                        {p.nome}
                      </Text>
                      {p.papel ? (
                        <Text as="span" textStyle="caption" color="fg.muted">
                          {p.papel}
                        </Text>
                      ) : null}
                    </Flex>
                    <Menu.ItemIndicator color="primary">
                      <Check size={16} strokeWidth={2} />
                    </Menu.ItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
