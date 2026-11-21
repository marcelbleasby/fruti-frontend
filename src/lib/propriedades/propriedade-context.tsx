"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getPropriedadesAction, selectPropriedadeAction, type PropriedadesResult } from "./actions";
import type { Propriedade } from "./server";

export type { Propriedade } from "./server";

export interface PropriedadeContextValue {
  status: "loading" | "ready" | "unavailable";
  propriedades: Propriedade[];
  ativa: Propriedade | null;
  /** Troca a propriedade ativa (cookie no servidor) e recarrega os dados da página. */
  selecionar: (id: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

const PropriedadeContext = createContext<PropriedadeContextValue | null>(null);

export const PAPEL_LABEL: Record<string, string> = { proprietario: "Proprietário" };

export function PropriedadeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { expireSession } = useAuth();
  const [status, setStatus] = useState<PropriedadeContextValue["status"]>("loading");
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [ativaId, setAtivaId] = useState<string | null>(null);

  function apply(result: PropriedadesResult) {
    if (result.status === "ok") {
      setPropriedades(result.propriedades);
      setAtivaId(result.ativaId);
      setStatus("ready");
    } else if (result.status === "unauthenticated") {
      expireSession();
    } else {
      setStatus("unavailable");
    }
  }

  async function recarregar() {
    apply(await getPropriedadesAction());
  }

  async function selecionar(id: string) {
    if (id === ativaId) return;
    const anterior = ativaId;
    setAtivaId(id); // otimista: o seletor muda na hora
    const { ok } = await selectPropriedadeAction(id);
    if (!ok) {
      setAtivaId(anterior);
      return;
    }
    router.refresh();
  }

  useEffect(() => {
    void getPropriedadesAction().then(apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na montagem
  }, []);

  const value: PropriedadeContextValue = {
    status,
    propriedades,
    ativa: propriedades.find((p) => p.id === ativaId) ?? null,
    selecionar,
    recarregar,
  };

  return <PropriedadeContext value={value}>{children}</PropriedadeContext>;
}

export function usePropriedade(): PropriedadeContextValue {
  const ctx = use(PropriedadeContext);
  if (!ctx) throw new Error("usePropriedade precisa estar dentro de <PropriedadeProvider>.");
  return ctx;
}
