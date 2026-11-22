"use client";

import { Factory, Percent, Scale, TrendingDown } from "lucide-react";
import { MetricGroup } from "@/components/charts/metric-group";
import type { ResumoDosProcessamentos } from "@/lib/beneficiamento/types";

/** Cards do topo: volume processado, rendimento e descarte (só registros válidos do período). */
export function ProcessamentosResumo({ resumo }: { resumo: ResumoDosProcessamentos }) {
  const parcial = resumo.considerados < resumo.total;
  const perdaPct = resumo.kgProcessados > 0 ? (resumo.perdaKg / resumo.kgProcessados) * 100 : null;

  return (
    <MetricGroup
      minChildWidth="150px"
      metrics={[
        {
          id: "registrados",
          label: "Processamentos",
          value: resumo.registrados,
          icon: <Factory />,
          description: "Registrados no período",
        },
        {
          id: "kg",
          label: "Fruta processada",
          value: resumo.kgProcessados,
          unit: "kg",
          formatOptions: { maximumFractionDigits: 1 },
          icon: <Scale />,
          description: parcial ? `Considerando ${resumo.considerados} registros` : "Entradas em kg",
        },
        {
          id: "rendimento",
          label: "Rendimento médio",
          value: resumo.rendimentoMedio === null ? "—" : resumo.rendimentoMedio,
          unit: resumo.rendimentoMedio === null ? undefined : "%",
          formatOptions: { maximumFractionDigits: 1 },
          icon: <Percent />,
          description: resumo.rendimentoMedio === null ? "Sem entradas em kg" : "Ponderado pelo kg de entrada",
        },
        {
          id: "perda",
          label: "Descarte",
          value: resumo.perdaKg,
          unit: "kg",
          formatOptions: { maximumFractionDigits: 1 },
          icon: <TrendingDown />,
          description:
            perdaPct === null
              ? "Nada processado"
              : `${perdaPct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do que entrou`,
        },
      ]}
    />
  );
}
