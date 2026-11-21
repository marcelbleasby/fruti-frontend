"use client";

import { Box, IconButton, Menu, Portal } from "@chakra-ui/react";
import { ChevronRight, Ellipsis, type LucideIcon } from "lucide-react";
import NextLink from "next/link";
import { Fragment, type ReactElement } from "react";

export interface ActionMenuItem {
  type?: "item";
  /** Identificador único do item (enviado em `onSelect` do menu). */
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Atalho de teclado exibido à direita (ex.: "E"). */
  shortcut?: string;
  /** Ação destrutiva: vermelho. Coloque por último, após um separador. */
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  /** Transforma o item em link. Interno usa next/link. */
  href?: string;
  /** Abre `href` em nova aba. */
  external?: boolean;
  /** Submenu (ex.: "Alterar status"). */
  items?: ActionMenuEntry[];
}

export interface ActionMenuSeparator {
  type: "separator";
  id?: string;
}

export type ActionMenuEntry = ActionMenuItem | ActionMenuSeparator;

export interface ActionMenuProps
  extends Omit<Menu.RootProps, "children" | "onSelect"> {
  items: ActionMenuEntry[];
  /** Rótulo acessível do botão e do menu (ex.: "Ações do plantio PL-0042"). */
  label: string;
  /** Gatilho próprio. Padrão: IconButton outline com reticências. */
  trigger?: ReactElement;
  /** Tamanho do gatilho padrão. */
  triggerSize?: "sm" | "md" | "lg";
  onSelect?: (value: string) => void;
}

const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;

/**
 * Menu de ações agrupadas (use quando houver mais de 3 ações por item).
 * Esc fecha e devolve o foco ao gatilho (Ark).
 */
export function ActionMenu(props: ActionMenuProps) {
  const { items, label, trigger, triggerSize = "md", onSelect, positioning, ...rootProps } = props;

  return (
    <Menu.Root
      positioning={{ placement: "bottom-end", ...positioning }}
      onSelect={(details) => onSelect?.(details.value)}
      {...rootProps}
    >
      <Menu.Trigger asChild>
        {trigger ?? (
          <IconButton aria-label={label} variant="outline" size={triggerSize}>
            <Ellipsis size={20} strokeWidth={1.75} aria-hidden />
          </IconButton>
        )}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <MenuContent items={items} label={label} />
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

function MenuContent({ items, label }: { items: ActionMenuEntry[]; label?: string }) {
  return (
    <Menu.Content
      aria-label={label}
      minW="220px"
      p="1"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="lg"
    >
      {items.map((entry, index) =>
        entry.type === "separator" ? (
          <Menu.Separator
            key={entry.id ?? `separator-${index}`}
            h="1px"
            my="1"
            mx="1.5"
            bg="primary.subtle"
          />
        ) : (
          <Fragment key={entry.value}>
            {entry.items?.length ? <SubMenu item={entry} /> : <ActionItem item={entry} />}
          </Fragment>
        ),
      )}
    </Menu.Content>
  );
}

const itemStyles = (destructive?: boolean) =>
  ({
    minH: { base: "11", md: "10" },
    px: "2.5",
    py: "0",
    gap: "2.5",
    borderRadius: "l2",
    textStyle: "body.sm",
    color: destructive ? "danger" : "fg",
    _highlighted: { bg: destructive ? "danger.subtle" : "primary.subtle" },
  }) as const;

function ItemIcon({ icon: IconComponent, destructive }: { icon?: LucideIcon; destructive?: boolean }) {
  if (!IconComponent) return null;
  return (
    <Box as="span" display="flex" color={destructive ? "danger" : "fg.muted"}>
      <IconComponent {...ICON} />
    </Box>
  );
}

function ActionItem({ item }: { item: ActionMenuItem }) {
  const content = (
    <>
      <ItemIcon icon={item.icon} destructive={item.destructive} />
      <Menu.ItemText>{item.label}</Menu.ItemText>
      {item.shortcut && (
        <Menu.ItemCommand
          as="kbd"
          opacity={1}
          ps="0"
          textStyle="code.sm"
          letterSpacing="normal"
          px="1"
          py="0"
          h="5"
          display="inline-flex"
          alignItems="center"
          borderRadius="sm"
          borderWidth="1px"
          borderBottomWidth="2px"
          borderColor="border.control"
          bg="bg.panel"
          color="fg"
        >
          {item.shortcut}
        </Menu.ItemCommand>
      )}
    </>
  );

  if (item.href) {
    return (
      <Menu.Item
        value={item.value}
        disabled={item.disabled}
        onSelect={item.onSelect}
        asChild
        {...itemStyles(item.destructive)}
      >
        {item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        ) : (
          <NextLink href={item.href}>{content}</NextLink>
        )}
      </Menu.Item>
    );
  }

  return (
    <Menu.Item
      value={item.value}
      disabled={item.disabled}
      onSelect={item.onSelect}
      {...itemStyles(item.destructive)}
    >
      {content}
    </Menu.Item>
  );
}

function SubMenu({ item }: { item: ActionMenuItem }) {
  return (
    <Menu.Root positioning={{ placement: "right-start", gutter: 4 }}>
      <Menu.TriggerItem {...itemStyles(item.destructive)}>
        <ItemIcon icon={item.icon} destructive={item.destructive} />
        <Menu.ItemText>{item.label}</Menu.ItemText>
        <Box as="span" display="flex" color="fg.muted">
          <ChevronRight {...ICON} />
        </Box>
      </Menu.TriggerItem>
      <Portal>
        <Menu.Positioner>
          <MenuContent items={item.items ?? []} />
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
