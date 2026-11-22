"use client";

import { SegmentedControl } from "@/components/forms/segmented-control";
import { useEstoqueUrl } from "../use-estoque-url";

/** Insumos: alterna entre o saldo somado por insumo e a lista de lotes. */
export function InsumosVisao({ visao }: { visao: "saldos" | "lotes" }) {
  const url = useEstoqueUrl();
  return (
    <SegmentedControl
      label="Visualização"
      items={[
        { value: "saldos", label: "Saldos por insumo" },
        { value: "lotes", label: "Lotes" },
      ]}
      value={visao}
      onValueChange={(v) => {
        if (!v || v === visao) return;
        // Os filtros de cada visão são diferentes: troca limpando os específicos.
        url.setFiltros({ visao: v === "lotes" ? "lotes" : null, insumo: null, origem: null, saldo: null, ordenar: null });
      }}
    />
  );
}
