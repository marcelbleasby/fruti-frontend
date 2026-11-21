"use client";

import { Box, type BoxProps, Flex, VisuallyHidden } from "@chakra-ui/react";
import { ChartNoAxesColumn } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/data-display/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ChartTable } from "./chart-table";
import type { ChartFallbackTable, ChartState } from "./types";

export interface ChartContainerProps extends Omit<BoxProps, "children"> {
  /** loading · empty · error · ready (padrão). */
  state?: ChartState;
  /** Altura reservada em todos os estados (padrão 220px) — sem salto de layout. */
  minHeight?: number;
  /** Tabela equivalente. Oculta visualmente (só leitores de tela) salvo `showTable`. */
  fallbackTable?: ChartFallbackTable;
  /** Mostra a tabela no lugar do gráfico (alternância "Gráfico/Tabela"). */
  showTable?: boolean;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Ação do estado vazio (ex.: "Ampliar período"). */
  emptyAction?: ReactNode;
  errorTitle?: ReactNode;
  errorDescription?: ReactNode;
  onRetry?: () => void | Promise<unknown>;
  /** Rótulo acessível do carregamento. */
  loadingLabel?: string;
  /** O gráfico (BarChart, LineChart, DoughnutChart…). */
  children?: ReactNode;
}

const SKELETON_BARS = [30, 60, 45, 80, 52, 70];

/**
 * ChartContainer — reserva a altura do gráfico e resolve os estados
 * (Skeleton, EmptyState, ErrorState). A tabela equivalente fica sempre
 * disponível para leitores de tela e, com `showTable`, visível.
 */
export function ChartContainer({
  state = "ready",
  minHeight = 220,
  fallbackTable,
  showTable,
  emptyTitle = "Sem dados no período",
  emptyDescription = "Amplie o período ou ajuste os filtros.",
  emptyAction,
  errorTitle = "Não foi possível carregar o gráfico",
  errorDescription,
  onRetry,
  loadingLabel = "Carregando gráfico",
  children,
  ...rest
}: ChartContainerProps) {
  let body: ReactNode;

  if (state === "loading") {
    body = (
      <Flex
        aria-busy="true"
        aria-label={loadingLabel}
        role="status"
        h={`${minHeight}px`}
        align="flex-end"
        gap="1.5"
        p="3"
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        bg="bg.panel"
      >
        {SKELETON_BARS.map((h, i) => (
          <Skeleton key={i} flex="1" h={`${Math.round(((minHeight - 24) * h) / 400) * 4}px`} borderRadius="sm" />
        ))}
      </Flex>
    );
  } else if (state === "empty") {
    body = (
      <Flex minH={`${minHeight}px`} h="full" align="center" justify="center">
        <EmptyState
          variant="no-results"
          size="sm"
          bordered
          icon={ChartNoAxesColumn}
          title={emptyTitle}
          description={emptyDescription}
          actions={emptyAction}
          w="full"
          minH={`${minHeight}px`}
        />
      </Flex>
    );
  } else if (state === "error") {
    body = (
      <Flex minH={`${minHeight}px`} h="full" align="center" justify="center">
        <ErrorState
          variant="partial"
          size="compact"
          title={errorTitle}
          description={errorDescription}
          onRetry={onRetry}
          focusOnMount={false}
          w="full"
        />
      </Flex>
    );
  } else if (showTable && fallbackTable) {
    body = (
      <Box minH={`${minHeight}px`}>
        <ChartTable {...fallbackTable} />
      </Box>
    );
  } else {
    body = (
      <>
        <Box position="relative" minH={`${minHeight}px`} w="full">
          {children}
        </Box>
        {fallbackTable && (
          <VisuallyHidden>
            <ChartTable {...fallbackTable} />
          </VisuallyHidden>
        )}
      </>
    );
  }

  return (
    <Box position="relative" w="full" minW="0" {...rest}>
      {body}
    </Box>
  );
}
