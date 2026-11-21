"use client";

import { Portal, Select as ChakraSelect, chakra, createListCollection, type SelectRootProps } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { StatusBadge } from "@/components/data-display/status-badge";
import { FormField } from "@/components/forms/form-field";
import { listContentStyles, listItemStyles, triggerStyles } from "@/components/forms/styles";
import type { FieldBaseProps } from "@/components/forms/types";
import { formatNumber } from "@/modules/format";
import type { BatchId, SeedlingBatch, SeedlingOriginType, SpeciesId } from "@/modules/types";
import { batchAvailable, batchMaterialLabel, batchUnit, DEFAULT_LOW_THRESHOLD, getBatchStatus, quantityWords } from "../utils";

export interface SeedlingBatchSelectorProps extends FieldBaseProps {
  batches: SeedlingBatch[];
  /** Mostra só lotes deste tipo. */
  type?: SeedlingOriginType;
  /** Mostra só lotes desta espécie. */
  speciesId?: SpeciesId | null;
  /** Lotes com menos que isso disponível ficam desabilitados (padrão 1: esgotados). */
  minAvailable?: number;
  value?: BatchId | null;
  onChange?: (value: BatchId | null, batch: SeedlingBatch | undefined) => void;
  placeholder?: string;
  name?: string;
  lowThreshold?: number;
  portalled?: boolean;
  positioning?: SelectRootProps["positioning"];
}

const mono = { fontFamily: "mono", fontVariantLigatures: "none", fontWeight: "500", color: "fg.heading" } as const;

/**
 * SeedlingBatchSelector — escolha do lote de origem. Lotes sem quantidade suficiente
 * aparecem desabilitados (não somem), com o status ao lado.
 * Chakra v3: Select.Root · Select.Item (disabled) · StatusBadge.
 */
export function SeedlingBatchSelector(props: SeedlingBatchSelectorProps) {
  const {
    batches,
    type,
    speciesId,
    minAvailable = 1,
    value,
    onChange,
    placeholder = "Selecione o lote",
    name,
    lowThreshold = DEFAULT_LOW_THRESHOLD,
    portalled = true,
    positioning,
    ...fieldProps
  } = props;

  const items = useMemo(
    () => batches.filter((b) => (!type || b.type === type) && (!speciesId || b.species.id === speciesId)),
    [batches, type, speciesId],
  );

  const collection = useMemo(
    () =>
      createListCollection<SeedlingBatch>({
        items,
        itemToString: (b) => b.code,
        itemToValue: (b) => b.id,
        isItemDisabled: (b) => batchAvailable(b) < minAvailable,
      }),
    [items, minAvailable],
  );

  return (
    <FormField {...fieldProps}>
      <ChakraSelect.Root
        collection={collection}
        value={value === undefined ? undefined : value ? [value] : []}
        onValueChange={onChange ? (d) => onChange(d.value[0] ?? null, d.items[0]) : undefined}
        name={name}
        positioning={{ sameWidth: true, gutter: 4, ...positioning }}
        width="full"
      >
        <ChakraSelect.HiddenSelect />
        <ChakraSelect.Control>
          <ChakraSelect.Trigger css={triggerStyles} pe="10">
            <ChakraSelect.Context>
              {(api) => {
                const selected = api.selectedItems[0] as SeedlingBatch | undefined;
                return selected ? (
                  <chakra.span css={mono} fontSize="md">
                    {selected.code}
                  </chakra.span>
                ) : (
                  <chakra.span color="fg.muted">{placeholder}</chakra.span>
                );
              }}
            </ChakraSelect.Context>
          </ChakraSelect.Trigger>
          <ChakraSelect.IndicatorGroup pe="1">
            <ChakraSelect.Indicator color="fg.muted">
              <ChevronDown size={20} strokeWidth={1.75} />
            </ChakraSelect.Indicator>
          </ChakraSelect.IndicatorGroup>
        </ChakraSelect.Control>
        <Portal disabled={!portalled}>
          <ChakraSelect.Positioner>
            <ChakraSelect.Content css={listContentStyles}>
              {collection.items.length === 0 && (
                <chakra.p px="2.5" py="2" textStyle="body.sm" color="fg.muted">
                  Nenhum lote disponível para este filtro.
                </chakra.p>
              )}
              {collection.items.map((batch) => {
                const available = batchAvailable(batch);
                const words = quantityWords(available, batchUnit(batch));
                // Desabilitado sem estar esgotado (ex.: `minAvailable` maior que o saldo): diz o porquê.
                const short = available > 0 && available < minAvailable;
                return (
                  <ChakraSelect.Item key={batch.id} item={batch} css={listItemStyles} minH="52px" justifyContent="space-between">
                    <chakra.span flex="1" minW="0" display="flex" flexDirection="column" gap="0.5">
                      <ChakraSelect.ItemText css={mono} fontSize="sm">
                        {batch.code}
                      </ChakraSelect.ItemText>
                      <chakra.span textStyle="caption" fontWeight="400" color="fg.muted">
                        {batchMaterialLabel(batch)} · {words.value} {words.available}
                        {short && ` · menos que o mínimo de ${formatNumber(minAvailable)}`}
                      </chakra.span>
                    </chakra.span>
                    <StatusBadge status={getBatchStatus(batch, lowThreshold)} size="sm" flexShrink={0} />
                  </ChakraSelect.Item>
                );
              })}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
    </FormField>
  );
}
