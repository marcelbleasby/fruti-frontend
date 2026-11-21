"use client";

import { Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import {
  SeedlingAvailability,
  SeedlingBatchCard,
  SeedlingBatchSelector,
  SeedlingForm,
  SeedlingOriginDisplay,
  SeedlingOriginSelector,
} from "@/modules/seedlings";
import type { SeedlingOriginType } from "@/modules/types";
import { BATCHES, CULTIVARS, SPECIES_OPTIONS } from "../fixtures";
import { Demo, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const cultivarOptions = (speciesId: string) =>
  CULTIVARS.filter((c) => c.speciesId === speciesId).map((c) => ({ value: c.id, label: c.name, description: c.origin }));

const batchHref = (id: string) => `#lote-${id}`;

export function MudasSection() {
  const [origin, setOrigin] = useState<SeedlingOriginType>("mudas");
  const [batchId, setBatchId] = useState<string | null>("lm-014");
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <ShowcaseSection
      id="mudas"
      title="Sementes e mudas"
      description="Módulo 6.6: origem do material vegetal, lotes e disponibilidade. Estoque baixo abaixo de 10% do recebido."
    >
      <Demo name="SeedlingOriginSelector" importPath="@/modules/seedlings">
        <VariantGrid min="360px">
          <Variant label="Controlado">
            <SeedlingOriginSelector label="Tipo de material" required value={origin} onChange={setOrigin} />
          </Variant>
          <Variant label="Desabilitado">
            <SeedlingOriginSelector label="Tipo de material" value="sementes" disabled />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SeedlingBatchSelector" importPath="@/modules/seedlings" description="Lotes esgotados aparecem desabilitados (não somem).">
        <VariantGrid>
          <Variant label="Com valor">
            <SeedlingBatchSelector label="Lote" required batches={BATCHES} type="mudas" value={batchId} onChange={(id) => setBatchId(id)} />
          </Variant>
          <Variant label="minAvailable 100">
            <SeedlingBatchSelector label="Lote" batches={BATCHES} minAvailable={100} value={null} helperText="Lotes com menos de 100 mudas ficam indisponíveis." />
          </Variant>
          <Variant label="Erro">
            <SeedlingBatchSelector label="Lote" required batches={BATCHES} value={null} errorText="Escolha o lote de origem." />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SeedlingAvailability" importPath="@/modules/seedlings" description="Números escritos acompanham a barra.">
        <VariantGrid>
          <Variant label="Disponível">
            <SeedlingAvailability total={400} used={20} />
          </Variant>
          <Variant label="Estoque baixo">
            <SeedlingAvailability total={500} used={480} />
          </Variant>
          <Variant label="Esgotado">
            <SeedlingAvailability total={350} used={350} />
          </Variant>
          <Variant label="Sementes · unidade g">
            <SeedlingAvailability total={1200} used={300} unit="g" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SeedlingBatchCard" importPath="@/modules/seedlings">
        <VariantGrid min="300px">
          {BATCHES.map((b) => (
            <SeedlingBatchCard key={b.id} batch={b} href={batchHref(b.id)} />
          ))}
        </VariantGrid>
      </Demo>

      <Demo name="SeedlingOriginDisplay" importPath="@/modules/seedlings">
        <Variant label="Mudas · sementes · não informada">
          <Stack gap="3">
            <SeedlingOriginDisplay origin={{ type: "mudas", batchId: "lm-014", batchCode: "LM-2026-014" }} batchHref={batchHref} />
            <SeedlingOriginDisplay origin={{ type: "sementes", batchId: "sm-004", batchCode: "SM-2026-004" }} batchHref={batchHref} />
            <SeedlingOriginDisplay origin={{ type: "mudas", batchCode: "LM-2026-016" }} linkToBatch={false} />
            <SeedlingOriginDisplay origin={null} />
          </Stack>
        </Variant>
      </Demo>

      <Demo name="SeedlingForm" importPath="@/modules/seedlings" description="Começa pela origem; para sementes, a unidade da quantidade muda conforme o lote.">
        <VariantGrid min="420px">
          <Variant label="mode create">
            <SeedlingForm
              speciesOptions={SPECIES_OPTIONS}
              getCultivarOptions={cultivarOptions}
              onSubmit={async (v) => {
                await new Promise((r) => setTimeout(r, 800));
                setSaved(`${v.quantityValue} ${v.unit} salvas (simulado)`);
              }}
              onCancel={() => setSaved(null)}
            />
            {saved && (
              <Text mt="3" textStyle="body.sm" color="fg.success" role="status">
                {saved}
              </Text>
            )}
          </Variant>
          <Variant label="mode edit">
            <SeedlingForm
              mode="edit"
              usedQuantity={480}
              defaultValues={{
                type: "mudas",
                code: "LM-2026-014",
                speciesId: "sp-manga",
                cultivarId: "cv-tommy",
                quantity: "500",
                unit: "mudas",
                receivedAt: "2026-03-05",
                supplier: "Viveiro Vale do São Francisco",
              }}
              speciesOptions={SPECIES_OPTIONS}
              getCultivarOptions={cultivarOptions}
              onSubmit={() => undefined}
            />
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
