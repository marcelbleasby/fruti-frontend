"use client";

import {
  Box,
  Flex,
  IconButton,
  Portal,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useControllableState,
  type BoxProps,
} from "@chakra-ui/react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import NextLink from "next/link";
import { useId, type ReactNode } from "react";
import { FrutiLogo, FrutiLogoMark } from "./fruti-logo";
import { NavIconGlyph } from "./nav-icon";
import {
  defaultIsNavActive,
  normalizeNavGroups,
  type IsNavActive,
  type NavEntry,
  type NavItem,
} from "./nav-types";

/** Seletor de valor por estado (expandida × rail), já responsivo quando `responsive`. */
export type SidebarSel = <T>(expanded: T, rail: T) => T | { base: T; xl: T };

export interface SidebarSlotContext {
  /** Use em props de estilo: `w={sel("full", "48px")}` — vem certo do SSR, sem piscar. */
  sel: SidebarSel;
  /** Estado atual em JS (para Tooltip, posição de menu…). */
  railNow: boolean;
}

export interface AppSidebarProps extends Omit<BoxProps, "children" | "as"> {
  /** Grupos e/ou itens de navegação. */
  items: NavEntry[];
  /** Caminho atual; o item correspondente recebe `aria-current="page"`. */
  activeHref?: string;
  /** Regra de item ativo (padrão: caminho igual ou sub-rota). */
  isActive?: IsNavActive;
  /** Recolhida (só ícones). Controlado quando informado. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Mostra o botão de recolher/expandir (só a partir de 1280 px quando `responsive`). */
  collapsible?: boolean;
  /**
   * Segue o grid do DS: rail de ícones (76 px) entre 768 e 1279 px e sidebar
   * completa (248 px) a partir de 1280 px. Desligue para controlar só por `collapsed`
   * (ex.: dentro de um Drawer).
   */
  responsive?: boolean;
  /** Marca na versão expandida (padrão: símbolo + "Fruti"). */
  brand?: ReactNode;
  /** Marca na versão recolhida (padrão: símbolo). */
  brandMark?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  /** Abaixo da marca, antes da navegação (ex.: seletor de propriedade). */
  header?: ReactNode | ((ctx: SidebarSlotContext) => ReactNode);
  /** Conteúdo fixo no rodapé (ex.: versão, ajuda). */
  footer?: ReactNode;
  /** Chamado ao clicar em um item (ex.: fechar o Drawer no mobile). */
  onNavigate?: (item: NavItem) => void;
  "aria-label"?: string;
  collapseLabel?: string;
  expandLabel?: string;
}

