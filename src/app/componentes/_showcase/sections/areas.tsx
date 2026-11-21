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
} from "@/modules/areas";
import { AREAS, HISTORY, IMAGES, NOW, PLANTINGS } from "../fixtures";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const A03 = AREAS[1];

export function AreasSection() {
  const [areaId, setAreaId] = useState<string | null>(A03.id);
  const [measure, setMeasure] = useState<AreaMeasurementValue>({ length: "300", width: "80" });
  const [invalidMeasure, setInvalidMeasure] = useState<AreaMeasurementValue>({ length: "300", width: "0" });
  const widthError = Number(invalidMeasure.width.replace(",", ".")) > 0 ? undefined : "Informe uma largura maior que 0.";

  return (
    <ShowcaseSection
      id="areas"
      title="Áreas"
      description="Módulo 6.3: seleção, dimensões (modelo inicial retangular), área calculada e plantios associados."
    >
      <Demo name="AreaSelector" importPath="@/modules/areas" description="Cada opção mostra código, nome, tamanho e se já há plantio ativo.">
        <VariantGrid>
          <Variant label="Com valor">
            <AreaSelector label="Área" required areas={AREAS} value={areaId} onChange={(id) => setAreaId(id)} />
          </Variant>
          <Variant label="Só áreas sem plantio ativo (isAreaDisabled)">
            <AreaSelector label="Área" areas={AREAS} value={null} isAreaDisabled={(a) => (a.activePlantings ?? 0) > 0} />
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

      <Demo name="AreaMeasurementFields" importPath="@/modules/areas" description="Resultado recalculado enquanto digita e anunciado a leitores de tela.">
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
            <AreaMeasurementFields value={{ length: "200", width: "200" }} onChange={() => undefined} disabled idPrefix="demo-area-off" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AreaMeasurementDisplay" importPath="@/modules/areas" description="Proporção real entre comprimento e largura, com cotas em texto.">
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

      <Demo name="AreaOverview" importPath="@/modules/areas">
        <AreaOverview headingAs="h4" area={A03} stats={{ plantings: 1, plants: 480 }} onEdit={() => undefined} />
      </Demo>

      <Demo name="AreaPlantingList" importPath="@/modules/areas" description="A ação de criar plantio já leva a área preenchida.">
        <VariantGrid min="360px">
          <Variant label="Só ativos" p="0" bg="transparent" borderWidth="0">
            <AreaPlantingList headingAs="h4" areaId={A03.id} plantings={PLANTINGS} getPlantingHref={(p) => `#${p.code}`} />
          </Variant>
          <Variant label="Com encerrados · sem permissão de criar" p="0" bg="transparent" borderWidth="0">
            <AreaPlantingList headingAs="h4" areaId={A03.id} plantings={PLANTINGS} defaultShowClosed hideCreate />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AreaDetails" importPath="@/modules/areas" description="Composição da página de detalhes em abas.">
        <AreaDetails headingAs="h2"
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
