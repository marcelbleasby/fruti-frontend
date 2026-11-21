import { Box, type BoxProps, SimpleGrid, VisuallyHidden } from "@chakra-ui/react";
import { SkeletonDetails, SkeletonMetricCard, SkeletonTableRows } from "./skeleton-blocks";
import { Spinner } from "./spinner";

export type LoadingStateVariant = "table" | "cards" | "details" | "inline";

export interface LoadingStateProps extends Omit<BoxProps, "children"> {
  /** table: linhas de registro · cards: grade de MetricCards · details: pares rótulo/valor · inline: spinner + texto */
  variant?: LoadingStateVariant;
  /** Linhas (table), cards (cards) ou pares (details). */
  rows?: number;
  /** Colunas do variant details. */
  columns?: 1 | 2 | 3;
  /** Texto anunciado (e visível no inline). Padrão "Carregando…". */
  label?: string;
}

/**
 * LoadingState — Skeleton com o mesmo formato do conteúdo final (sem salto de layout).
 * Spinner só para operações curtas (variant inline).
 * Chakra v3: Skeleton · SkeletonText · Spinner.
 */
export function LoadingState({ variant = "table", rows, columns = 2, label = "Carregando…", ...rest }: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <Box display="inline-flex" {...rest}>
        <Spinner size="sm" label={label} />
      </Box>
    );
  }

  let content;
  switch (variant) {
    case "cards":
      content = (
        <SimpleGrid minChildWidth="200px" gap="3">
          {Array.from({ length: rows ?? 4 }, (_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </SimpleGrid>
      );
      break;
    case "details":
      content = <SkeletonDetails rows={rows ?? 6} columns={columns} />;
      break;
    default:
      content = <SkeletonTableRows rows={rows ?? 3} />;
  }

  return (
    <Box role="status" aria-busy="true" aria-live="polite" {...rest}>
      <VisuallyHidden>{label}</VisuallyHidden>
      {content}
    </Box>
  );
}
