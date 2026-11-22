"use client";

import { Boxes, CalendarClock, CircleAlert, Wallet } from "lucide-react";
import { MetricGroup } from "@/components/charts/metric-group";
import type { ResumoDoEstoque, TipoDeEstoque } from "@/lib/estoque/types";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Cards do topo: saldo, vencimentos e valor parado em estoque. */
export function EstoqueResumo({ tipo, resumo }: { tipo: TipoDeEstoque; resumo: ResumoDoEstoque }) {
  const item = tipo === "insumos" ? ["insumo", "insumos"] : ["lote", "lotes"];
  const parcial = resumo.considerados < resumo.comSaldo;

  return (
    <MetricGroup
      minChildWidth="150px"
      metrics={[
        {
          id: "saldo",
          label: tipo === "insumos" ? "Insumos com saldo" : "Lotes com saldo",
          value: resumo.comSaldo,
          icon: <Boxes />,
        },
        {
          id: "vencem",
          label: "Vencem em 30 dias",
          value: resumo.vencemEm30Dias,
          icon: <CalendarClock />,
          description: resumo.vencemEm30Dias > 0 ? "Priorize o uso" : "Nada vencendo",
        },
        {
          id: "vencidos",
          label: "Vencidos",
          value: resumo.vencidos,
          icon: <CircleAlert />,
          description: resumo.vencidos > 0 ? "Use ou registre a perda" : "Nenhum vencido",
        },
        {
          id: "valor",
          label: "Valor em estoque",
          value: resumo.valorEmEstoque,
          formatOptions: { style: "currency", currency: "BRL", maximumFractionDigits: 0 },
          icon: <Wallet />,
          description:
            resumo.semCusto > 0
              ? `${plural(resumo.semCusto, item[0], item[1])} sem custo informado`
              : parcial
                ? `Considerando ${resumo.considerados} ${item[1]}`
                : "Pelo custo de entrada",
        },
      ]}
    />
  );
}
