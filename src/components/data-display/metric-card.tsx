import { Box, type BoxProps, Flex, Icon, Stat as ChakraStat, VisuallyHidden } from "@chakra-ui/react";
import NextLink from "next/link";
import type { ReactElement, ReactNode } from "react";
import { SkeletonMetricCard } from "./skeleton-blocks";
import { TREND_COLOR, TREND_SR_PREFIX, type Trend, trendSentiment } from "./stat";

export type MetricCardSize = "md" | "lg";
export type MetricCardSurface = "card" | "subtle" | "none";

export interface MetricCardProps extends Omit<BoxProps, "children"> {
  label: string;
  /** Número (formatado em pt-BR) ou texto já formatado. */
  value: number | string;
  unit?: string;
  /** Texto auxiliar abaixo do valor (quando não há `trend`, ou como complemento). */
  description?: ReactNode;
  /** Ícone lucide (ex.: <LandPlot />), exibido no canto superior direito. */
  icon?: ReactElement;
  /** Variação: value "+4,2 ha", direction "up", label "em 12 meses". */
  trend?: Trend;
  /** Torna o card inteiro um link (ex.: para a lista filtrada). */
  href?: string;
  /** md (padrão): compacto, valor 24px · lg: destaque, valor 40px. */
  size?: MetricCardSize;
  /** card (padrão): branco com borda · subtle: tile verde claro · none: sem moldura (dentro de um BentoTile). */
  surface?: MetricCardSurface;
  /** Série curta para minigráfico de linha (só no tamanho lg). */
  sparkline?: number[];
  /** Descrição acessível do minigráfico, ex.: "subiu de 14,2 para 18,4 ha em 12 meses". */
  sparklineLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  loading?: boolean;
}

const SURFACES: Record<MetricCardSurface, BoxProps> = {
  card: { bg: "bg.panel", borderWidth: "1px", borderColor: "border", borderRadius: "l3", p: "3.5" },
  subtle: {
    bg: "primary.subtle",
    borderWidth: "1px",
    borderColor: "border",
    borderRadius: "l4",
    boxShadow: "sm",
    p: "24px",
  },
  none: {},
};

function Sparkline({ data, label }: { data: number[]; label?: string }) {
  if (data.length < 2) return null;
  const W = 276;
  const H = 60;
  const PAD = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return [x, y] as const;
  });
  const last = pts[pts.length - 1];
  return (
    <Box color="primary" mt="3">
      <svg
        viewBox={`-4 0 ${W + 8} ${H}`}
        width="100%"
        height={H}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <polyline
          points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={last[0]} cy={last[1]} r={4} fill="currentColor" />
      </svg>
    </Box>
  );
}

/**
 * MetricCard — indicador com rótulo, valor + unidade, variação e ícone.
 * Chakra v3: Stat.Root · Stat.Label · Stat.ValueText · Stat.HelpText.
 */
export function MetricCard({
  label,
  value,
  unit,
  description,
  icon,
  trend,
  href,
  size = "md",
  surface = "card",
  sparkline,
  sparklineLabel,
  formatOptions,
  locale = "pt-BR",
  loading,
  ...rest
}: MetricCardProps) {
  if (loading) {
    return <SkeletonMetricCard {...(surface === "none" ? { borderWidth: "0", p: "0", bg: "transparent" } : {})} {...rest} />;
  }

  const lg = size === "lg";
  const formatted = typeof value === "number" ? new Intl.NumberFormat(locale, formatOptions).format(value) : value;

  const body = (
    <ChakraStat.Root gap="1.5" flex="initial">
      <ChakraStat.Label
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
        textStyle="label"
        fontWeight={lg ? "500" : "400"}
        color="fg.muted"
      >
        <span>{label}</span>
        {icon &&
          (lg ? (
            <Flex
              boxSize="9"
              borderRadius="lg"
              bg="bg.panel"
              color="primary"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon boxSize="20px" strokeWidth="1.75">
                {icon}
              </Icon>
            </Flex>
          ) : (
            <Icon boxSize="4" color="primary" strokeWidth="1.75" flexShrink={0}>
              {icon}
            </Icon>
          ))}
      </ChakraStat.Label>
      <ChakraStat.ValueText
        textStyle={lg ? "display.lg" : "heading.lg"}
        color="fg.heading"
        letterSpacing="normal"
        alignItems="baseline"
        gap="1.5"
        css={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatted}
        {unit && (
          <ChakraStat.ValueUnit fontSize={lg ? "lg" : "sm"} fontWeight="500" color="fg.muted">
            {unit}
          </ChakraStat.ValueUnit>
        )}
      </ChakraStat.ValueText>
      {trend && (
        <ChakraStat.HelpText fontSize="sm" color="fg">
          <Box as="strong" fontWeight="700" color={TREND_COLOR[trendSentiment(trend)]}>
            <VisuallyHidden>{TREND_SR_PREFIX[trend.direction]}</VisuallyHidden>
            {trend.value}
          </Box>
          {trend.label ? ` ${trend.label}` : null}
        </ChakraStat.HelpText>
      )}
      {description && (
        <ChakraStat.HelpText fontSize="sm" color="fg.muted">
          {description}
        </ChakraStat.HelpText>
      )}
      {lg && sparkline && <Sparkline data={sparkline} label={sparklineLabel} />}
    </ChakraStat.Root>
  );

  const frame: BoxProps = { display: "flex", flexDirection: "column", minW: "0", ...SURFACES[surface] };

  if (href) {
    return (
      <Box
        asChild
        {...frame}
        color="inherit"
        textDecoration="none"
        transitionProperty="border-color, box-shadow"
        transitionDuration="fast"
        _hover={{ borderColor: "primary" }}
        _focusVisible={{ borderColor: "primary", outline: "2px solid", outlineColor: "primary", outlineOffset: "2px" }}
        {...rest}
      >
        <NextLink href={href}>{body}</NextLink>
      </Box>
    );
  }

  return (
    <Box {...frame} {...rest}>
      {body}
    </Box>
  );
}
