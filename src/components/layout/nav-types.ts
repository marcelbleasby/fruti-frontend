import type { ElementType, ReactElement, ReactNode } from "react";

/**
 * Ícone de navegação. Prefira passar o elemento (`<LayoutDashboard />`):
 * elementos atravessam a fronteira server → client; componentes não.
 * Um componente (`LayoutDashboard`) também é aceito em pais client.
 */
export type NavIcon = ReactElement | ElementType;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  /** Contador ou marcador curto (ex.: `3`, `"novo"`). */
  badge?: ReactNode;
}

export interface NavGroup {
  /** Rótulo do grupo (ex.: "Catálogo"). Sem rótulo, os itens ficam soltos. */
  label?: string;
  items: NavItem[];
}

/** A navegação aceita grupos e/ou itens soltos. */
export type NavEntry = NavItem | NavGroup;

/** Decide se um item está ativo. Padrão: {@link matchNavHref}. */
export type IsNavActive = (item: NavItem, activeHref: string | undefined) => boolean;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return Array.isArray((entry as NavGroup).items);
}

/** Converte a entrada em grupos; itens soltos consecutivos viram um grupo sem rótulo. */
export function normalizeNavGroups(entries: NavEntry[]): NavGroup[] {
  const groups: NavGroup[] = [];
  let loose: NavItem[] | null = null;
  for (const entry of entries) {
    if (isNavGroup(entry)) {
      loose = null;
      groups.push(entry);
    } else {
      if (!loose) {
        loose = [];
        groups.push({ items: loose });
      }
      loose.push(entry);
    }
  }
  return groups;
}

export function flattenNav(entries: NavEntry[]): NavItem[] {
  return entries.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry]));
}

/** Ativo quando o caminho é igual ou é uma sub-rota (`/plantios/42` ativa `/plantios`). */
export function matchNavHref(href: string, activeHref: string | undefined): boolean {
  if (!activeHref) return false;
  const clean = (value: string) => value.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const target = clean(href);
  const current = clean(activeHref);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

export const defaultIsNavActive: IsNavActive = (item, activeHref) =>
  matchNavHref(item.href, activeHref);
