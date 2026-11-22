"use client";

import { Box, Flex } from "@chakra-ui/react";
import { usePathname, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { useAuth } from "@/lib/auth/auth-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { SpeciesList, type SpeciesListView } from "@/modules/species/components/species-list";
import type { Species } from "@/modules/types";

/** Lista de espécies (SpeciesList do DS) ligada à URL: busca, visualização, página e situação. */
export function EspeciesLista({
  especies,
  total,
  pagina,
  tamanhoDaPagina,
}: {
  especies: Species[];
  total: number;
  pagina: number;
  tamanhoDaPagina: number;
}) {
  const url = useListaUrl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const admin = Boolean(user?.administradorGlobal);
  const busca = url.get("busca") ?? "";
  const situacao = url.get("situacao") ?? "ativas";
  const view: SpeciesListView = url.get("visao") === "grade" ? "grid" : "table";

  // Abre o drawer mantendo filtros/página (o DS usa link; o detalhe lê `?especie=`).
  const hrefDe = (s: Species) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("especie", s.id);
    return `${pathname}?${sp.toString()}`;
  };

  return (
    <Flex direction="column" gap="3">
      {admin ? (
        <Box alignSelf="flex-start">
          <SegmentedControl
            label="Situação"
            items={[
              { value: "ativas", label: "Ativas" },
              { value: "inativas", label: "Inativas" },
              { value: "todas", label: "Todas" },
            ]}
            value={situacao}
            onValueChange={(v) => url.setFiltros({ situacao: !v || v === "ativas" ? null : v })}
          />
        </Box>
      ) : null}
      <Box opacity={url.isPending ? 0.6 : 1} transition="opacity 150ms ease" aria-busy={url.isPending}>
        <SpeciesList
          items={especies}
          total={total}
          view={view}
          onViewChange={(v) => url.setFiltros({ visao: v === "grid" ? "grade" : null, pagina: url.get("pagina") })}
          onSearch={(q) => url.setFiltros({ busca: q.trim() || null })}
          searchDefaultValue={busca}
          searching={url.isPending}
          pagination={{ page: pagina, pageSize: tamanhoDaPagina, total }}
          onPageChange={(p) => url.setFiltros({ pagina: p > 1 ? String(p) : null })}
          getHref={hrefDe}
          // A API não tem foto de espécie: sem a área "Sem foto", os cards ficam compactos.
          showImages={false}
          countSuffix={busca ? `para “${busca}”` : "no catálogo global"}
          emptyTitle={
            busca
              ? `Nenhuma espécie para “${busca}”`
              : situacao === "inativas"
                ? "Nenhuma espécie inativa"
                : "Nenhuma espécie no catálogo"
          }
          emptyDescription={
            busca
              ? "Tente o nome científico, como Mangifera indica."
              : situacao === "inativas"
                ? "Espécies inativas aparecem aqui."
                : admin
                ? "Cadastre a primeira espécie para usá-la em plantios."
                : "A administração do Fruti ainda não cadastrou espécies."
          }
        />
      </Box>
    </Flex>
  );
}
