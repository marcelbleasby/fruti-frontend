"use client";

import { useState } from "react";
import { CultivarCard, CultivarDetails, CultivarList, CultivarSelector } from "@/modules/cultivars";
import { SpeciesCard, SpeciesDetails, SpeciesList, type SpeciesListView, SpeciesSelector } from "@/modules/species";
import type { SpeciesRef } from "@/modules/types";
import { CULTIVARS, PLANTING_REFS, SPECIES } from "../fixtures";
import { Demo, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const MANGA = SPECIES[0];
const MANGA_REF: SpeciesRef = { id: MANGA.id, name: MANGA.name, scientificName: MANGA.scientificName };
const MANGA_CULTIVARS = CULTIVARS.filter((c) => c.speciesId === MANGA.id);
const speciesHref = (s: { id: string }) => `#especie-${s.id}`;

export function CatalogoSection() {
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [speciesFilled, setSpeciesFilled] = useState<string | null>(MANGA.id);
  const [created, setCreated] = useState<string | null>(null);

  const [cvSpecies, setCvSpecies] = useState<string | null>(MANGA.id);
  const [cultivarId, setCultivarId] = useState<string | null>("cv-tommy");
  const [cvNotice, setCvNotice] = useState<string | null>(null);

  const [view, setView] = useState<SpeciesListView>("table");
  const [page, setPage] = useState(1);
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesRef | null>(MANGA_REF);

  return (
    <ShowcaseSection
      id="catalogo"
      title="Cultivos"
      description="Catálogo global (módulos 6.1 e 6.2). Toda cultivar pertence a uma espécie; a interface respeita essa dependência."
    >
      <Demo name="SpeciesSelector" importPath="@/modules/species" description="Busca por nome popular ou científico; o nome científico fica sempre visível.">
        <VariantGrid>
          <Variant label="Vazio · cadastro permitido">
            <SpeciesSelector
              label="Espécie"
              required
              species={SPECIES}
              value={speciesId}
              onChange={(id) => setSpeciesId(id)}
              allowCreate
              onCreate={(q) => setCreated(q)}
              helperText={created ? `Cadastrar “${created}” (simulado)` : "Digite “Pitaia” para ver o estado sem resultado."}
            />
          </Variant>
          <Variant label="Com valor">
            <SpeciesSelector label="Espécie" required species={SPECIES} value={speciesFilled} onChange={(id) => setSpeciesFilled(id)} />
          </Variant>
          <Variant label="Erro · obrigatório">
            <SpeciesSelector label="Espécie" required species={SPECIES} value={null} errorText="Escolha a espécie do plantio." />
          </Variant>
          <Variant label="Desabilitado">
            <SpeciesSelector label="Espécie" species={SPECIES} value={MANGA.id} disabled />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SpeciesCard" importPath="@/modules/species" description="O card inteiro é um único link.">
        <VariantGrid min="240px">
          {SPECIES.slice(0, 3).map((s) => (
            <SpeciesCard headingAs="h4" key={s.id} species={s} href={speciesHref(s)} />
          ))}
        </VariantGrid>
      </Demo>

      <Demo name="SpeciesDetails" importPath="@/modules/species">
        <SpeciesDetails headingAs="h4"
          species={MANGA}
          relatedCultivars={MANGA_CULTIVARS}
          plantingsHref="#plantios"
          getCultivarHref={(c) => `#cultivar-${c.id}`}
          onEdit={() => undefined}
        />
      </Demo>

      <Demo name="SpeciesList" importPath="@/modules/species" description="Tabela no desktop (cards no mobile) ou grade.">
        <Variant label={`view ${view} · busca e paginação`} p="0" bg="transparent" borderWidth="0">
          <SpeciesList
            items={SPECIES.slice(0, 4)}
            total={12}
            view={view}
            onViewChange={setView}
            onSearch={() => undefined}
            pagination={{ page, pageSize: 4, total: 12 }}
            onPageChange={setPage}
            getHref={speciesHref}
          />
        </Variant>
        <VariantGrid min="640px">
          <Variant label="Carregando" p="0" bg="transparent" borderWidth="0">
            <SpeciesList items={[]} loading getHref={speciesHref} />
          </Variant>
          <Variant label="Erro" p="0" bg="transparent" borderWidth="0">
            <SpeciesList items={[]} error onRetry={() => undefined} getHref={speciesHref} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo
        name="CultivarSelector"
        importPath="@/modules/cultivars"
        description="Desabilitado, com explicação, até haver espécie. Ao trocar a espécie, a cultivar escolhida é limpa (reason “species-change”)."
      >
        <VariantGrid>
          <Variant label="Sem espécie">
            <CultivarSelector label="Cultivar" speciesId={null} cultivars={CULTIVARS} />
          </Variant>
          <Variant label="Com espécie · troca limpa a cultivar">
            <SpeciesSelector
              label="Espécie"
              species={SPECIES}
              value={cvSpecies}
              onChange={(id) => setCvSpecies(id)}
              fieldProps={{ mb: "4" }}
            />
            <CultivarSelector
              label="Cultivar"
              speciesId={cvSpecies}
              cultivars={CULTIVARS}
              value={cultivarId}
              onChange={(id, _c, reason) => {
                setCultivarId(id);
                setCvNotice(reason === "species-change" ? "A cultivar foi removida porque a espécie mudou." : null);
              }}
              helperText={cvNotice ?? undefined}
            />
          </Variant>
          <Variant label="Sem opção “nenhuma” (allowNone false)">
            <CultivarSelector label="Cultivar" speciesId={MANGA.id} cultivars={CULTIVARS} allowNone={false} optional={false} required />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="CultivarCard" importPath="@/modules/cultivars">
        <VariantGrid min="260px">
          <CultivarCard headingAs="h4" cultivar={MANGA_CULTIVARS[0]} species={MANGA_REF} href="#cultivar" description="Origem: Flórida, EUA. Usada nos plantios das áreas A-03 e A-04." />
          <CultivarCard headingAs="h4" cultivar={MANGA_CULTIVARS[2]} species={MANGA_REF} />
        </VariantGrid>
      </Demo>

      <Demo name="CultivarDetails" importPath="@/modules/cultivars">
        <CultivarDetails headingAs="h4"
          cultivar={{ ...MANGA_CULTIVARS[0], characteristics: "Registre aqui atributos agronômicos relevantes para o manejo." }}
          species={MANGA_REF}
          plantings={PLANTING_REFS}
          speciesHref="#especie"
          getPlantingHref={(p) => `#${p.code}`}
          onEdit={() => undefined}
        />
      </Demo>

      <Demo name="CultivarList" importPath="@/modules/cultivars" description="A lista sempre mostra qual espécie está filtrando.">
        <VariantGrid min="340px">
          <Variant label="Filtrada por espécie" p="0" bg="transparent" borderWidth="0">
            <CultivarList
              items={speciesFilter ? CULTIVARS.filter((c) => c.speciesId === speciesFilter.id) : CULTIVARS}
              speciesFilter={speciesFilter}
              onSpeciesFilterChange={setSpeciesFilter}
              getHref={(c) => `#cultivar-${c.id}`}
            />
          </Variant>
          <Variant label="Vazia" p="0" bg="transparent" borderWidth="0">
            <CultivarList items={[]} speciesFilter={{ id: "sp-mamao", name: "Mamão" }} onSpeciesFilterChange={() => undefined} />
          </Variant>
          <Variant label="Carregando" p="0" bg="transparent" borderWidth="0">
            <CultivarList items={[]} loading />
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
