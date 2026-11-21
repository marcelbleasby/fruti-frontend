"use client";

import { Box, chakra, Flex, Text, type BoxProps, type SystemStyleObject } from "@chakra-ui/react";
import { Menu as MenuIcon } from "lucide-react";
import NextLink from "next/link";
import { glassFallbackCss, glassFocusRing, glassPrimaryFallbackCss } from "./glass";
import { NavIconGlyph } from "./nav-icon";
import { defaultIsNavActive, type IsNavActive, type NavIcon, type NavItem } from "./nav-types";

export interface MobileNavPrimaryAction {
  /** Rótulo acessível (ex.: "Novo plantio"). */
  label: string;
  icon: NavIcon;
  href?: string;
  onClick?: () => void;
}

export interface MobileNavBarProps extends Omit<BoxProps, "children"> {
  /** Até 4 destinos (além de "Mais"). Itens excedentes são ignorados. */
  items: NavItem[];
  activeHref?: string;
  isActive?: IsNavActive;
  /** Botão redondo em vidro verde à direita (ação primária da tela). */
  primaryAction?: MobileNavPrimaryAction;
  /** Mostra o botão "Mais" (abre o Drawer com a navegação completa). */
  onOpenMore?: () => void;
  moreLabel?: string;
  /** Destaca "Mais" quando o Drawer está aberto. */
  moreActive?: boolean;
  /** Fixa no rodapé da viewport (padrão). Desligue para posicionar por conta própria. */
  fixed?: boolean;
  "aria-label"?: string;
}

/** Altura que o conteúdo precisa reservar embaixo para não ficar sob a barra. */
export const MOBILE_NAV_BAR_OFFSET = "calc(120px + env(safe-area-inset-bottom, 0px))";

const itemCss: SystemStyleObject = {
  flex: "1 1 0",
  minW: "0",
  h: "56px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  borderRadius: "full",
  textDecoration: "none",
  fontFamily: "body",
  border: "none",
  p: "0",
  cursor: "pointer",
  bg: "transparent",
  color: "slate.700",
  fontWeight: "500",
  transition: "background-color 150ms ease, transform 150ms ease",
  _hover: { bg: "green.900/6" },
  _active: { bg: "green.900/10", color: "fg.heading", transform: "scale(0.96)" },
  _focusVisible: glassFocusRing,
  "&[aria-current=page], &[data-active]": {
    bg: "green.700/14",
    color: "fg.heading",
    fontWeight: "600",
  },
};

/**
 * Barra de navegação mobile em Liquid Glass (< 768 px): cápsula de 64 px com até
 * 4 destinos + "Mais", e ação primária em vidro verde. Com transparência reduzida
 * vira branca opaca. Use `hideFrom="md"` e reserve {@link MOBILE_NAV_BAR_OFFSET} no conteúdo.
 */
export function MobileNavBar({
  items,
  activeHref,
  isActive = defaultIsNavActive,
  primaryAction,
  onOpenMore,
  moreLabel = "Mais",
  moreActive = false,
  fixed = true,
  "aria-label": ariaLabel = "Navegação principal",
  ...rest
}: MobileNavBarProps) {
  const visible = items.slice(0, 4);

  return (
    <Box
      position={fixed ? "fixed" : "relative"}
      insetX={fixed ? "12px" : undefined}
      bottom={fixed ? "calc(16px + env(safe-area-inset-bottom, 0px))" : undefined}
      zIndex="sticky"
      {...rest}
    >
      <Flex align="center" gap="8px">
        <Flex
          as="nav"
          aria-label={ariaLabel}
          layerStyle="glass"
          css={glassFallbackCss}
          flex="1 1 auto"
          minW="0"
          h="64px"
          p="4px"
          gap="4px"
          borderRadius="full"
        >
          {visible.map((item) => {
            const active = isActive(item, activeHref);
            return (
              <Box key={item.href} asChild css={itemCss}>
                <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                  <NavItemContent icon={item.icon} label={item.label} active={active} badge={item.badge} />
                </NextLink>
              </Box>
            );
          })}
          {onOpenMore ? (
            <chakra.button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={moreActive}
              data-active={moreActive ? "" : undefined}
              onClick={onOpenMore}
              css={itemCss}
            >
              <NavItemContent icon={<MenuIcon />} label={moreLabel} active={moreActive} />
            </chakra.button>
          ) : null}
        </Flex>

        {primaryAction ? <PrimaryGlassAction action={primaryAction} /> : null}
      </Flex>
    </Box>
  );
}

function NavItemContent({
  icon,
  label,
  active,
  badge,
}: {
  icon: NavIcon;
  label: string;
  active: boolean;
  badge?: NavItem["badge"];
}) {
  const hasBadge = badge !== undefined && badge !== null && badge !== false;
  return (
    <>
      <Box as="span" position="relative" display="inline-flex">
        <NavIconGlyph icon={icon} size={24} color={active ? "primary" : "slate.700"} />
        {hasBadge ? (
          <Box
            as="span"
            position="absolute"
            top="-4px"
            insetEnd="-8px"
            minW="16px"
            h="16px"
            px="4px"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg="primary"
            color="fg.inverted"
            fontSize="xs"
            fontWeight="600"
            lineHeight="1"
          >
            {badge}
          </Box>
        ) : null}
      </Box>
      <Text as="span" fontSize="xs" lineHeight="1rem" maxW="full" truncate>
        {label}
      </Text>
    </>
  );
}

function PrimaryGlassAction({ action }: { action: MobileNavPrimaryAction }) {
  const css: SystemStyleObject = {
    boxSize: "64px",
    flex: "none",
    borderRadius: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    cursor: "pointer",
    p: "0",
    transition: "transform 150ms ease",
    _hover: { filter: "brightness(1.05)" },
    _active: { transform: "scale(0.96)" },
    _focusVisible: glassFocusRing,
    ...glassPrimaryFallbackCss,
  };
  const icon = <NavIconGlyph icon={action.icon} size={24} color="fg.inverted" />;

  if (action.href) {
    return (
      <Box asChild layerStyle="glass.primary" css={css}>
        <NextLink href={action.href} aria-label={action.label}>
          {icon}
        </NextLink>
      </Box>
    );
  }
  return (
    <chakra.button
      type="button"
      layerStyle="glass.primary"
      aria-label={action.label}
      onClick={action.onClick}
      css={css}
    >
      {icon}
    </chakra.button>
  );
}
