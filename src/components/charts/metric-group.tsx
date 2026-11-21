import { SimpleGrid, type SimpleGridProps } from "@chakra-ui/react";
import { MetricCard, type MetricCardProps } from "@/components/data-display/metric-card";

export interface MetricGroupItem extends MetricCardProps {
  /** Chave estável (padrão: `label`). */
  id?: string;
}

export interface MetricGroupProps extends Omit<SimpleGridProps, "children" | "columns" | "minChildWidth"> {
  metrics: MetricGroupItem[];
  /** Mostra skeletons no formato final (mesma quantidade de cards). */
  loading?: boolean;
  /** Quantidade de skeletons quando `metrics` ainda está vazio (padrão 4). */
  loadingCount?: number;
  /**
   * Largura mínima de cada card (ex.: "140px"): a grade decide as colunas.
   * Sem ela: 1 coluna no celular, 2 no tablet e todas (até 4) no desktop.
   */
  minChildWidth?: string;
  /** Colunas no desktop (padrão: quantidade de métricas, até 4). */
  columns?: number;
}

/**
 * MetricGroup — grupo de MetricCard (indicadores do Painel).
 * Quebra em 2 colunas no tablet e 1 no celular, sem rolagem horizontal.
 * Chakra v3: SimpleGrid · MetricCard.
 */
export function MetricGroup({
  metrics,
  loading,
  loadingCount = 4,
  minChildWidth,
  columns,
  gap = "2.5",
  ...rest
}: MetricGroupProps) {
  const count = metrics.length || loadingCount;
  const desktop = columns ?? Math.min(Math.max(count, 1), 4);
  const layout: SimpleGridProps = minChildWidth
    ? { minChildWidth }
    : { columns: { base: 1, sm: Math.min(2, desktop), lg: desktop } };

  const items: MetricGroupItem[] =
    loading && metrics.length === 0
      ? Array.from({ length: loadingCount }, (_, i) => ({ id: `loading-${i}`, label: "", value: "" }))
      : metrics;

  return (
    <SimpleGrid gap={gap} {...layout} {...rest}>
      {items.map(({ id, ...metric }) => (
        <MetricCard key={id ?? metric.label} {...metric} loading={loading || metric.loading} />
      ))}
    </SimpleGrid>
  );
}
