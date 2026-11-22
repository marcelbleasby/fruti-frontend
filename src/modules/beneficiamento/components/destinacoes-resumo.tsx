"use client";

import { HandCoins, HandHeart, Scale, TrendingDown } from "lucide-react";
import { MetricGroup } from "@/components/charts/metric-group";
import type { ResumoDasDestinacoes } from "@/lib/beneficiamento/types";
import { formatMoeda } from "@/lib/estoque/format";

const kg = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;

/** Cards do topo: o que saiu do estoque de produção no período (só registros válidos). */
export function DestinacoesResumo({ resumo }: { resumo: ResumoDasDestinacoes }) {
  const parcial = resumo.considerados < resumo.total;
  return (
    <MetricGroup
      minChildWidth="150px"
      metrics={[
        {
          id: "vendido",
          label: "Vendido",
          value: resumo.valorVendido,
          formatOptions: { style: "currency", currency: "BRL", maximumFractionDigits: 0 },
          icon: <HandCoins />,
          description: `${resumo.vendas} ${resumo.vendas === 1 ? "venda" : "vendas"}${parcial ? ` · ${resumo.considerados} considerados` : ""}`,
        },
        {
          id: "kg-vendidos",
          label: "Quantidade vendida",
          value: resumo.kgVendidos,
          unit: "kg",
          formatOptions: { maximumFractionDigits: 1 },
          icon: <Scale />,
          description: resumo.kgVendidos > 0 ? `Média de ${formatMoeda(resumo.valorVendido / resumo.kgVendidos)}/kg` : "Nenhuma venda em kg",
        },
        {
          id: "doado",
          label: "Doação e consumo",
          value: resumo.kgDoadosOuConsumidos,
          unit: "kg",
          formatOptions: { maximumFractionDigits: 1 },
          icon: <HandHeart />,
          description: "Sem cobrança",
        },
        {
          id: "perda",
          label: "Perdas",
          value: resumo.kgPerdidos,
          unit: "kg",
          formatOptions: { maximumFractionDigits: 1 },
          icon: <TrendingDown />,
          description: resumo.kgPerdidos > 0 ? `${kg(resumo.kgPerdidos)} descartados` : "Nenhuma perda",
        },
      ]}
    />
  );
}
