"use client";

import { Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  PlantingAreaSelector,
  PlantingCultivarSelector,
  PlantingDetails,
  PlantingForm,
  PlantingSpeciesSelector,
  PlantingStatus,
  PlantingSummary,
  PlantingTimeline,
  type PlantingTimelineFilter,
} from "@/modules/plantings";
import type { PlantingStatus as PlantingStatusValue, PlantingSummary as PlantingSummaryData } from "@/modules/types";
import { AREAS, BATCHES, CULTIVARS, HISTORY, PLANTING, PLANTINGS, SPECIES } from "../fixtures";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const STATUSES: PlantingStatusValue[] = ["planejado", "implantado", "em_desenvolvimento", "colhido", "encerrado", "cancelado"];

/** Transições permitidas por status (na aplicação, vêm da API). */
const TRANSITIONS: Record<PlantingStatusValue, PlantingStatusValue[]> = {
  planejado: ["implantado", "cancelado"],
  implantado: ["em_desenvolvimento", "cancelado"],
  em_desenvolvimento: ["colhido", "encerrado"],
  colhido: ["em_desenvolvimento", "encerrado"],
  encerrado: [],
  cancelado: [],
};

const SEED_PLANTING: PlantingSummaryData = {
  id: "pl-0043",
  code: "PL-0043",
  status: "implantado",
  species: { id: "sp-maracuja", name: "Maracujá", scientificName: "Passiflora edulis" },
  cultivar: null,
  area: { id: "ar-05", code: "A-05", name: "Encosta" },
  plantedAt: "2026-12-02",
  plants: 0,
  origin: { type: "sementes", batchId: "sm-004", batchCode: "SM-2026-004" },
};

const ENCERRADO = PLANTINGS[1];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface SelectorsDemoValues {
  speciesId: string | null;
  cultivarId: string | null;
  areaId: string | null;
}

/** Os três seletores ligados a um useForm: trocar a espécie limpa a cultivar e mostra o aviso. */
function FormBoundSelectorsDemo() {
  const { control } = useForm<SelectorsDemoValues>({
    defaultValues: { speciesId: "sp-manga", cultivarId: "cv-tommy", areaId: "ar-03" },
  });
  const [speciesId, cultivarId, areaId] = useWatch({ control, name: ["speciesId", "cultivarId", "areaId"] });
  const speciesName = SPECIES.find((s) => s.id === speciesId)?.name;

  return (
    <Stack gap="4" maxW="440px">
      <PlantingSpeciesSelector<SelectorsDemoValues> name="speciesId" control={control} species={SPECIES} label="Espécie" required />
      <PlantingCultivarSelector<SelectorsDemoValues>
        name="cultivarId"
        control={control}
        speciesId={speciesId}
        speciesName={speciesName}
        cultivars={CULTIVARS}
        label="Cultivar"
      />
      <PlantingAreaSelector<SelectorsDemoValues> name="areaId" control={control} areas={AREAS} label="Área" required />
      <Text textStyle="caption" color="fg.muted">
        Valores do formulário: espécie {speciesId ?? "—"} · cultivar {cultivarId ?? "—"} · área {areaId ?? "—"}
      </Text>
    </Stack>
  );
}

