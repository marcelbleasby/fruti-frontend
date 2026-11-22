"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Estado de uma tela de lista na URL (links compartilháveis, voltar funciona).
 *
 * - Filtros/página/ordem: `router.replace` numa transição → o Server Component
 *   da lista busca de novo; `isPending` serve para esmaecer a tabela.
 * - Drawers (`?lote=`, `?processamento=`, `?registrar=1`): só `history.pushState`
 *   (o Next sincroniza o useSearchParams), para abrir sem recarregar a lista.
 */
export function useListaUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function hrefCom(mudancas: Record<string, string | null | undefined>, { manterPagina = false } = {}) {
    // Só roda em handlers: lê a URL atual (não a do último render), para chamadas em sequência
    // (fechar um drawer e abrir outro) não se atropelarem.
    const sp = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(mudancas)) {
      if (v === null || v === undefined || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    if (!manterPagina && !("pagina" in mudancas)) sp.delete("pagina");
    const s = sp.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  /** Muda filtros (volta para a página 1, a não ser que `pagina` venha junto). */
  function setFiltros(mudancas: Record<string, string | null | undefined>) {
    startTransition(() => router.replace(hrefCom(mudancas), { scroll: false }));
  }

  function limparFiltros(chaves: string[]) {
    setFiltros(Object.fromEntries(chaves.map((k) => [k, null])));
  }

  const loteAberto = searchParams.get("lote");

  function abrirLote(id: string) {
    window.history.pushState(null, "", hrefCom({ lote: id }, { manterPagina: true }));
  }

  function fecharLote() {
    window.history.pushState(null, "", hrefCom({ lote: null }, { manterPagina: true }));
  }

  /** Drawer "Registrar entrada" (`?registrar=1`): botão do cabeçalho e do estado vazio abrem o mesmo. */
  const entradaAberta = searchParams.get("registrar") === "1";
  function abrirEntrada() {
    window.history.pushState(null, "", hrefCom({ registrar: "1" }, { manterPagina: true }));
  }
  function fecharEntrada() {
    window.history.pushState(null, "", hrefCom({ registrar: null }, { manterPagina: true }));
  }

  /** Drawer genérico por parâmetro (ex.: `processamento`). */
  function aberto(param: string) {
    return searchParams.get(param);
  }
  function abrir(param: string, valor = "1") {
    window.history.pushState(null, "", hrefCom({ [param]: valor }, { manterPagina: true }));
  }
  function fechar(param: string) {
    window.history.pushState(null, "", hrefCom({ [param]: null }, { manterPagina: true }));
  }

  /** Recarrega a lista (depois de criar/movimentar/excluir). */
  function recarregar() {
    startTransition(() => router.refresh());
  }

  return {
    get: (k: string) => searchParams.get(k),
    setFiltros,
    limparFiltros,
    isPending,
    loteAberto,
    abrirLote,
    fecharLote,
    entradaAberta,
    abrirEntrada,
    fecharEntrada,
    aberto,
    abrir,
    fechar,
    recarregar,
  };
}
