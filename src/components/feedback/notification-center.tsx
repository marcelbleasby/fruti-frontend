"use client";

import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Heading,
  Icon,
  IconButton,
  Popover,
  Portal,
  Stack,
  Tabs,
  Text,
  chakra,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Bell, Settings } from "lucide-react";
import { useId, useMemo, useState, type ElementType, type ReactNode } from "react";
import { EmptyState } from "./empty-state";
import { NotificationBell } from "./notification-bell";

export type NotificationTone = "success" | "info" | "warning" | "error" | "neutral";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  /** Texto já formatado (ex.: "09:20", "17/11"). */
  time: string;
  /** ISO/Date opcional para o atributo `dateTime`. */
  dateTime?: string;
  /** Rótulo do grupo (ex.: "Hoje", "Esta semana"). Itens são agrupados na ordem recebida. */
  group?: string;
  read: boolean;
  tone?: NotificationTone;
  icon?: ElementType;
  href?: string;
}

type Filter = "all" | "unread";

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  /** Disparado ao abrir um item (use para marcar como lido / navegar). */
  onItemSelect?: (item: NotificationItem) => void;
  viewAllHref?: string;
  onViewAll?: () => void;
  onOpenPreferences?: () => void;
  /** Componente de link (ex.: `next/link`) usado nos itens com `href` e em "Ver todas". */
  linkAs?: ElementType;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultFilter?: Filter;
  /** Gatilho customizado; o padrão é o NotificationBell com a contagem de não lidas. */
  trigger?: ReactNode;
  title?: string;
  /** Nível do título do painel; os grupos ("Hoje"…) ficam um nível abaixo. */
  headingAs?: "h2" | "h3";
}

const toneStyles: Record<NotificationTone, { bg: string; color: string }> = {
  success: { bg: "green.100", color: "green.700" },
  info: { bg: "sky.100", color: "sky.800" },
  warning: { bg: "harvest.100", color: "harvest.700" },
  error: { bg: "red.100", color: "red.700" },
  neutral: { bg: "bg.muted", color: "slate.700" },
};

function groupItems(items: NotificationItem[]) {
  const groups: { label?: string; items: NotificationItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.label === item.group) last.items.push(item);
    else groups.push({ label: item.group, items: [item] });
  }
  return groups;
}

function NotificationRow({
  item,
  linkAs,
  onSelect,
}: {
  item: NotificationItem;
  linkAs?: ElementType;
  onSelect?: (item: NotificationItem) => void;
}) {
  const tone = toneStyles[item.tone ?? "neutral"];
  const ItemIcon = item.icon ?? Bell;
  const isLink = Boolean(item.href);

  return (
    <chakra.li listStyleType="none">
      <chakra.a
        as={isLink ? linkAs ?? "a" : "button"}
        {...(isLink ? { href: item.href } : { type: "button" })}
        onClick={() => onSelect?.(item)}
        display="flex"
        width="full"
        textAlign="start"
        gap="2.5"
        alignItems="flex-start"
        p="2.5"
        borderRadius="l3"
        textDecoration="none"
        color="inherit"
        bg={item.read ? "transparent" : "bg.subtle"}
        cursor="pointer"
        _hover={{ bg: "bg.hover" }}
        focusVisibleRing="inside"
      >
        <Box
          as="span"
          boxSize="9"
          flex="none"
          borderRadius="lg"
          bg={tone.bg}
          color={tone.color}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={ItemIcon} boxSize="4" strokeWidth={1.75} aria-hidden />
        </Box>
        <Stack as="span" gap="0.5" flex="1" minW="0">
          <Text as="span" fontSize="sm" fontWeight={item.read ? "500" : "600"} color="fg">
            {item.title}
          </Text>
          {item.description && (
            <Text as="span" fontSize="sm" color="fg.muted">
              {item.description}
            </Text>
          )}
        </Stack>
        <Flex as="span" direction="column" align="flex-end" gap="1.5" flex="none">
          <chakra.time dateTime={item.dateTime} fontSize="xs" color="fg.muted">
            {item.time}
          </chakra.time>
          {item.read ? (
            <Box as="span" w="2" flex="none" />
          ) : (
            <Box as="span" role="img" aria-label="Não lida" boxSize="2" mt="1.5" borderRadius="full" bg="primary" flex="none" />
          )}
        </Flex>
      </chakra.a>
    </chakra.li>
  );
}

function NotificationList({
  items,
  filter,
  linkAs,
  onSelect,
  groupAs,
}: {
  groupAs: "h3" | "h4";
  items: NotificationItem[];
  filter: Filter;
  linkAs?: ElementType;
  onSelect?: (item: NotificationItem) => void;
}) {
  const groups = useMemo(() => groupItems(items), [items]);

  if (items.length === 0) {
    return filter === "unread" ? (
      <EmptyState variant="all-done" size="sm" title="Tudo em dia" description="Nenhuma notificação não lida. Novos avisos aparecem aqui." />
    ) : (
      <EmptyState variant="all-done" size="sm" icon={Bell} title="Nenhuma notificação" description="Novos avisos aparecem aqui." />
    );
  }

  return (
    <chakra.ul m="0" p="0" pb="1.5" listStyleType="none">
      {groups.map((group, index) => (
        <chakra.li key={group.label ?? `g-${index}`} display="flex" flexDirection="column" listStyleType="none">
          {group.label && (
            <Heading
              as={groupAs}
              m="0"
              px="4"
              pt="2.5"
              pb="1"
              textStyle="overline"
              color="fg.muted"
            >
              {group.label}
            </Heading>
          )}
          <chakra.ul m="0" px="1.5" listStyleType="none">
            {group.items.map((item) => (
              <NotificationRow key={item.id} item={item} linkAs={linkAs} onSelect={onSelect} />
            ))}
          </chakra.ul>
        </chakra.li>
      ))}
    </chakra.ul>
  );
}

