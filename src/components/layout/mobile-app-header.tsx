"use client";

import { Box, chakra, Flex, Heading, Text, type FlexProps } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { glassFallbackCss, glassFocusRing, glassIconButtonCss } from "./glass";
import { NavIconGlyph } from "./nav-icon";
import type { NavIcon } from "./nav-types";

export interface MobileHeaderAction {
  /** Rótulo acessível (botão só com ícone). */
  label: string;
  icon?: NavIcon;
  /** Conteúdo próprio no lugar do ícone (ex.: `<UserAvatar size={32} />`). */
  content?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Ex.: `"menu"` ou `"dialog"` quando abre um menu/Drawer. */
  "aria-haspopup"?: "menu" | "dialog" | "listbox" | true;
}

export interface MobileAppHeaderProps extends Omit<FlexProps, "title" | "children"> {
  /** `root`: telas de nível superior (título grande). `detail`: botão voltar. */
  variant?: "root" | "detail";
  /** Título da tela. No `detail` fica só para leitores de tela (o voltar dá o contexto). */
  title: string;
  /** Destino do voltar (variant `detail`). */
  backHref?: string;
  /** Nome da tela anterior, exibido no botão voltar. */
  backLabel?: string;
  /** Até 2 ações em vidro à direita. */
  actions?: MobileHeaderAction[];
  /** Nível do título (padrão h1: é o cabeçalho da tela). */
  headingAs?: "h1" | "h2";
}

/**
 * Cabeçalho mobile (< 768 px) com botões em Liquid Glass. Sem breadcrumb:
 * no nível superior o título grande basta; no detalhe, o voltar mostra a tela anterior.
 */
export function MobileAppHeader({
  variant = "root",
  title,
  backHref,
  backLabel = "Voltar",
  actions = [],
  headingAs = "h1",
  ...rest
}: MobileAppHeaderProps) {
  const visibleActions = actions.slice(0, 2);

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      gap="12px"
      minH="48px"
      {...rest}
    >
      {variant === "root" ? (
        <Heading
          as={headingAs}
          m="0"
          textStyle="display"
          color="fg.heading"
          truncate
        >
          {title}
        </Heading>
      ) : (
        <>
          <Heading as={headingAs} srOnly textStyle="heading.md">
            {title}
          </Heading>
          {backHref ? (
            <Box
              asChild
              layerStyle="glass"
              css={glassFallbackCss}
              h="44px"
              ps="8px"
              pe="16px"
              borderRadius="full"
              display="inline-flex"
              alignItems="center"
              gap="4px"
              minW="0"
              textDecoration="none"
              color="fg.heading"
              fontSize="md"
              fontWeight="600"
              transition="transform 150ms ease"
              _active={{ transform: "scale(0.96)" }}
              _focusVisible={glassFocusRing}
            >
              <NextLink href={backHref} aria-label={`Voltar para ${backLabel}`}>
                <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
                <Text as="span" truncate>
                  {backLabel}
                </Text>
              </NextLink>
            </Box>
          ) : (
            <Box />
          )}
        </>
      )}

      {visibleActions.length > 0 ? (
        <Flex
          layerStyle="glass"
          css={glassFallbackCss}
          gap="4px"
          p="4px"
          borderRadius="full"
          flexShrink={0}
        >
          {visibleActions.map((action) => (
            <GlassAction key={action.label} action={action} />
          ))}
        </Flex>
      ) : null}
    </Flex>
  );
}

function GlassAction({ action }: { action: MobileHeaderAction }) {
  const inner =
    action.content ?? (action.icon ? <NavIconGlyph icon={action.icon} size={20} /> : null);

  if (action.href) {
    return (
      <Box asChild css={glassIconButtonCss}>
        <NextLink href={action.href} aria-label={action.label}>
          {inner}
        </NextLink>
      </Box>
    );
  }
  return (
    <chakra.button
      type="button"
      aria-label={action.label}
      aria-haspopup={action["aria-haspopup"]}
      onClick={action.onClick}
      border="none"
      p="0"
      css={glassIconButtonCss}
    >
      {inner}
    </chakra.button>
  );
}
