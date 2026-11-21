"use client";

import { Flex, type FlexProps } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { ActivityTimeline } from "@/components/data-display/activity-timeline";
import { SegmentedControl } from "@/components/forms/segmented-control";
import type { HistoryEvent, HistoryEventType } from "../../types";
import { historyToActivity } from "../utils";

export type PlantingTimelineFilter = "todos" | "status" | "plantas" | "arquivos";

const FILTER_ITEMS: { value: PlantingTimelineFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "status", label: "Status" },
  { value: "plantas", label: "Plantas" },
  { value: "arquivos", label: "Arquivos" },
];

const FILTER_TYPES: Record<Exclude<PlantingTimelineFilter, "todos">, HistoryEventType[]> = {
  status: ["status"],
  plantas: ["plantas"],
  arquivos: ["arquivos"],
};

export interface PlantingTimelineProps extends Omit<FlexProps, "children"> {
  /** Id do plantio (para quem busca os eventos fora do componente). */
  plantingId?: string;
  /** Eventos do mais recente ao mais antigo. */
  events: HistoryEvent[];
  /** Filtro controlado. */
  filter?: PlantingTimelineFilter;
  defaultFilter?: PlantingTimelineFilter;
  onFilterChange?: (filter: PlantingTimelineFilter) => void;
  maxItems?: number;
  onSeeAll?: () => void;
}

/**
 * PlantingTimeline — linha do tempo do plantio com filtro por tipo de evento.
 * Chakra v3: ActivityTimeline · SegmentGroup (filtro).
 */
export function PlantingTimeline({
  plantingId,
  events,
  filter,
  defaultFilter = "todos",
  onFilterChange,
  maxItems,
  onSeeAll,
  ...rest
}: PlantingTimelineProps) {
  const [internal, setInternal] = useState<PlantingTimelineFilter>(defaultFilter);
  const active = filter ?? internal;

  const items = useMemo(() => {
    const visible = active === "todos" ? events : events.filter((e) => FILTER_TYPES[active].includes(e.type));
    return historyToActivity(visible);
  }, [events, active]);

  const emptyText =
    active === "todos" ? "Nenhum evento registrado neste plantio." : "Nenhum evento deste tipo neste plantio.";

  return (
    <Flex direction="column" gap="4" data-planting-id={plantingId} {...rest}>
      <SegmentedControl
        label="Tipo de evento"
        items={FILTER_ITEMS}
        value={active}
        onValueChange={(v) => {
          const next = (v ?? "todos") as PlantingTimelineFilter;
          setInternal(next);
          onFilterChange?.(next);
        }}
      />
      <ActivityTimeline items={items} maxItems={maxItems} onSeeAll={onSeeAll} emptyText={emptyText} />
    </Flex>
  );
}