/**
 * Central de notificações: o que aconteceu enquanto o usuário estava fora.
 * Popover no desktop; Drawer inferior no mobile.
 */
export function NotificationCenter({
  notifications,
  onMarkAllRead,
  onItemSelect,
  viewAllHref,
  onViewAll,
  onOpenPreferences,
  linkAs,
  open,
  defaultOpen,
  onOpenChange,
  defaultFilter = "all",
  trigger,
  title = "Notificações",
  headingAs = "h2",
}: NotificationCenterProps) {
  const groupAs = headingAs === "h2" ? "h3" : "h4";
  const titleId = useId();
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const unread = notifications.filter((n) => !n.read);
  const visible = filter === "unread" ? unread : notifications;

  const triggerNode = trigger ?? <NotificationBell count={unread.length} />;

  const renderHeader = (closeSlot?: ReactNode) => (
    <Flex px="4" pt="3.5" pb="2.5" justify="space-between" align="center" gap="2">
      <Heading as={headingAs} id={titleId} m="0" textStyle="heading.md" color="fg.heading">
        {title}
      </Heading>
      {onMarkAllRead && (
        <Button
          variant="ghost"
          size="sm"
          px="1"
          color="primary"
          fontSize="sm"
          fontWeight="600"
          textDecoration="underline"
          textUnderlineOffset="4px"
          disabled={unread.length === 0}
          onClick={onMarkAllRead}
        >
          Marcar todas como lidas
        </Button>
      )}
      {closeSlot}
    </Flex>
  );

  const body = (
    <Tabs.Root value={filter} onValueChange={(d) => setFilter(d.value as Filter)} variant="line" size="sm">
      <Tabs.List aria-label="Filtrar notificações" px="4" gap="0.5" borderColor="border">
        <Tabs.Trigger value="all" minH="10" px="2.5" fontSize="sm" color="fg.muted" _selected={{ color: "fg.heading", fontWeight: "600" }}>
          Todas
        </Tabs.Trigger>
        <Tabs.Trigger value="unread" minH="10" px="2.5" fontSize="sm" color="fg.muted" _selected={{ color: "fg.heading", fontWeight: "600" }}>
          Não lidas{unread.length > 0 ? ` · ${unread.length}` : ""}
        </Tabs.Trigger>
        <Tabs.Indicator bg="primary" height="2px" bottom="-1px" />
      </Tabs.List>
      <Box maxH={{ base: "none", md: "420px" }} overflowY="auto">
        <NotificationList items={visible} filter={filter} linkAs={linkAs} onSelect={onItemSelect} groupAs={groupAs} />
      </Box>
    </Tabs.Root>
  );

  const footer =
    viewAllHref || onViewAll || onOpenPreferences ? (
      <Flex px="4" py="2.5" borderTopWidth="1px" borderColor="green.100" justify="space-between" align="center">
        {viewAllHref || onViewAll ? (
          <chakra.a
            as={viewAllHref ? linkAs ?? "a" : "button"}
            {...(viewAllHref ? { href: viewAllHref } : { type: "button" })}
            onClick={onViewAll}
            fontSize="sm"
            fontWeight="600"
            color="primary"
            textDecoration="underline"
            textUnderlineOffset="4px"
            cursor="pointer"
            focusVisibleRing="outside"
            borderRadius="l1"
          >
            Ver todas
          </chakra.a>
        ) : (
          <span />
        )}
        {onOpenPreferences && (
          <IconButton aria-label="Preferências de notificação" variant="ghost" size="sm" boxSize="9" color="fg.muted" onClick={onOpenPreferences}>
            <Icon as={Settings} boxSize="4" strokeWidth={1.75} aria-hidden />
          </IconButton>
        )}
      </Flex>
    ) : null;

  if (isMobile) {
    return (
      <Drawer.Root
        placement="bottom"
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(d) => onOpenChange?.(d.open)}
      >
        <Drawer.Trigger asChild>{triggerNode}</Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content aria-labelledby={titleId} borderTopRadius="l4" maxH="85dvh" bg="bg.panel">
              {renderHeader(
                <Drawer.CloseTrigger asChild position="static">
                  <CloseButton size="md" aria-label="Fechar notificações" />
                </Drawer.CloseTrigger>,
              )}
              <Drawer.Body p="0">{body}</Drawer.Body>
              {footer}
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }

  return (
    <Popover.Root
      positioning={{ placement: "bottom-end", gutter: 8 }}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(d) => onOpenChange?.(d.open)}
    >
      <Popover.Trigger asChild>{triggerNode}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            aria-labelledby={titleId}
            width="380px"
            maxW="calc(100vw - 32px)"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            borderRadius="2xl"
            boxShadow="lg"
            overflow="hidden"
          >
            {renderHeader()}
            {body}
            {footer}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
