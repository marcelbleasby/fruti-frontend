"use client";

import { useChakraContext, type SystemContext } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

/**
 * Tema dos gráficos — resolve tokens do Chakra para valores de cor reais,
 * porque o canvas do chart.js não entende `var(--chakra-colors-…)`.
 */

/** Paleta categórica do DS (rosca e séries múltiplas), na ordem de uso. */
export const CHART_CATEGORICAL_TOKENS = [
  "green.900",
  "green.700",
  "green.400",
  "harvest.700",
  "harvest.300",
  "slate.400",
  "green.200",
  "sky.800",
] as const;

/** Mapa de calor: 0 · 1 · 2 · 3 · 4 · 5+ (board BentoDados › Atividade). */
export const HEATMAP_LEVEL_TOKENS = [
  "bg.hover",
  "green.200",
  "green.300",
  "green.500",
  "green.700",
  "green.900",
] as const;

/** Largura efetiva do bloco: 1 coluna → compact · 2 → standard · 4 → expanded. */
export type ChartVariant = "compact" | "standard" | "expanded";

/** Limites (px de largura do conteúdo) usados quando a variante não é informada. */
export const CHART_VARIANT_BREAKPOINTS = { compact: 300, expanded: 880 } as const;

export function variantForWidth(width: number): ChartVariant {
  if (width <= 0) return "standard";
  if (width < CHART_VARIANT_BREAKPOINTS.compact) return "compact";
  if (width >= CHART_VARIANT_BREAKPOINTS.expanded) return "expanded";
  return "standard";
}

const RAW_COLOR = /^(#|rgb|hsl|oklch|color\(|transparent|currentColor)/i;
const REF = /^\{(.+)\}$/;

function readCssVar(value: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const match = value.match(/^var\((--[^,)]+)/);
  if (!match) return undefined;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || undefined;
}

/**
 * Resolve um token de cor (`"green.700"`, `"fg.muted"`, `"primary"`) para o valor
 * final (hex/rgba). Segue as referências `{colors.x}` dos tokens semânticos; se
 * ainda restar uma variável CSS, lê o valor calculado no documento (cliente).
 */
export function resolveColorToken(sys: SystemContext, token: string): string {
  if (!token || RAW_COLOR.test(token)) return token;
  let name = token.startsWith("colors.") ? token : `colors.${token}`;
  for (let depth = 0; depth < 8; depth++) {
    const entry = sys.tokens.getByName(name);
    if (!entry) break;
    const value = entry.value;
    if (typeof value === "string" && !value.startsWith("var(")) return value;
    const original = entry.originalValue as unknown;
    const ref =
      typeof original === "string"
        ? original
        : original && typeof original === "object"
          ? ((original as Record<string, unknown>).base ?? (original as Record<string, unknown>)._light)
          : undefined;
    const match = typeof ref === "string" ? ref.match(REF) : null;
    if (!match) {
      if (typeof ref === "string" && RAW_COLOR.test(ref)) return ref;
      break;
    }
    name = match[1];
  }
  return readCssVar(sys.token(`colors.${token}`, token)) ?? token;
}

/** Hook: resolve uma lista de tokens de cor (memorizado pela lista). */
export function useColorTokens(tokens: readonly string[]): string[] {
  const sys = useChakraContext();
  const key = tokens.join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => tokens.map((t) => resolveColorToken(sys, t)), [sys, key]);
}

/** Cores e fonte de base dos gráficos, resolvidas a partir do tema. */
export interface ChartTheme {
  /** Série principal (primary · green.700). */
  primary: string;
  /** Série de comparação / período anterior (slate.400, tracejada). */
  comparison: string;
  /** Texto de eixos e rótulos (fg.muted). */
  text: string;
  /** Texto forte (valores diretos · fg). */
  textStrong: string;
  /** Linhas de grade (border.muted). */
  grid: string;
  /** Trilho das barras horizontais (bg.muted). */
  track: string;
  /** Fundo dos pontos e separadores (bg.panel). */
  surface: string;
  /** Fundo do tooltip (green.900) e seu texto (bg.panel). */
  tooltipBg: string;
  tooltipFg: string;
  fontFamily: string;
  categorical: string[];
  resolve: (token: string) => string;
}

const THEME_TOKENS = [
  "primary",
  "slate.400",
  "fg.muted",
  "fg",
  "border.muted",
  "bg.muted",
  "bg.panel",
  "green.900",
] as const;

const FALLBACK_FONT = "'Fira Sans', system-ui, sans-serif";

const noopSubscribe = () => () => {};

/** Fonte do body calculada no cliente (no servidor, a pilha padrão do DS). */
function useBodyFont(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => getComputedStyle(document.body).fontFamily || FALLBACK_FONT,
    () => FALLBACK_FONT,
  );
}

export function useChartTheme(): ChartTheme {
  const sys = useChakraContext();
  const [primary, comparison, text, textStrong, grid, track, surface, tooltipBg] = useColorTokens(THEME_TOKENS);
  const categorical = useColorTokens(CHART_CATEGORICAL_TOKENS);
  const fontFamily = useBodyFont();
  const resolve = useCallback((token: string) => resolveColorToken(sys, token), [sys]);

  return useMemo(
    () => ({
      primary,
      comparison,
      text,
      textStrong,
      grid,
      track,
      surface,
      tooltipBg,
      tooltipFg: surface,
      fontFamily,
      categorical,
      resolve,
    }),
    [primary, comparison, text, textStrong, grid, track, surface, tooltipBg, fontFamily, categorical, resolve],
  );
}

/**
 * Mede a largura de um elemento (ResizeObserver) e devolve a variante de conteúdo.
 * `override` fixa a variante (ex.: quando o BentoTile já sabe seu colSpan).
 */
export function useChartVariant<T extends HTMLElement = HTMLDivElement>(override?: ChartVariant) {
  const [node, setNode] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0]?.contentRect.width ?? 0);
      setWidth((prev) => (prev === next ? prev : next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { ref: setNode, width, variant: override ?? variantForWidth(width) };
}

const numberFormatters = new Map<string, Intl.NumberFormat>();

/** Formata número em pt-BR (cache de Intl.NumberFormat). */
export function formatChartNumber(value: number, options?: Intl.NumberFormatOptions, locale = "pt-BR"): string {
  const key = `${locale}|${JSON.stringify(options ?? {})}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter.format(value);
}

/** Base comum de tooltip do chart.js (cores do DS, sem caixas de cor). */
export function tooltipDefaults(theme: ChartTheme) {
  return {
    backgroundColor: theme.tooltipBg,
    titleColor: theme.tooltipFg,
    bodyColor: theme.tooltipFg,
    titleFont: { family: theme.fontFamily, size: 12, weight: 600 as const },
    bodyFont: { family: theme.fontFamily, size: 16 },
    padding: 12,
    cornerRadius: 8,
    displayColors: false,
    caretSize: 5,
  };
}
