"use client";

import { useState } from "react";
import { ImageGallery } from "@/components/files";
import { RecordHistory } from "@/components/history";
import {
  AreaCard,
  AreaDetails,
  AreaMeasurementDisplay,
  AreaMeasurementFields,
  type AreaMeasurementValue,
  AreaOverview,
  AreaPlantingList,
  AreaSelector,
  AreaUnitMap,
} from "@/modules/areas";
import type { CultivationUnit } from "@/modules/types";
import { AREAS, HISTORY, IMAGES, NOW, PLANTINGS } from "../fixtures";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const A03 = AREAS[1];

const UNITS: CultivationUnit[] = [
  { id: "u-1", areaId: "ar-03", type: "canteiro", name: "Canteiro 1", code: "C1", length: 120, width: 30, x: 0, y: 0 },
  { id: "u-2", areaId: "ar-03", type: "canteiro", name: "Canteiro 2", code: "C2", length: 120, width: 30, x: 0, y: 40 },
  {
    id: "u-3",
    areaId: "ar-03",
    type: "talhao",
    name: "Talhão leste",
    code: "T1",
    length: 150,
    width: 80,
    x: 150,
    y: 0,
  },
  { id: "u-4", areaId: "ar-03", type: "outro", name: "Viveiro", code: "V", length: 10, width: 10 },
];

export function AreasSection() {
  const [areaId, setAreaId] = useState<string | null>(A03.id);
  const [measure, setMeasure] = useState<AreaMeasurementValue>({ length: "300", width: "80" });
  const [invalidMeasure, setInvalidMeasure] = useState<AreaMeasurementValue>({ length: "300", width: "0" });
  const widthError =
    Number(invalidMeasure.width.replace(",", ".")) > 0 ? undefined : "Informe uma largura maior que 0.";

  return (
    <ShowcaseSection
      id="areas"
      title="Áreas"
      description="Módulo 6.3: seleção, dimensões (modelo inicial retangular), área calculada e plantios associados."
    >
      <Demo
        name="AreaSelector"
        importPath="@/modules/areas"
        description="Cada opção mostra código, nome, tamanho e se já há plantio em campo."
      >
        <VariantGrid>
          <Variant label="Com valor">
            <AreaSelector label="Área" required areas={AREAS} value={areaId} onChange={(id) => setAreaId(id)} />
          </Variant>
          <Variant label="Só áreas sem plantio em campo (isAreaDisabled)">
            <AreaSelector
              label="Área"
              areas={AREAS}
              value={null}
              isAreaDisabled={(a) => (a.activePlantings ?? 0) > 0}
            />
          </Variant>
          <Variant label="Erro">
            <AreaSelector label="Área" required areas={AREAS} value={null} errorText="Escolha a área do plantio." />
          </Variant>
          <Variant label="Desabilitado">
            <AreaSelector label="Área" areas={AREAS} value={A03.id} disabled />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AreaCard" importPath="@/modules/areas">
        <VariantGrid min="240px">
          {AREAS.map((a) => (
            <AreaCard headingAs="h4" key={a.id} area={a} href={`#area-${a.code}`} />
          ))}
        </VariantGrid>
      </Demo>

      <Demo
        name="AreaMeasurementFields"
        importPath="@/modules/areas"
        description="Resultado recalculado enquanto digita e anunciado a leitores de tela."
      >
        <VariantGrid min="360px">
          <Variant label="Válido">
            <AreaMeasurementFields value={measure} onChange={(v) => setMeasure(v)} idPrefix="demo-area" />
          </Variant>
          <Variant label="Com erro">
            <AreaMeasurementFields
              value={invalidMeasure}
              onChange={(v) => setInvalidMeasure(v)}
              errors={{ width: widthError }}
              idPrefix="demo-area-erro"
            />
          </Variant>
          <Variant label="Desabilitado">
            <AreaMeasurementFields
              value={{ length: "200", width: "200" }}
              onChange={() => undefined}
              disabled
              idPrefix="demo-area-off"
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="AreaMeasurementDisplay"
        importPath="@/modules/areas"
        description="Proporção real entre comprimento e largura, com cotas em texto."
      >
        <Row align="flex-start" gap="8">
          <Variant label="md · 300 × 80 m">
            <AreaMeasurementDisplay length={300} width={80} showArea />
          </Variant>
          <Variant label="md · 200 × 200 m">
            <AreaMeasurementDisplay length={200} width={200} showArea />
          </Variant>
          <Variant label="sm">
            <AreaMeasurementDisplay length={300} width={80} size="sm" />
          </Variant>
          <Variant label="Medidas inválidas">
            <AreaMeasurementDisplay length={0} width={80} />
          </Variant>
        </Row>
      </Demo>

      <Demo
        name="AreaUnitMap"
        importPath="@/modules/areas"
        description="Área em escala com as unidades de cultivo posicionadas e rotuladas. O rascunho tracejado mostra a unidade em edição; se não couber, fica em erro com o motivo em texto."
      >
        <VariantGrid min="360px">
          <Variant label="Unidades posicionadas (1 sem posição)">
            <AreaUnitMap length={300} width={80} units={UNITS} />
          </Variant>
          <Variant label="Rascunho que cabe">
            <AreaUnitMap
              length={300}
              width={80}
              units={UNITS}
              draft={{ length: 20, width: 30, x: 125, y: 0, label: "C3" }}
            />
          </Variant>
          <Variant label="Rascunho sobreposto">
            <AreaUnitMap
              length={300}
              width={80}
              units={UNITS}
              draft={{ length: 40, width: 30, x: 100, y: 10, label: "C3", problem: "Sobrepõe a unidade T1." }}
            />
          </Variant>
          <Variant label="Sem medidas">
            <AreaUnitMap length={0} width={0} units={[]} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AreaOverview" importPath="@/modules/areas">
        <AreaOverview headingAs="h4" area={A03} stats={{ plantings: 1, plants: 480 }} onEdit={() => undefined} />
      </Demo>

      <Demo
        name="AreaPlantingList"
        importPath="@/modules/areas"
        description="A ação de criar plantio já leva a área preenchida."
      >
        <VariantGrid min="360px">
          <Variant label="Só ativos" p="0" bg="transparent" borderWidth="0">
            <AreaPlantingList
              headingAs="h4"
              areaId={A03.id}
              plantings={PLANTINGS}
              getPlantingHref={(p) => `#${p.code}`}
            />
          </Variant>
          <Variant label="Com encerrados · sem permissão de criar" p="0" bg="transparent" borderWidth="0">
            <AreaPlantingList headingAs="h4" areaId={A03.id} plantings={PLANTINGS} defaultShowClosed hideCreate />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AreaDetails" importPath="@/modules/areas" description="Composição da página de detalhes em abas.">
        <AreaDetails
          headingAs="h2"
          area={A03}
          plantings={PLANTINGS}
          stats={{ plantings: 1, plants: 480 }}
          editHref="#editar-area"
          imageCount={IMAGES.length}
          images={<ImageGallery headingAs="h4" images={IMAGES} columns={4} maxVisible={6} bare title={null} />}
          history={<RecordHistory headingAs="h4" events={HISTORY} now={NOW} framed={false} />}
        />
      </Demo>
    </ShowcaseSection>
  );
}
