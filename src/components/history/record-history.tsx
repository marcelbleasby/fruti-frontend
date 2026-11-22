"use client";

import { Box, type BoxProps, Button, Flex, Heading, chakra } from "@chakra-ui/react";
import { History } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Skeleton, SkeletonCircle } from "@/components/data-display/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { NativeSelectField } from "@/components/forms/native-select-field";
import type { HistoryEvent, HistoryEventType } from "@/modules/types";
import { useTodayISO } from "@/hooks/useTodayISO";
import { HISTORY_EVENT_TYPES, dayLabel, formatDay, localDayKey } from "./history-utils";
import { RecordHistoryItem } from "./record-history-item";
import { type HeadingLevel, nextHeadingLevel } from "@/components/data-display/heading-level";

export type HistoryFilter = HistoryEventType | "todos";

export interface RecordHistoryProps extends Omit<BoxProps, "children" | "title"> {
  events: HistoryEvent[];
  title?: string;
  /** Nível do título (o tamanho vem do papel, não do nível). Padrão h3. */
  headingAs?: HeadingLevel;
  /** Filtro controlado (padrão interno: "todos"). */
  filter?: HistoryFilter;
  onFilterChange?: (filter: HistoryFilter) => void;
  /** Tipos oferecidos no filtro (padrão: todos). */
  eventTypes?: HistoryEventType[];
  /** Esconde o filtro por tipo. */
  hideFilter?: boolean;
  /** Carregamento inicial: linhas em skeleton. */
  loading?: boolean;
  /** Há eventos anteriores na API → mostra "Carregar eventos anteriores". */
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  /** Referência para "Hoje"/"Ontem" (padrão: agora). */
  now?: Date;
  /** Moldura de card (padrão: true). */
  framed?: boolean;
}

/**
 * RecordHistory — histórico de um registro agrupado por dia, do mais recente ao
 * mais antigo, com filtro por tipo e paginação ("Carregar eventos anteriores").
 * Mostra só o que a API disponibiliza; sem eventos, usa o EmptyState.
 */
export function RecordHistory({
  events,
  title = "Histórico",
  headingAs = "h3",
  filter: filterProp,
  onFilterChange,
  eventTypes = Object.keys(HISTORY_EVENT_TYPES) as HistoryEventType[],
  hideFilter,
  loading,
  hasMore,
  onLoadMore,
  loadingMore,
  now,
  framed = true,
  ...rest
}: RecordHistoryProps) {
  const titleId = useId();
  const [internalFilter, setInternalFilter] = useState<HistoryFilter>("todos");
  const filter = filterProp ?? internalFilter;
  const setFilter = (f: HistoryFilter) => {
    if (filterProp === undefined) setInternalFilter(f);
    onFilterChange?.(f);
  };

  const today = useTodayISO();
  const groups = useMemo(() => {
    const ref = now ?? (today ? new Date(`${today}T12:00:00`) : undefined);
    const visible = (filter === "todos" ? events : events.filter((e) => e.type === filter))
      .slice()
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    const map = new Map<string, { label: string; items: HistoryEvent[] }>();
    for (const e of visible) {
      const d = new Date(e.at);
      const key = localDayKey(d);
      const group = map.get(key) ?? { label: ref ? dayLabel(d, ref) : formatDay(d), items: [] };
      group.items.push(e);
      map.set(key, group);
    }
    return [...map.entries()];
  }, [events, filter, now, today]);

  let body;
  if (loading) {
    body = (
      <Flex direction="column" gap="3" aria-busy="true" aria-label="Carregando histórico">
        {[0, 1, 2].map((i) => (
          <Flex key={i} align="center" gap="2.5" minH="11">
            <SkeletonCircle size="32px" />
            <Skeleton h="4" flex="1" />
            <Skeleton h="3" w="10" />
          </Flex>
        ))}
      </Flex>
    );
  } else if (groups.length === 0) {
    body =
      filter === "todos" ? (
        <EmptyState
          variant="in-card"
          size="sm"
          icon={History}
          title="Nenhum evento registrado"
          description="As alterações deste registro aparecem aqui."
        />
      ) : (
        <EmptyState
          variant="no-results"
          size="sm"
          icon={History}
          title="Nenhum evento deste tipo"
          description={`Não há eventos de ${HISTORY_EVENT_TYPES[filter].label.toLowerCase()} neste registro.`}
          actions={
            <Button size="sm" variant="outline" onClick={() => setFilter("todos")}>
              Mostrar todos
            </Button>
          }
        />
      );
  } else {
    body = (
      <chakra.ol m="0" p="0" listStyleType="none" display="flex" flexDirection="column" gap="3.5">
        {groups.map(([key, group]) => (
          <chakra.li key={key} display="flex" flexDirection="column" gap="1.5">
            <Heading as={nextHeadingLevel(headingAs)} m="0" textStyle="overline" color="fg.muted">
              {group.label}
            </Heading>
            <chakra.ul m="0" p="0" listStyleType="none" display="flex" flexDirection="column" gap="0.5">
              {group.items.map((e) => (
                <chakra.li key={e.id}>
                  <RecordHistoryItem event={e} variant="row" />
                </chakra.li>
              ))}
            </chakra.ul>
          </chakra.li>
        ))}
      </chakra.ol>
    );
  }

  return (
    <Box
      as="section"
      aria-labelledby={titleId}
      display="flex"
      flexDirection="column"
      gap="3.5"
      minW="0"
      {...(framed && {
        bg: "bg.panel",
        borderWidth: "1px",
        borderColor: "border",
        borderRadius: "l3",
        boxShadow: "xs",
        p: { base: "4", md: "5" },
      })}
      {...rest}
    >
      <Flex justify="space-between" align="center" gap="2" wrap="wrap">
        <Heading id={titleId} as={headingAs} textStyle="heading.sm" color="fg.heading">
          {title}
        </Heading>
        {!hideFilter && (
          <Box w={{ base: "full", sm: "180px" }}>
            <NativeSelectField
              label="Tipo de evento"
              hideLabel
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value as HistoryFilter)}
              options={[
                { value: "todos", label: "Todos os eventos" },
                ...eventTypes.map((t) => ({ value: t, label: HISTORY_EVENT_TYPES[t].label })),
              ]}
            />
          </Box>
        )}
      </Flex>

      {body}

      {hasMore && !loading && groups.length > 0 && (
        <Button
          variant="outline"
          size="md"
          alignSelf="flex-start"
          onClick={onLoadMore}
          loading={loadingMore}
          loadingText="Carregando…"
        >
          Carregar eventos anteriores
        </Button>
      )}
    </Box>
  );
}