export function PlantiosSection() {
  const [status, setStatus] = useState<PlantingStatusValue>("implantado");
  const [filter, setFilter] = useState<PlantingTimelineFilter>("todos");
  const [log, setLog] = useState("Nenhum envio ainda.");

  return (
    <ShowcaseSection
      id="plantios"
      title="Plantios"
      description="Componentes do módulo 6.4 (src/modules/plantings). Os seletores reaproveitam os do catálogo, de áreas e de mudas, ligados ao formulário por react-hook-form."
    >
      <Demo
        name="PlantingStatus"
        importPath="@/modules/plantings"
        description="Badge com menu “Alterar status” limitado às transições permitidas; steps mostra o ciclo. Cancelado fica fora do fluxo e aparece só como badge."
      >
        <VariantGrid min="300px">
          <Variant label="badge · sem menu (cada status)">
            <Row>
              {STATUSES.map((s) => (
                <PlantingStatus key={s} status={s} />
              ))}
            </Row>
          </Variant>
          <Variant label="badge · size sm">
            <Row>
              {STATUSES.map((s) => (
                <PlantingStatus key={s} status={s} size="sm" />
              ))}
            </Row>
          </Variant>
          <Variant label="badge · com menu (controlado)">
            <Stack gap="2">
              <PlantingStatus
                status={status}
                plantingCode="PL-0042"
                allowedTransitions={TRANSITIONS[status]}
                onChange={setStatus}
              />
              <Text textStyle="caption" color="fg.muted">
                {TRANSITIONS[status].length
                  ? "Escolha uma transição no menu."
                  : "Sem transições a partir deste status: o menu some."}
              </Text>
            </Stack>
          </Variant>
        </VariantGrid>
        <VariantGrid min="420px">
          {STATUSES.map((s) => (
            <Variant key={s} label={`steps · ${s}`}>
              <PlantingStatus status={s} variant="steps" />
            </Variant>
          ))}
        </VariantGrid>
      </Demo>

      <Demo
        name="PlantingSummary"
        importPath="@/modules/plantings"
        description="Card de resumo: código, status, espécie · cultivar, área e data, plantas e origem. Com href, o card inteiro vira um link."
      >
        <VariantGrid min="320px">
          <Variant label="padrão">
            <PlantingSummary headingAs="h4" planting={PLANTING} />
          </Variant>
          <Variant label="href (card como link)">
            <PlantingSummary headingAs="h4" planting={PLANTING} href="#plantios" />
          </Variant>
          <Variant label="compact">
            <PlantingSummary headingAs="h4" planting={PLANTING} compact href="#plantios" />
          </Variant>
          <Variant label="origem em sementes · sem cultivar">
            <PlantingSummary headingAs="h4" planting={SEED_PLANTING} />
          </Variant>
          <Variant label="encerrado">
            <PlantingSummary headingAs="h4" planting={ENCERRADO} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="PlantingDetails" importPath="@/modules/plantings" description="RecordDetails do plantio, com links para espécie, área e lote.">
        <VariantGrid min="420px">
          <Variant label="2 colunas · onEdit">
            <PlantingDetails headingAs="h4"
              planting={PLANTING}
              onEdit={() => setLog("Editar PL-0042")}
              speciesHref={(id) => `#especie-${id}`}
              areaHref={(id) => `#area-${id}`}
              batchHref={(id) => `#lote-${id}`}
            />
          </Variant>
          <Variant label="1 coluna · editHref · título próprio">
            <PlantingDetails headingAs="h4" planting={PLANTING} columns={1} title="Resumo do plantio" editHref="#plantios" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="PlantingSpeciesSelector · PlantingCultivarSelector · PlantingAreaSelector"
        importPath="@/modules/plantings"
        description="Ligados ao useForm por Controller. Troque a espécie para Caju: a cultivar é limpa e um aviso explica por quê. A área mostra o resumo de medidas."
      >
        <Variant label="useForm · espécie, cultivar e área">
          <FormBoundSelectorsDemo />
        </Variant>
      </Demo>

      <Demo
        name="PlantingForm"
        importPath="@/modules/plantings"
        description="Cinco seções numeradas, resumo de erros após o envio e chave de idempotência mantida entre tentativas. O botão fica desabilitado durante o envio."
      >
        <Text textStyle="caption" color="fg.muted" aria-live="polite">
          Último envio: {log}
        </Text>
        <Stack gap="6">
          <Variant label="create · envio simulado (1,2 s)">
            <PlantingForm
              mode="create"
              species={SPECIES}
              cultivars={CULTIVARS}
              areas={AREAS}
              batches={BATCHES}
              onSubmit={async (values, meta) => {
                await wait(1200);
                setLog(`${values.plantsValue} plantas salvas · chave ${meta.idempotencyKey.slice(0, 8)}…`);
              }}
              onCancel={() => setLog("Cancelado")}
            />
          </Variant>
          <Variant label="create · falha no envio (mostra o alerta de erro)">
            <PlantingForm
              mode="create"
              defaultValues={{
                speciesId: "sp-manga",
                cultivarId: "cv-tommy",
                areaId: "ar-07",
                originType: "mudas",
                batchId: "lm-014",
                plants: "20",
                plantedAt: "2026-11-21",
                control: "agrupado",
              }}
              species={SPECIES}
              cultivars={CULTIVARS}
              areas={AREAS}
              batches={BATCHES}
              onSubmit={async (_values, meta) => {
                await wait(1200);
                setLog(`Falha simulada · chave ${meta.idempotencyKey.slice(0, 8)}… mantida para nova tentativa`);
                throw new Error("Não foi possível salvar o plantio. Tente de novo em instantes.");
              }}
            />
          </Variant>
          <Variant label="edit · chega preenchido">
            <PlantingForm
              mode="edit"
              defaultValues={{
                speciesId: "sp-manga",
                cultivarId: "cv-tommy",
                areaId: "ar-03",
                originType: "mudas",
                batchId: "lm-014",
                plants: "480",
                plantedAt: "2026-03-12",
                control: "misto",
                notes: "Linhas 1 a 8 em controle agrupado; matrizes registradas individualmente.",
              }}
              species={SPECIES}
              cultivars={CULTIVARS}
              areas={AREAS}
              batches={BATCHES}
              onSubmit={async () => {
                await wait(1200);
                setLog("Alterações de PL-0042 salvas");
              }}
              onCancel={() => setLog("Edição cancelada")}
            />
          </Variant>
        </Stack>
      </Demo>

      <Demo
        name="PlantingTimeline"
        importPath="@/modules/plantings"
        description="ActivityTimeline do plantio com filtro por tipo de evento (SegmentedControl)."
      >
        <VariantGrid min="360px">
          <Variant label="filtro controlado">
            <PlantingTimeline plantingId="pl-0042" events={HISTORY} filter={filter} onFilterChange={setFilter} />
          </Variant>
          <Variant label="maxItems 2 · ver tudo">
            <PlantingTimeline events={HISTORY} maxItems={2} onSeeAll={() => setLog("Ver todo o histórico")} />
          </Variant>
          <Variant label="filtro inicial Arquivos">
            <PlantingTimeline events={HISTORY} defaultFilter="arquivos" />
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
