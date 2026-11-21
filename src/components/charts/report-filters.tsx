"use client";

import { Box, Button, Flex, Stack, type StackProps } from "@chakra-ui/react";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Tag } from "@/components/data-display/tag";
import { DateRangePicker, type DateRangeValue } from "@/components/forms/date-range-picker";
import { formatISODate } from "@/components/forms/date-utils";
import { NativeSelectField } from "@/components/forms/native-select-field";
import { SegmentedControl } from "@/components/forms/segmented-control";
import type { FieldOption } from "@/components/forms/types";

/** Período do relatório: 30 dias · 12 meses · safra · personalizado. */
export type ReportPeriod = "30d" | "12m" | "safra" | "custom";

export interface ReportFiltersValue {
  period: ReportPeriod;
  areaId?: string | null;
  speciesId?: string | null;
  /** Intervalo quando `period` é "custom". */
  range?: { start: string | null; end: string | null };
}

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, { segment: string; chip: string }> = {
  "30d": { segment: "30 dias", chip: "Últimos 30 dias" },
  "12m": { segment: "12 meses", chip: "Últimos 12 meses" },
  safra: { segment: "Safra", chip: "Safra atual" },
  custom: { segment: "Personalizado", chip: "Período personalizado" },
};

export const DEFAULT_REPORT_FILTERS: ReportFiltersValue = { period: "12m", areaId: null, speciesId: null };

export interface ReportFiltersProps extends Omit<StackProps, "onChange" | "defaultValue"> {
  value: ReportFiltersValue;
  onChange: (value: ReportFiltersValue) => void;
  areas?: FieldOption[];
  species?: FieldOption[];
  /** Valor de "Limpar" (padrão: 12 meses, todas as áreas e espécies). */
  defaultValue?: ReportFiltersValue;
  /** Esconde os chips de filtros aplicados. */
  hideChips?: boolean;
}

/**
 * ReportFilters — período (SegmentGroup), área e espécie (NativeSelect) e chips
 * removíveis dos filtros aplicados. Controlado; para manter na URL use
 * `useReportFiltersUrl` (o painel filtrado pode ser compartilhado e o voltar funciona).
 */
export function ReportFilters({
  value,
  onChange,
  areas = [],
  species = [],
  defaultValue = DEFAULT_REPORT_FILTERS,
  hideChips,
  ...rest
}: ReportFiltersProps) {
  const set = (patch: Partial<ReportFiltersValue>) => onChange({ ...value, ...patch });
  const areaLabel = areas.find((a) => a.value === value.areaId)?.label;
  const speciesLabel = species.find((s) => s.value === value.speciesId)?.label;

  const periodChip =
    value.period === "custom" && value.range?.start && value.range?.end
      ? `${formatISODate(value.range.start)} – ${formatISODate(value.range.end)}`
      : REPORT_PERIOD_LABELS[value.period].chip;

  const isDefault =
    value.period === defaultValue.period &&
    (value.areaId ?? null) === (defaultValue.areaId ?? null) &&
    (value.speciesId ?? null) === (defaultValue.speciesId ?? null);

  return (
    <Stack gap="3" {...rest}>
      <SegmentedControl
        label="Período"
        value={value.period}
        onValueChange={(p) => p && set({ period: p as ReportPeriod, range: p === "custom" ? value.range : undefined })}
        items={(Object.keys(REPORT_PERIOD_LABELS) as ReportPeriod[]).map((p) => ({
          value: p,
          label: REPORT_PERIOD_LABELS[p].segment,
        }))}
      />

      {value.period === "custom" && (
        <DateRangePicker
          label="Período personalizado"
          value={{ start: value.range?.start ?? null, end: value.range?.end ?? null }}
          onValueChange={(r: DateRangeValue) => set({ range: { start: r.start, end: r.end } })}
        />
      )}

      <Flex wrap="wrap" gap="2">
        <Box flex="1 1 128px" minW="0">
          <NativeSelectField
            label="Área"
            hideLabel
            placeholder="Área: todas"
            value={value.areaId ?? ""}
            onChange={(e) => set({ areaId: e.currentTarget.value || null })}
            options={areas.map((a) => ({ ...a, label: `Área: ${a.label}` }))}
          />
        </Box>
        <Box flex="1 1 128px" minW="0">
          <NativeSelectField
            label="Espécie"
            hideLabel
            placeholder="Espécie: todas"
            value={value.speciesId ?? ""}
            onChange={(e) => set({ speciesId: e.currentTarget.value || null })}
            options={species.map((s) => ({ ...s, label: `Espécie: ${s.label}` }))}
          />
        </Box>
      </Flex>

      {!hideChips && (
        <Flex wrap="wrap" gap="2" align="center" aria-label="Filtros aplicados" role="group">
          <Tag
            onRemove={value.period !== defaultValue.period ? () => set({ period: defaultValue.period, range: undefined }) : undefined}
            removeLabel="Remover filtro de período"
          >
            {periodChip}
          </Tag>
          {areaLabel && (
            <Tag onRemove={() => set({ areaId: null })} removeLabel={`Remover filtro Área: ${areaLabel}`}>
              Área: {areaLabel}
            </Tag>
          )}
          {speciesLabel && (
            <Tag onRemove={() => set({ speciesId: null })} removeLabel={`Remover filtro Espécie: ${speciesLabel}`}>
              Espécie: {speciesLabel}
            </Tag>
          )}
          {!isDefault && (
            <Button size="sm" variant="ghost" color="primary" onClick={() => onChange({ ...defaultValue })}>
              <X aria-hidden="true" strokeWidth={1.75} />
              Limpar
            </Button>
          )}
        </Flex>
      )}
    </Stack>
  );
}

const PERIODS = new Set<string>(Object.keys(REPORT_PERIOD_LABELS));

/**
 * Filtros do relatório guardados na URL (`?periodo=12m&area=…&especie=…&inicio=…&fim=…`).
 * Usa `useSearchParams`: envolva o componente que chama o hook em `<Suspense>`.
 */
export function useReportFiltersUrl(
  defaultValue: ReportFiltersValue = DEFAULT_REPORT_FILTERS,
): [ReportFiltersValue, (value: ReportFiltersValue) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<ReportFiltersValue>(() => {
    const period = searchParams.get("periodo");
    const start = searchParams.get("inicio");
    const end = searchParams.get("fim");
    return {
      period: period && PERIODS.has(period) ? (period as ReportPeriod) : defaultValue.period,
      areaId: searchParams.get("area") ?? defaultValue.areaId ?? null,
      speciesId: searchParams.get("especie") ?? defaultValue.speciesId ?? null,
      range: start || end ? { start, end } : defaultValue.range,
    };
  }, [searchParams, defaultValue]);

  const setValue = useCallback(
    (next: ReportFiltersValue) => {
      const params = new URLSearchParams(searchParams.toString());
      const put = (key: string, v: string | null | undefined, fallback?: string | null) => {
        if (v && v !== fallback) params.set(key, v);
        else params.delete(key);
      };
      put("periodo", next.period, defaultValue.period);
      put("area", next.areaId, defaultValue.areaId);
      put("especie", next.speciesId, defaultValue.speciesId);
      put("inicio", next.period === "custom" ? next.range?.start : null);
      put("fim", next.period === "custom" ? next.range?.end : null);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname, defaultValue],
  );

  return [value, setValue];
}
