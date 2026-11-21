"use client";

import { useState } from "react";
import { type HistoryFilter, RecordHistory, RecordHistoryItem } from "@/components/history";
import { HISTORY, NOW } from "../fixtures";
import { Demo, ShowcaseSection, Variant, VariantGrid } from "../showcase";

export function HistoricoSection() {
  const [filter, setFilter] = useState<HistoryFilter>("todos");
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => setLoadingMore(false), 1200);
  };

  return (
    <ShowcaseSection
      id="historico"
      title="Histórico e rastreabilidade"
      description="Registro de alterações por registro: quem fez, quando e o que mudou (antes e depois, com texto para leitores de tela)."
    >
      <Demo name="RecordHistoryItem" importPath="@/components/history">
        <VariantGrid min="340px">
          <Variant label="variant card · com alterações">
            <RecordHistoryItem event={HISTORY[1]} />
          </Variant>
          <Variant label="variant card · alterações recolhidas">
            <RecordHistoryItem event={HISTORY[1]} defaultOpen={false} />
          </Variant>
          <Variant label="variant row">
            <RecordHistoryItem event={HISTORY[0]} variant="row" />
            <RecordHistoryItem event={HISTORY[2]} variant="row" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="RecordHistory" importPath="@/components/history" description="Agrupado por dia, do mais recente ao mais antigo, com filtro por tipo de evento.">
        <VariantGrid min="380px">
          <Variant label="Com filtro e carregar mais" p="0" bg="transparent" borderWidth="0">
            <RecordHistory headingAs="h4"
              events={HISTORY}
              filter={filter}
              onFilterChange={setFilter}
              hasMore
              onLoadMore={loadMore}
              loadingMore={loadingMore}
              now={NOW}
            />
          </Variant>
          <Variant label="Carregando" p="0" bg="transparent" borderWidth="0">
            <RecordHistory headingAs="h4" events={[]} loading now={NOW} />
          </Variant>
          <Variant label="Vazio" p="0" bg="transparent" borderWidth="0">
            <RecordHistory headingAs="h4" events={[]} now={NOW} />
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
