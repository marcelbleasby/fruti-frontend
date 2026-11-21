"use client";

import { Text } from "@chakra-ui/react";
import { useState } from "react";
import { PlantCountDisplay, PlantDetails, PlantForm, PlantGroupCard, PlantSummary } from "@/modules/plants";
import type { Plant } from "@/modules/types";
import { HISTORY, IMAGES, PLANT, PLANT_GROUPS } from "../fixtures";
import { Demo, ShowcaseSection, Variant, VariantGrid } from "../showcase";

/** Miniatura sem texto: em 56 px qualquer legenda dentro da imagem fica ilegível. */
const THUMB =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="#bbf7d0"/><circle cx="56" cy="70" r="30" fill="#15803d"/><path d="M56 40c0-14 10-24 24-26-2 14-10 24-24 26z" fill="#166534"/></svg>',
  );
const PLANT_WITH_THUMB: Plant = { ...PLANT, thumbnailUrl: THUMB };

const PLANT_NO_POSITION: Plant = {
  id: "pt-m12",
  code: "M-12",
  label: "Planta de observação",
  plantingCode: "PL-0041",
  createdAt: "2026-10-02",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function PlantasSection() {
  const [log, setLog] = useState("Nenhuma ação ainda.");

  return (
    <ShowcaseSection
      id="plantas"
      title="Plantas"
      description="Componentes do módulo 6.5 (src/modules/plants): controle individual, agrupado ou misto das plantas de um plantio."
    >
      <Text textStyle="caption" color="fg.muted" aria-live="polite">
        Última ação: {log}
      </Text>

      <Demo
        name="PlantCountDisplay"
        importPath="@/modules/plants"
        description="Total com barra segmentada (grupos em verde, individuais em ouro) e legenda com números escritos: a divisão não depende só da cor."
      >
        <VariantGrid min="320px">
          <Variant label="misto · 448 em grupos + 32 individuais">
            <PlantCountDisplay total={480} grouped={448} individual={32} groups={2} />
          </Variant>
          <Variant label="só grupos">
            <PlantCountDisplay total={620} grouped={620} individual={0} groups={3} />
          </Variant>
          <Variant label="com plantas sem registro">
            <PlantCountDisplay total={480} grouped={224} individual={12} groups={1} />
          </Variant>
          <Variant label="surface none">
            <PlantCountDisplay total={480} grouped={448} individual={32} groups={2} surface="none" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="PlantGroupCard" importPath="@/modules/plants" description="Grupo de plantas com badge “Grupo” e menu de ações.">
        <VariantGrid min="300px">
          <Variant label="com Editar e Dividir">
            <PlantGroupCard headingAs="h4"
              group={PLANT_GROUPS[0]}
              onEdit={() => setLog(`Editar ${PLANT_GROUPS[0].code}`)}
              onSplit={() => setLog(`Dividir ${PLANT_GROUPS[0].code}`)}
            />
          </Variant>
          <Variant label="só Editar">
            <PlantGroupCard headingAs="h4" group={PLANT_GROUPS[1]} onEdit={() => setLog(`Editar ${PLANT_GROUPS[1].code}`)} />
          </Variant>
          <Variant label="sem ações">
            <PlantGroupCard headingAs="h4" group={PLANT_GROUPS[1]} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="PlantSummary" importPath="@/modules/plants" description="Planta individual: miniatura, identificação, papel, linha e posição.">
        <VariantGrid min="320px">
          <Variant label="com miniatura · href">
            <PlantSummary plant={PLANT_WITH_THUMB} href="#plantas" />
          </Variant>
          <Variant label="sem miniatura">
            <PlantSummary plant={PLANT} />
          </Variant>
          <Variant label="sem linha/posição">
            <PlantSummary plant={PLANT_NO_POSITION} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="PlantDetails"
        importPath="@/modules/plants"
        description="RecordDetails da planta, galeria compacta com “Adicionar” e histórico."
      >
        <VariantGrid min="420px">
          <Variant label="imagens + histórico">
            <PlantDetails
              plant={PLANT}
              images={IMAGES}
              history={HISTORY}
              plantingHref="#plantios"
              onEdit={() => setLog("Editar M-07")}
              onAddImage={() => setLog("Adicionar imagem a M-07")}
              onOpenImage={(i) => setLog(`Abrir imagem ${i + 1} de ${IMAGES.length}`)}
            />
          </Variant>
          <Variant label="sem imagens nem histórico">
            <PlantDetails plant={PLANT_NO_POSITION} editHref="#plantas" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="PlantForm"
        importPath="@/modules/plants"
        description="Controle misto: o mesmo formulário registra um grupo ou uma planta individual. A quantidade do grupo é limitada às plantas sem registro."
      >
        <VariantGrid min="360px">
          <Variant label="modo grupo">
            <PlantForm
              plantingId="pl-0042"
              plantingCode="PL-0042"
              remaining={32}
              onSubmit={async (values) => {
                await wait(1000);
                setLog(`Grupo “${values.name}” com ${values.quantityValue} plantas registrado`);
              }}
              onCancel={() => setLog("Registro cancelado")}
            />
          </Variant>
          <Variant label="modo individual">
            <PlantForm
              plantingId="pl-0042"
              plantingCode="PL-0042"
              remaining={32}
              defaultMode="individual"
              defaultValues={{ code: "M-08", label: "Matriz", row: "3", position: "15" }}
              onSubmit={async (values) => {
                await wait(1000);
                setLog(`Planta ${values.code} registrada na linha ${values.rowValue ?? "—"}`);
              }}
            />
          </Variant>
          <Variant label="lockMode · só grupo">
            <PlantForm
              plantingId="pl-0041"
              plantingCode="PL-0041"
              remaining={620}
              lockMode
              onSubmit={async (values) => {
                await wait(1000);
                setLog(`Grupo com ${values.quantityValue} plantas registrado em PL-0041`);
              }}
            />
          </Variant>
        </VariantGrid>
      </Demo>

    </ShowcaseSection>
  );
}
