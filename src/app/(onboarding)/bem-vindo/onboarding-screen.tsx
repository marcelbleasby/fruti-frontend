"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LandPlot, ShieldCheck, Sprout } from "lucide-react";
import { AuthLayout, SessionCheck } from "@/components/auth";
import { useAuth } from "@/lib/auth/auth-context";
import { HOME_ROUTE } from "@/lib/auth/routes";
import { createPropriedadeAction } from "@/lib/propriedades/actions";
import { usePropriedade } from "@/lib/propriedades/propriedade-context";
import { PropriedadeOnboardingForm, type PropriedadeOnboardingValues } from "@/modules/propriedades";
import { NotificationToast } from "@/components/feedback/notification-toast";

const FEATURES = [
  { icon: LandPlot, label: "Áreas de cultivo, como estufas e setores" },
  { icon: Sprout, label: "Plantios, colheitas e ocorrências" },
  { icon: ShieldCheck, label: "Dados separados por propriedade" },
];

export function OnboardingScreen() {
  const router = useRouter();
  const { user, logout, expireSession } = useAuth();
  const { status, propriedades } = usePropriedade();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Já tem propriedade (voltou para cá pelo histórico, outra aba…): segue para o painel.
  const jaTem = status === "ready" && propriedades.length > 0;
  useEffect(() => {
    if (jaTem) router.replace(HOME_ROUTE);
  }, [jaTem, router]);

  if (status === "loading" || jaTem || done) {
    return <SessionCheck label={done ? "Abrindo sua propriedade…" : "Carregando…"} />;
  }

  async function handleSubmit(values: PropriedadeOnboardingValues) {
    setError(null);
    const result = await createPropriedadeAction(values);
    switch (result.status) {
      case "ok":
        setDone(true);
        NotificationToast.success({
          title: "Propriedade cadastrada",
          description: "Comece pelas áreas de cultivo.",
        });
        router.replace(HOME_ROUTE);
        return;
      case "invalid":
        return result.fields;
      case "unauthenticated":
        expireSession();
        return;
      default:
        setError(result.message);
    }
  }

  return (
    <AuthLayout headline="Tudo no Fruti começa pela sua propriedade." features={FEATURES}>
      <PropriedadeOnboardingForm
        userName={user?.nome.trim().split(/\s+/)[0] || undefined}
        onSubmit={handleSubmit}
        error={error ?? (status === "unavailable" ? "Não foi possível carregar suas propriedades. Recarregue a página." : null)}
        onSignOut={() => void logout()}
      />
    </AuthLayout>
  );
}
