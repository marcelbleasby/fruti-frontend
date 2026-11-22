"use client";

import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { CatalogoFormularios } from "./catalogo-formularios";
import { CultivarDrawer, EspecieDrawer } from "./catalogo-drawers";

const TEXTOS = {
  especies: {
    titulo: "Espécies",
    descricao: "Catálogo comum a todas as propriedades.",
    acao: "Nova espécie",
  },
  cultivares: {
    titulo: "Cultivos",
    descricao: "Variedades de cada espécie.",
    acao: "Novo cultivo",
  },
} as const;

type Tela = keyof typeof TEXTOS;

/** Cabeçalho do catálogo + drawers (detalhe e formulários, pela URL). Criar/editar: só administração global. */
export function CatalogoCabecalho({ tela }: { tela: Tela }) {
  const url = useListaUrl();
  const { user } = useAuth();
  const admin = Boolean(user?.administradorGlobal);
  const t = TEXTOS[tela];

  const abrirNovo = () =>
    url.setFiltros(
      tela === "especies"
        ? { form: "especie", pagina: url.get("pagina") }
        : { form: "cultivar", especieAlvo: url.get("especie"), pagina: url.get("pagina") },
    );

  return (
    <>
      <PageHeader
        hideBelow="md"
        title={t.titulo}
        description={t.descricao}
        actions={
          admin ? (
            <Button onClick={abrirNovo}>
              <Plus aria-hidden /> {t.acao}
            </Button>
          ) : undefined
        }
      />
      {admin ? (
        <Button hideFrom="md" w="full" onClick={abrirNovo}>
          <Plus aria-hidden /> {t.acao}
        </Button>
      ) : null}
      {tela === "especies" ? <EspecieDrawer /> : <CultivarDrawer />}
      <CatalogoFormularios abrirCultivarSalva={tela === "cultivares"} />
    </>
  );
}

export function CatalogoCabecalhoEstatico({ tela }: { tela: Tela }) {
  const t = TEXTOS[tela];
  return <PageHeader hideBelow="md" title={t.titulo} description={t.descricao} />;
}