export function AppSidebar({
  items,
  activeHref,
  isActive = defaultIsNavActive,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = true,
  responsive = true,
  brand,
  brandMark,
  brandHref = "/",
  brandLabel = "Fruti, início",
  header,
  footer,
  onNavigate,
  "aria-label": ariaLabel = "Navegação principal",
  collapseLabel = "Recolher navegação",
  expandLabel = "Expandir navegação",
  ...rest
}: AppSidebarProps) {
  const [isCollapsed, setCollapsed] = useControllableState({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });

  // Rail (só ícones) agora? Necessário para ligar os Tooltips.
  const railByBreakpoint = useBreakpointValue({ base: true, xl: isCollapsed }) ?? true;
  const railNow = responsive ? railByBreakpoint : isCollapsed;

  /** Valor por estado: expandida × rail, respeitando o breakpoint quando `responsive`. */
  const sel: SidebarSel = <T,>(expanded: T, rail: T) =>
    responsive ? { base: rail, xl: isCollapsed ? rail : expanded } : isCollapsed ? rail : expanded;

  const groups = normalizeNavGroups(items);
  const baseId = useId();

  return (
    <Box
      as="nav"
      aria-label={ariaLabel}
      display="flex"
      flexDirection="column"
      flexShrink={0}
      w={sel("248px", "76px")}
      py={sel("16px", "16px")}
      px={sel("12px", "0")}
      gap={sel("20px", "8px")}
      alignItems={sel("stretch", "center")}
      bg="bg.panel"
      borderEndWidth="1px"
      borderColor="border"
      overflowY="auto"
      overflowX="hidden"
      transition="width 150ms ease"
      {...rest}
    >
      {/* Marca + recolher */}
      <Flex
        flexDirection={sel("row", "column")}
        alignItems="center"
        justifyContent={sel("space-between", "center")}
        gap={sel("8px", "4px")}
        minH={sel("40px", "auto")}
        ps={sel("8px", "0")}
        pe={sel("4px", "0")}
        mb={sel("0", "8px")}
      >
        <Box
          asChild
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH={sel("40px", "48px")}
          minW={sel("auto", "48px")}
          borderRadius="lg"
          textDecoration="none"
          focusVisibleRing="outside"
        >
          <NextLink href={brandHref} aria-label={brandLabel}>
            <Box display={sel("flex", "none")}>{brand ?? <FrutiLogo />}</Box>
            <Box display={sel("none", "flex")}>{brandMark ?? <FrutiLogoMark />}</Box>
          </NextLink>
        </Box>
        <IconButton
          variant="ghost"
          size="sm"
          boxSize="36px"
          minW="36px"
          color="fg.muted"
          aria-label={isCollapsed ? expandLabel : collapseLabel}
          aria-expanded={!isCollapsed}
          display={!collapsible ? "none" : responsive ? { base: "none", xl: "inline-flex" } : "inline-flex"}
          onClick={() => setCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronsRight strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronsLeft strokeWidth={1.75} aria-hidden="true" />
          )}
        </IconButton>
      </Flex>

      {header ? (
        <Box w={sel("auto", "full")} display="flex" justifyContent="center" flexDirection="column">
          {typeof header === "function" ? header({ sel, railNow }) : header}
        </Box>
      ) : null}

      {groups.map((group, groupIndex) => {
        const labelId = group.label ? `${baseId}-group-${groupIndex}` : undefined;
        return (
          <Box key={group.label ?? `group-${groupIndex}`} w={sel("auto", "full")}>
            {group.label ? (
              <Text
                id={labelId}
                display={sel("block", "none")}
                m="0 0 4px"
                px="12px"
                textStyle="overline"
                color="fg.muted"
              >
                {group.label}
              </Text>
            ) : null}
            <Stack
              as="ul"
              listStyleType="none"
              m="0"
              p="0"
              gap={sel("4px", "8px")}
              alignItems={sel("stretch", "center")}
              aria-labelledby={labelId}
            >
              {group.items.map((item) => (
                <Box as="li" key={item.href} display="flex" justifyContent="center" flexDirection="column">
                  <SidebarLink
                    item={item}
                    active={isActive(item, activeHref)}
                    railNow={railNow}
                    sel={sel}
                    onNavigate={onNavigate}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        );
      })}

      {footer ? (
        <Box mt="auto" pt="2" w="full">
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}

type Sel = SidebarSel;

interface SidebarLinkProps {
  item: NavItem;
  active: boolean;
  railNow: boolean;
  sel: Sel;
  onNavigate?: (item: NavItem) => void;
}

function SidebarLink({ item, active, railNow, sel, onNavigate }: SidebarLinkProps) {
  const hasBadge = item.badge !== undefined && item.badge !== null && item.badge !== false;
  const badgeText =
    typeof item.badge === "string" || typeof item.badge === "number" ? String(item.badge) : undefined;
  const accessibleName = badgeText ? `${item.label}, ${badgeText}` : item.label;

  const link = (
    <Box
      asChild
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent={sel("flex-start", "center")}
      alignSelf={sel("stretch", "center")}
      gap="12px"
      w={sel("auto", "48px")}
      h={sel("auto", "48px")}
      minH={sel("40px", "48px")}
      px={sel("12px", "0")}
      borderRadius={sel("lg", "xl")}
      textDecoration="none"
      textStyle="label"
      fontWeight={active ? "600" : "500"}
      bg={active ? "primary.subtle" : "transparent"}
      color={active ? "fg.heading" : "fg"}
      transition="background-color 150ms ease"
      _hover={{ bg: active ? "primary.subtle" : "bg.hover", color: "fg.heading" }}
      focusVisibleRing="inside"
    >
      <NextLink
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={accessibleName}
        onClick={onNavigate ? () => onNavigate(item) : undefined}
      >
        <NavIconGlyph icon={item.icon} size={20} color={active ? "primary" : "fg.muted"} />
        <Text as="span" display={sel("inline", "none")} flex="1" minW="0" truncate>
          {item.label}
        </Text>
        {hasBadge ? (
          <>
            <Box
              as="span"
              display={sel("inline-flex", "none")}
              alignItems="center"
              justifyContent="center"
              minW="20px"
              h="20px"
              px="4px"
              borderRadius="full"
              bg={active ? "primary" : "primary.subtle"}
              color={active ? "fg.inverted" : "fg.heading"}
              fontSize="xs" lineHeight="1rem"
              fontWeight="600"
              aria-hidden="true"
            >
              {item.badge}
            </Box>
            <Box
              as="span"
              display={sel("none", "inline-flex")}
              position="absolute"
              top="4px"
              insetStart="calc(50% + 4px)"
              alignItems="center"
              justifyContent="center"
              minW="16px"
              h="16px"
              px="4px"
              lineHeight="1"
              borderRadius="full"
              bg="primary"
              color="fg.inverted"
              fontSize="xs"
              fontWeight="600"
              borderWidth="2px"
              borderColor="bg.panel"
              boxSizing="content-box"
              aria-hidden="true"
            >
              {item.badge}
            </Box>
          </>
        ) : null}
      </NextLink>
    </Box>
  );

  return (
    <Tooltip.Root
      disabled={!railNow}
      openDelay={300}
      closeDelay={0}
      positioning={{ placement: "right" }}
    >
      <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            {item.label}
            {badgeText ? ` · ${badgeText}` : null}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
