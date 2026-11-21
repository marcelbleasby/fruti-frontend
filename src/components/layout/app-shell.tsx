"use client";

import {
  Box,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  SkipNavContent,
  SkipNavLink,
  type SystemStyleObject,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AppHeader, type AppHeaderMenuItem } from "./app-header";
import { AppSidebar, type AppSidebarProps } from "./app-sidebar";
import {
  MOBILE_NAV_BAR_OFFSET,
  MobileNavBar,
  type MobileNavPrimaryAction,
} from "./mobile-nav-bar";
import { flattenNav, type IsNavActive, type NavEntry, type NavItem } from "./nav-types";
import type { AppUser } from "./user-avatar";

export interface AppShellProps {
  /** Navegação completa (sidebar, rail e Drawer "Mais"). */
  navItems: NavEntry[];
  /** Destinos da barra mobile (máx. 4). Padrão: os 3 primeiros itens da navegação. */
  mobileNavItems?: NavItem[];
  /** Caminho ativo. Padrão: `usePathname()`. */
  activeHref?: string;
  isActive?: IsNavActive;

  sidebarCollapsed?: boolean;
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  brand?: ReactNode;
  brandMark?: ReactNode;
  brandHref?: string;
  /** Abaixo da marca na sidebar e no Drawer mobile (ex.: seletor de propriedade). */
  sidebarHeader?: AppSidebarProps["header"];
  sidebarFooter?: ReactNode;

  /** Substitui o AppHeader padrão (tablet/desktop). */
  header?: ReactNode;
  /** Contexto da área no AppHeader padrão. */
  title?: ReactNode;
  user?: AppUser;
  userMenuItems?: AppHeaderMenuItem[];
  onUserMenuSelect?: (value: string) => void;
  headerActions?: ReactNode;

  /** Cabeçalho mobile (< 768 px), ex.: `<MobileAppHeader />`. Fica no topo do conteúdo. */
  mobileHeader?: ReactNode;
  /** Ação primária em vidro verde na barra mobile. */
  primaryAction?: MobileNavPrimaryAction;
  moreLabel?: string;
  navDrawerTitle?: string;

  /** Largura máxima do conteúdo (padrão: sem limite). */
  contentMaxW?: SystemStyleObject["maxW"];
  skipLinkLabel?: string;
  children: ReactNode;
}

/**
 * Casca do app. ≥ 1280 px: sidebar 248 px + cabeçalho. 768–1279 px: rail de
 * ícones 76 px + cabeçalho. < 768 px: cabeçalho mobile + barra Liquid Glass, com a
 * navegação completa em Drawer ("Mais").
 */
export function AppShell({
  navItems,
  mobileNavItems,
  activeHref,
  isActive,
  sidebarCollapsed,
  defaultSidebarCollapsed,
  onSidebarCollapsedChange,
  brand,
  brandMark,
  brandHref,
  sidebarHeader,
  sidebarFooter,
  header,
  title,
  user,
  userMenuItems,
  onUserMenuSelect,
  headerActions,
  mobileHeader,
  primaryAction,
  moreLabel = "Mais",
  navDrawerTitle = "Navegação",
  contentMaxW,
  skipLinkLabel = "Pular para o conteúdo",
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname ?? undefined;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomItems = mobileNavItems ?? flattenNav(navItems).slice(0, 3);
  const showDefaultHeader = header === undefined && Boolean(title || user || headerActions);

  return (
    <Flex minH="100dvh" bg="bg">
      <SkipNavLink>{skipLinkLabel}</SkipNavLink>

      <AppSidebar
        hideBelow="md"
        position="sticky"
        top="0"
        h="100dvh"
        items={navItems}
        activeHref={currentHref}
        isActive={isActive}
        collapsed={sidebarCollapsed}
        defaultCollapsed={defaultSidebarCollapsed}
        onCollapsedChange={onSidebarCollapsedChange}
        brand={brand}
        brandMark={brandMark}
        brandHref={brandHref}
        header={sidebarHeader}
        footer={sidebarFooter}
      />

      <Flex direction="column" flex="1" minW="0">
        {header ??
          (showDefaultHeader ? (
            <AppHeader
              hideBelow="md"
              position="sticky"
              top="0"
              zIndex="sticky"
              title={title}
              user={user}
              userMenuItems={userMenuItems}
              onUserMenuSelect={onUserMenuSelect}
              actions={headerActions}
            />
          ) : null)}

        <SkipNavContent
          as="main"
          flex="1"
          minW="0"
          w="full"
          maxW={contentMaxW}
          mx="auto"
          display="flex"
          flexDirection="column"
          gap={{ base: "16px", md: "20px", xl: "20px" }}
          px={{ base: "16px", md: "24px", xl: "32px" }}
          pt={{ base: "20px", md: "24px", xl: "28px" }}
          pb={{ base: MOBILE_NAV_BAR_OFFSET, md: "40px" }}
          outline="none"
        >
          {mobileHeader ? <Box hideFrom="md">{mobileHeader}</Box> : null}
          {children}
        </SkipNavContent>
      </Flex>

      <MobileNavBar
        hideFrom="md"
        items={bottomItems}
        activeHref={currentHref}
        isActive={isActive}
        primaryAction={primaryAction}
        onOpenMore={() => setDrawerOpen(true)}
        moreActive={drawerOpen}
        moreLabel={moreLabel}
      />

      <Drawer.Root
        open={drawerOpen}
        onOpenChange={(details) => setDrawerOpen(details.open)}
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxW="300px" bg="bg.panel">
              <Drawer.Title srOnly>{navDrawerTitle}</Drawer.Title>
              <Drawer.Body p="0" display="flex">
                <AppSidebar
                  flex="1"
                  borderEndWidth="0"
                  w="full"
                  responsive={false}
                  collapsed={false}
                  collapsible={false}
                  items={navItems}
                  activeHref={currentHref}
                  isActive={isActive}
                  brand={brand}
                  brandMark={brandMark}
                  brandHref={brandHref}
                  header={sidebarHeader}
                  footer={sidebarFooter}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </Drawer.Body>
              <Drawer.CloseTrigger asChild top="16px" insetEnd="12px">
                <CloseButton size="sm" aria-label="Fechar navegação" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  );
}
