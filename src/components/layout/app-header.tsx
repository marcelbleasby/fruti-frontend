"use client";

import {
  Box,
  chakra,
  Flex,
  HStack,
  IconButton,
  Menu,
  Portal,
  Text,
  type FlexProps,
} from "@chakra-ui/react";
import { ChevronDown, Menu as MenuIcon } from "lucide-react";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { NavIconGlyph } from "./nav-icon";
import type { NavIcon } from "./nav-types";
import { UserAvatar, type AppUser } from "./user-avatar";

export interface AppHeaderMenuItem {
  value: string;
  label: string;
  icon?: NavIcon;
  /** Quando informado, o item navega para o link. */
  href?: string;
  /** `danger` para ações destrutivas (ex.: Sair). */
  tone?: "default" | "danger";
}

export interface AppHeaderProps extends Omit<FlexProps, "title" | "children"> {
  /** Contexto da área (ex.: "Produção", "Visão geral"). */
  title?: ReactNode;
  /** Slot opcional ao lado do título (ex.: `<Breadcrumb />`). */
  breadcrumb?: ReactNode;
  user?: AppUser;
  /** Itens do menu da conta. Sem itens, o avatar é só informativo. */
  userMenuItems?: AppHeaderMenuItem[];
  onUserMenuSelect?: (value: string) => void;
  /** Mostra o botão de menu (abre a navegação em Drawer abaixo de 768 px). */
  onOpenNav?: () => void;
  openNavLabel?: string;
  /** Ações extras antes do menu da conta (ex.: notificações). */
  actions?: ReactNode;
}

/** Cabeçalho do app (tablet e desktop): contexto da área à esquerda, conta à direita. */
export function AppHeader({
  title,
  breadcrumb,
  user,
  userMenuItems,
  onUserMenuSelect,
  onOpenNav,
  openNavLabel = "Abrir navegação",
  actions,
  ...rest
}: AppHeaderProps) {
  return (
    <Flex
      as="header"
      h="64px"
      flexShrink={0}
      align="center"
      justify="space-between"
      gap={{ base: "8px", md: "12px", xl: "16px" }}
      ps={{ base: "4px", md: "24px", xl: "32px" }}
      pe={{ base: "8px", md: "16px", xl: "32px" }}
      bg="bg.panel"
      borderBottomWidth="1px"
      borderColor="border"
      {...rest}
    >
      <HStack gap="4px" minW="0" flex="1">
        {onOpenNav ? (
          <IconButton
            variant="ghost"
            boxSize="44px"
            minW="44px"
            color="fg.muted"
            aria-label={openNavLabel}
            aria-haspopup="dialog"
            onClick={onOpenNav}
          >
            <MenuIcon strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
        ) : null}
        <HStack gap="16px" minW="0">
          {title ? (
            <Text as="p" m="0" textStyle="heading.sm" color="fg.heading" truncate>
              {title}
            </Text>
          ) : null}
          {breadcrumb ? <Box minW="0">{breadcrumb}</Box> : null}
        </HStack>
      </HStack>

      <HStack gap="8px" flexShrink={0}>
        {actions}
        {user ? (
          <UserMenu user={user} items={userMenuItems} onSelect={onUserMenuSelect} />
        ) : null}
      </HStack>
    </Flex>
  );
}

interface UserMenuProps {
  user: AppUser;
  items?: AppHeaderMenuItem[];
  onSelect?: (value: string) => void;
}

function UserIdentity({ user, showChevron }: { user: AppUser; showChevron: boolean }) {
  return (
    <>
      <UserAvatar user={user} size={36} />
      <Flex direction="column" textAlign="start" display={{ base: "none", xl: "flex" }}>
        <Text as="span" textStyle="label" fontWeight="600" color="fg">
          {user.name}
        </Text>
        {user.role ? (
          <Text as="span" textStyle="caption" fontWeight="400" color="fg.muted">
            {user.role}
          </Text>
        ) : null}
      </Flex>
      {showChevron ? (
        <Box as="span" display={{ base: "none", xl: "inline-flex" }} color="fg.muted">
          <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
        </Box>
      ) : null}
    </>
  );
}

function UserMenu({ user, items, onSelect }: UserMenuProps) {
  const identityLayout = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minH: "44px",
    minW: "44px",
    p: { base: "4px", xl: "4px 8px 4px 4px" },
    borderRadius: { base: "full", xl: "lg" },
  } as const;

  if (!items || items.length === 0) {
    return (
      <Box {...identityLayout}>
        <UserIdentity user={user} showChevron={false} />
      </Box>
    );
  }

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }} onSelect={(details) => onSelect?.(details.value)}>
      <Menu.Trigger asChild>
        <chakra.button
          type="button"
          aria-label={`Menu da conta de ${user.name}`}
          bg="transparent"
          border="none"
          cursor="pointer"
          fontFamily="body"
          transition="background-color 150ms ease"
          _hover={{ bg: "bg.hover" }}
          _expanded={{ bg: "bg.hover" }}
          focusVisibleRing="outside"
          {...identityLayout}
        >
          <UserIdentity user={user} showChevron />
        </chakra.button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="200px" borderRadius="l3" boxShadow="lg">
            {items.map((item) => {
              const danger = item.tone === "danger";
              const content = (
                <>
                  {item.icon ? <NavIconGlyph icon={item.icon} size={16} /> : null}
                  <Box as="span" flex="1">
                    {item.label}
                  </Box>
                </>
              );
              return (
                <Menu.Item
                  key={item.value}
                  value={item.value}
                  asChild={Boolean(item.href)}
                  color={danger ? "fg.error" : undefined}
                  _highlighted={danger ? { bg: "danger.subtle", color: "fg.error" } : undefined}
                >
                  {item.href ? <NextLink href={item.href}>{content}</NextLink> : content}
                </Menu.Item>
              );
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
